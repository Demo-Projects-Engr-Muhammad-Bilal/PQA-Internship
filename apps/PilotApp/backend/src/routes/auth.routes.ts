import { Router, Request, Response, NextFunction } from "express";
import {
  PilotAuthService,
  LogoutService,
  requireAuth,
  requireRole,
  buildApiResponse,
} from "@repo/services";
import { loginSchema, refreshTokenSchema } from "@repo/types";

export const pilotAuthRouter = Router();

// 1. Pilot Login
pilotAuthRouter.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await PilotAuthService.loginPilot(
        validatedData,
        req.headers["user-agent"],
        req.ip
      );
      res.status(200).json(buildApiResponse(result, "Login successful"));
    } catch (error) {
      next(error);
    }
  }
);

// 2. Pilot Token Refresh
pilotAuthRouter.post(
  "/refresh",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = refreshTokenSchema.parse(req.body);
      const result = await PilotAuthService.refreshAccessToken(
        refreshToken,
        req.headers["user-agent"],
        req.ip
      );
      res.status(200).json(buildApiResponse(result, "Token refreshed successfully"));
    } catch (error) {
      next(error);
    }
  }
);

// 3. Pilot Profile (Protected)
pilotAuthRouter.get(
  "/me",
  requireAuth,
  requireRole(["PILOT"]),
  (req: Request, res: Response): void => {
    res.status(200).json(buildApiResponse(req.user));
  }
);

// 4. Pilot Logout
pilotAuthRouter.post(
  "/logout",
  requireAuth,
  requireRole(["PILOT"]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = refreshTokenSchema.parse(req.body);
      const result = await LogoutService.logout(refreshToken);
      res.status(200).json(buildApiResponse(result, result.message));
    } catch (error) {
      next(error);
    }
  }
);
