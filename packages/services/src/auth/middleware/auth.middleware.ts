import { Request, Response, NextFunction } from "express";
import { AuthCrypto } from "../jwtUtils/jwt.utils";
import { Role } from "@repo/types";
import { AuthError } from "../../errors/auth.error";

// Middleware: Authenticate JWT Access Token
export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers?.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next(new AuthError("MISSING_TOKEN", "Authorization token required", 401));
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = AuthCrypto.verifyAccessToken(token);
    (req as any).user = decoded;
    next();
  } catch {
    next(new AuthError("INVALID_TOKEN", "Invalid or expired authorization token", 401));
  }
};

// Middleware: Role-Based Authorization Guard
export const requireRole = (allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!(req as any).user) {
      next(new AuthError("UNAUTHORIZED", "Unauthorized", 401));
      return;
    }

    if (!allowedRoles.includes((req as any).user.role)) {
      next(
        new AuthError(
          "FORBIDDEN",
          `Forbidden: Access restricted to [${allowedRoles.join(", ")}]`,
          403
        )
      );
      return;
    }

    next();
  };
};
