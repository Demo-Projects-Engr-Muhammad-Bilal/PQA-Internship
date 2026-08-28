import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import type { ApiResponse } from "@repo/types";
import { AuthError } from "../../errors/auth.error";

/**
 * Single place that turns whatever a route/service throws into a
 * consistent `ApiResponse` envelope. Route handlers should catch
 * their own errors only to call `next(error)` — they should not
 * format a response themselves.
 *
 * Must be registered last, after all routes: `app.use(errorHandler)`.
 */
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response<ApiResponse>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  if (err instanceof AuthError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: err.issues[0]?.message ?? "Validation failed",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (err instanceof Error) {
    res.status(400).json({
      success: false,
      message: err.message,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
    timestamp: new Date().toISOString(),
  });
};

/**
 * Optional catch-all for unmatched routes, kept here so both
 * backends can register it the same way right before `errorHandler`.
 */
export const notFoundHandler = (req: Request, res: Response<ApiResponse>): void => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
  });
};
