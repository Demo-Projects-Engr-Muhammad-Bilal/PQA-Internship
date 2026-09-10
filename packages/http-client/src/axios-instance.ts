import axios, { type AxiosInstance } from "axios";
import type { HttpClientConfig } from "./types";
import { createTokenStorage, type TokenStorage } from "./token-storage";
import { setupRequestInterceptor } from "./interceptors/request.interceptor";
import { setupResponseInterceptor } from "./interceptors/response.interceptor";

export interface HttpClient {
  instance: AxiosInstance;
  tokenStorage: TokenStorage;
}

const DEFAULT_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24; // 1 day — matches the previous login-page cookie lifetime

/**
 * Builds an Axios instance scoped to one app (Admin or Pilot): its own
 * base URL, its own token storage, a request interceptor that attaches
 * the bearer token, and a response interceptor that transparently
 * refreshes on 401 and retries the original request.
 *
 * `onSessionExpired` fires when the refresh itself fails (refresh token
 * missing/expired/revoked) — callers typically clear UI state and
 * redirect to the login page from here.
 */
export const createHttpClient = (
  config: HttpClientConfig,
  onSessionExpired?: () => void
): HttpClient => {
  const tokenStorage = createTokenStorage();

  const instance = axios.create({
    baseURL: config.baseURL,
    headers: { "Content-Type": "application/json" },
  });

  setupRequestInterceptor(instance, tokenStorage);
  setupResponseInterceptor(instance, tokenStorage, onSessionExpired);

  return { instance, tokenStorage };
};
