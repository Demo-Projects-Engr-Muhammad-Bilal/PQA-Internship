import type { AxiosInstance } from "axios";
import type { TokenStorage } from "../token-storage";

/** Attaches the stored access token to every outgoing request, when present. */
export const setupRequestInterceptor = (
  instance: AxiosInstance,
  tokenStorage: TokenStorage
): void => {
  instance.interceptors.request.use((config) => {
        const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  });
};
