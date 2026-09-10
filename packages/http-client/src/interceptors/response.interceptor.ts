import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import type { TokenStorage } from "../token-storage";
import type { RefreshTokenApiResponse, RetryableAxiosRequestConfig } from "../types";

type QueuedRequest = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

/**
 * On a 401, calls the backend `/auth/refresh` endpoint once, retries the
 * original request with the new access token, and queues any other requests
 * that 401'd while the refresh was in flight so they don't each trigger their
 * own refresh call.
 */
export const setupResponseInterceptor = (
  instance: AxiosInstance,
  tokenStorage: TokenStorage,
  onSessionExpired?: () => void
): void => {
  let isRefreshing = false;
  let pendingQueue: QueuedRequest[] = [];

  const flushQueue = (error: unknown, token: string | null): void => {
    pendingQueue.forEach(({ resolve, reject }) => {
      if (error || !token) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    pendingQueue = [];
  };

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as
        | (InternalAxiosRequestConfig & RetryableAxiosRequestConfig)
        | undefined;

      const isUnauthorized = error.response?.status === 401;
      const isRefreshCall = originalRequest?.url?.includes("/auth/refresh");
      const isLoginCall = originalRequest?.url?.includes("/auth/login");

      if (!isUnauthorized || !originalRequest || originalRequest._retry || isRefreshCall || isLoginCall) {
        throw error;
      }

      if (isRefreshing) {
        return new Promise<void>((resolve, reject) => {
          pendingQueue.push({ resolve: resolve as unknown as (token: string) => void, reject });
        }).then(() => {
          return instance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // With HttpOnly cookies, the browser sends the refresh token automatically.
        // No body needed — the server reads the cookie.
        const { data } = await instance.post<RefreshTokenApiResponse>("/auth/refresh");

        const tokens = data.data;
        if (!tokens?.accessToken) {
          throw error;
        }

        // setTokens is a no-op (server already set the new HttpOnly cookies in the response)
        tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
        flushQueue(null, tokens.accessToken);

        return instance(originalRequest);
      } catch (refreshError) {
        flushQueue(refreshError, null);
        tokenStorage.clearTokens();
        onSessionExpired?.();
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    }
  );
};
