"use client";

import { AuthContext, type AuthContextType, type Portal } from "@repo/ui";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import axios, { type AxiosInstance } from "axios";
import type { JWTPayload, Role } from "@repo/types";
import { createHttpClient, type HttpClient } from "@repo/http-client";







export interface AuthProviderProps {
  children: ReactNode;
  /** Backend base URL for this app, e.g. NEXT_PUBLIC_ADMIN_API_URL. */
  apiBaseUrl: string;
  /** Which portal this provider serves — scopes token storage and validates `login()` calls. */
  portal: Portal;
  /** Where `logout()` and an expired session send the user. Defaults to "/". */
  loginRedirectPath?: string;
}

interface LoginResponseData {
  user: { id: string; email: string; name: string | null; role: Role };
  accessToken: string;
  refreshToken?: string;
}

interface RefreshResponseData {
  accessToken: string;
  refreshToken?: string;
}

/** Decodes a JWT's payload without verifying it — verification happens server-side; this is only for reading `user` into UI state. */
function decodeJwtPayload(token: string): JWTPayload | null {
  try {
    const payloadSegment = token.split(".")[1];
    if (!payloadSegment) return null;
    const normalized = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(normalized)
        .split("")
        .map((char) => "%" + char.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json) as JWTPayload;
  } catch {
    return null;
  }
}

function extractErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message ?? err.message ?? fallback;
  }
  return err instanceof Error ? err.message : fallback;
}

export function AuthProvider({
  children,
  apiBaseUrl,
  portal,
  loginRedirectPath = "/",
}: AuthProviderProps) {
  const [user, setUser] = useState<JWTPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const client = useMemo<HttpClient>(
    () =>
      createHttpClient({ baseURL: apiBaseUrl, storagePrefix: portal }, () => {
        setUser(null);
        if (typeof window !== "undefined") {
          window.location.href = loginRedirectPath;
        }
      }),
    [apiBaseUrl, portal, loginRedirectPath]
  );

  // Hydrate user state from a token already in storage (page refresh, new tab, etc).
  useEffect(() => {
    const existingToken = client.tokenStorage.getAccessToken();
    setUser(existingToken ? decodeJwtPayload(existingToken) : null);
    setIsLoading(false);
  }, [client]);

  const clearError = useCallback(() => setError(null), []);

  const login = useCallback(
    async (email: string, password: string, loginPortal: Portal) => {
      if (loginPortal !== portal) {
        const mismatchMessage = `This portal only accepts ${portal} logins`;
        setError(mismatchMessage);
        throw new Error(mismatchMessage);
      }

      setError(null);
      setIsLoading(true);
            try {
        const { data } = await client.instance.post("/auth/login", {
          email,
          password,
        });

        const payload = data.data as LoginResponseData;
        client.tokenStorage.setTokens(payload.accessToken, payload.refreshToken);
        setUser({
          userId: payload.user.id,
          email: payload.user.email,
          role: payload.user.role,
        });
      } catch (err) {
        setError(extractErrorMessage(err, "Login failed. Please try again."));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client, portal]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await client.instance.post("/auth/logout");
    } catch {
      // Clear local state regardless — an unreachable backend shouldn't
      // trap the user in a "still logged in" UI.
    } finally {
      client.tokenStorage.clearTokens();
      setUser(null);
      setIsLoading(false);
      if (typeof window !== "undefined") {
        window.location.href = loginRedirectPath;
      }
    }
  }, [client, loginRedirectPath]);

  const refreshToken = useCallback(async () => {
    const storedRefreshToken = client.tokenStorage.getRefreshToken();
    if (!storedRefreshToken) {
      throw new Error("No refresh token available");
    }
    const { data } = await client.instance.post("/auth/refresh", {
      refreshToken: storedRefreshToken,
    });
    const tokens = data.data as RefreshResponseData;
    client.tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
    setUser(decodeJwtPayload(tokens.accessToken));
  }, [client]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      error,
      apiClient: client.instance,
      login,
      logout,
      refreshToken,
      clearError,
    }),
    [user, isLoading, error, client, login, logout, refreshToken, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
