import type { ApiResponse } from "@repo/types";

/**
 * Distinguishes which app's tokens/cookies a client instance owns.
 * AdminApp and PilotApp each keep their own localStorage keys and
 * access-token cookie (`${prefix}_access_token`), matching the
 * Next.js middleware in both frontends.
 */
export type StoragePrefix = "admin" | "pilot";

export interface HttpClientConfig {
  /** Base URL of the backend this client talks to, e.g. NEXT_PUBLIC_ADMIN_API_URL. */
  baseURL: string;
  /** Which app owns this client's stored tokens ("admin" | "pilot"). */
  storagePrefix: StoragePrefix;
  /** Access-token cookie lifetime in seconds. Defaults to 1 day. */
  cookieMaxAgeSeconds?: number;
}

export interface RefreshTokenPayload {
  accessToken: string;
  refreshToken?: string;
}

export type RefreshTokenApiResponse = ApiResponse<RefreshTokenPayload>;

/** Marks a request as already retried once, so the 401 handler doesn't loop forever. */
export interface RetryableAxiosRequestConfig {
  _retry?: boolean;
}
