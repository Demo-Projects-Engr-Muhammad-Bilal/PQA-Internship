/**
 * HttpOnly cookie implementation — tokens are set server-side by the
 * login/refresh API routes and sent automatically by the browser on every
 * request. Client-side JavaScript cannot read them, which eliminates
 * XSS token-exfiltration attacks.
 *
 * The storage methods are intentional no-ops:
 *   - setTokens  → server route sets the HttpOnly cookie
 *   - clearTokens → client calls POST /api/auth/logout; the server clears the cookie
 *   - getAccessToken / getRefreshToken → not readable from JS (HttpOnly); return null
 */
export interface TokenStorage {
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
  setTokens(accessToken: string, refreshToken?: string): void;
  clearTokens(): void;
}

// StoragePrefix kept for backward-compat with HttpClientConfig — no longer used internally
export type { StoragePrefix } from "./types";

export const createTokenStorage = (): TokenStorage => {
  return {
    // HttpOnly cookies are invisible to JavaScript — return null so interceptors
    // that check for a token treat the session as "managed by the server".
    getAccessToken: () => null,
    getRefreshToken: () => null,

    // no-op: the server sets HttpOnly cookies in the login/refresh route response
    setTokens: () => {
      /* HttpOnly cookies are set server-side — no client action needed */
    },

    // no-op: call POST /api/auth/logout instead; that route clears the cookie
    clearTokens: () => {
      /* Cookie clearing happens server-side via the logout route */
    },
  };
};
