import type { AxiosInstance } from "axios";
import type { TokenStorage } from "../token-storage";

/** Attaches the stored access token to every outgoing request, when present. */
export const setupRequestInterceptor = (
  instance: AxiosInstance,
  tokenStorage: TokenStorage
): void => {
  instance.interceptors.request.use((config) => {
    console.log("3. HTTP Client executing request to:", config.baseURL, config.url);
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  });
};
