import { NextRequest, NextResponse } from "next/server";
import { AuthCrypto, apiRateLimiter } from "@repo/services";
import { AuthError } from "@repo/services";
import type { JWTPayload, Role } from "@repo/types";
import { ZodError } from "zod";

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Verifies JWT access token from Authorization header.
 * Throws AuthError if missing or invalid.
 */
export function extractAndVerifyToken(request: NextRequest): JWTPayload {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AuthError("MISSING_TOKEN", "Authorization token required", 401);
  }

  const token = authHeader.split(" ")[1];
  
  try {
    return AuthCrypto.verifyAccessToken(token);
  } catch {
    throw new AuthError("INVALID_TOKEN", "Invalid or expired authorization token", 401);
  }
}

/**
 * Verifies user role against allowed roles.
 * Throws AuthError if role mismatch.
 */
export function checkRole(user: JWTPayload, allowedRoles: Role[]): void {
  if (!allowedRoles.includes(user.role)) {
    throw new AuthError(
      "FORBIDDEN",
      `Forbidden: Access restricted to [${allowedRoles.join(", ")}]`,
      403
    );
  }
}

/**
 * Wraps a route handler with authentication and role checking.
 */
export function withAuth<T extends any[]>(
  handler: (request: NextRequest, user: JWTPayload, ...args: T) => Promise<NextResponse>,
  allowedRoles?: Role[]
) {
  return async (request: NextRequest, ...args: T) => {
    try {
      const user = extractAndVerifyToken(request);
      
      const ip = (request as any).ip ?? "127.0.0.1";
      if (apiRateLimiter) {
        const { success } = await apiRateLimiter.limit(`api_${user.userId}_${ip}`);
        if (!success) {
          return NextResponse.json(
            { success: false, message: "API rate limit exceeded.", timestamp: new Date().toISOString() },
            { status: 429 }
          );
        }
      }

      if (allowedRoles) {
        checkRole(user, allowedRoles);
      }
      
      return await handler(request, user, ...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Centralized error handler for API routes.
 * Converts errors to NextResponse with consistent ApiResponse envelope.
 */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        message: error.issues[0]?.message ?? "Validation failed",
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      message: "Internal server error",
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  );
}
