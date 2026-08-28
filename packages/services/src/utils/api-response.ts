import type { ApiResponse } from "@repo/types";

/**
 * Builds a successful `ApiResponse<T>` envelope. Failure responses are
 * never built by hand in a route — they always go through
 * `next(error)` and the centralized error-handling middleware instead.
 */
export const buildApiResponse = <T>(data?: T, message?: string): ApiResponse<T> => ({
  success: true,
  data,
  message,
  timestamp: new Date().toISOString(),
});
