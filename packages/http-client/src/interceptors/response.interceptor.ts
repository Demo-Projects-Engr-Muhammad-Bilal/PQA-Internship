import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import type { TokenStorage } from "../token-storage";
import type { RefreshTokenApiResponse, RetryableAxiosRequestConfig } from "../types";

type QueuedRequest = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

/**
 * On a 401, calls the backend `/api/auth/refresh` endpoint once, retries the
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
      const isRefreshCall = originalRequest?.url?.includes("/api/auth/refresh");

      if (!isUnauthorized || !originalRequest || originalRequest._retry || isRefreshCall) {
        throw error;
      }

      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) {
        tokenStorage.clearTokens();
        onSessionExpired?.();
        throw error;
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
          return instance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await instance.post<RefreshTokenApiResponse>("/api/auth/refresh", {
          refreshToken,
        });

        const tokens = data.data;
        if (!tokens?.accessToken) {
          throw error;
        }

        tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
        flushQueue(null, tokens.accessToken);

        originalRequest.headers.set("Authorization", `Bearer ${tokens.accessToken}`);
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
