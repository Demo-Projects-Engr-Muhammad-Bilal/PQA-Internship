import type { StoragePrefix } from "./types";

const isBrowser = (): boolean => typeof window !== "undefined";

export interface TokenStorage {
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
  setTokens(accessToken: string, refreshToken?: string): void;
  clearTokens(): void;
}

/**
 * Reads/writes the same localStorage keys and access-token cookie the
 * login pages already used (`${prefix}_access_token`, `${prefix}_refresh_token`).
 * Keeping the cookie in sync here means the Next.js middleware that
 * gates `/dashboard` keeps working without any changes.
 */
export const createTokenStorage = (
  prefix: StoragePrefix,
  cookieMaxAgeSeconds: number
): TokenStorage => {
  const accessKey = `${prefix}_access_token`;
  const refreshKey = `${prefix}_refresh_token`;

  const setCookie = (accessToken: string): void => {
    if (!isBrowser()) return;
    document.cookie = `${accessKey}=${accessToken}; path=/; max-age=${cookieMaxAgeSeconds}; SameSite=Lax`;
  };

  const clearCookie = (): void => {
    if (!isBrowser()) return;
    document.cookie = `${accessKey}=; path=/; max-age=0; SameSite=Lax`;
  };

  return {
    getAccessToken: () => (isBrowser() ? window.localStorage.getItem(accessKey) : null),
    getRefreshToken: () => (isBrowser() ? window.localStorage.getItem(refreshKey) : null),
    setTokens: (accessToken, refreshToken) => {
      if (!isBrowser()) return;
      window.localStorage.setItem(accessKey, accessToken);
      if (refreshToken) {
        window.localStorage.setItem(refreshKey, refreshToken);
      }
      setCookie(accessToken);
    },
    clearTokens: () => {
      if (!isBrowser()) return;
      window.localStorage.removeItem(accessKey);
      window.localStorage.removeItem(refreshKey);
      clearCookie();
    },
  };
};
