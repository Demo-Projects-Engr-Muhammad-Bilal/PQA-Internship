import type { JWTPayload } from "@repo/types";

/**
 * `requireAuth` attaches the decoded JWT payload to `req.user`.
 * This augments Express's own `Request` interface so every route
 * handler across both backends gets `req.user` typed as
 * `JWTPayload | undefined` with no need for `req: any` or a
 * bespoke `AuthenticatedRequest` wrapper type.
 */
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export {};
