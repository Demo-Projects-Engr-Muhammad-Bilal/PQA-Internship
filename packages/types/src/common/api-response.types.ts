/**
 * Standard response envelope returned by every backend endpoint
 * (AdminApp and PilotApp alike). Keeping one shape across the
 * monorepo means the frontend only ever has to unwrap `data`.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
}
