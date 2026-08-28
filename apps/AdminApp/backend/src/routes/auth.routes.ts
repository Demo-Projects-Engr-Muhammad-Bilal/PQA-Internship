import { Router, Request, Response, NextFunction } from "express";
import {
  AdminAuthService,
  LogoutService,
  requireAuth,
  requireRole,
  buildApiResponse,
  AuthError,
} from "@repo/services";
import {
  adminRegisterSchema,
  loginSchema,
  refreshTokenSchema,
  createPilotSchema,
  adminResetPilotPasswordSchema,
  togglePilotStatusSchema,
  updateAdminProfileSchema,
  changePasswordSchema,
  revokeSessionSchema,
} from "@repo/types";

export const adminAuthRouter = Router();
const adminService = AdminAuthService.getInstance();

// ==========================================
// 1. AUTHENTICATION & SESSION LIFECYCLE
// ==========================================

// 1.1 Admin Register
adminAuthRouter.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = adminRegisterSchema.parse(req.body);
      const result = await adminService.registerAdmin(
        validatedData,
        req.headers["user-agent"],
        req.ip
      );
      res.status(201).json(buildApiResponse(result, "Admin registered successfully"));
    } catch (error) {
      next(error);
    }
  }
);

// 1.2 Admin Login
adminAuthRouter.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await adminService.loginAdmin(
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

// 1.3 Admin Token Refresh
adminAuthRouter.post(
  "/refresh",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = refreshTokenSchema.parse(req.body);
      const result = await adminService.refreshAccessToken(
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

// 1.4 Admin Logout
adminAuthRouter.post(
  "/logout",
  requireAuth,
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

// ==========================================
// 2. ADMIN PROFILE & SELF MANAGEMENT
// ==========================================

// 2.1 Get Admin Profile
adminAuthRouter.get(
  "/me",
  requireAuth,
  requireRole(["ADMIN"]),
  (req: Request, res: Response): void => {
    res.status(200).json(buildApiResponse(req.user));
  }
);

// 2.2 Update Admin Profile (Name / Email)
adminAuthRouter.patch(
  "/me",
  requireAuth,
  requireRole(["ADMIN"]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = updateAdminProfileSchema.parse(req.body);
      const updated = await adminService.updateProfile(req.user!.userId, validatedData);
      res.status(200).json(buildApiResponse(updated, "Profile updated successfully"));
    } catch (error) {
      next(error);
    }
  }
);

// 2.3 Change Password (Self)
adminAuthRouter.post(
  "/change-password",
  requireAuth,
  requireRole(["ADMIN"]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = changePasswordSchema.parse(req.body);
      const result = await adminService.changePassword(req.user!.userId, validatedData);
      res.status(200).json(buildApiResponse(result, result.message));
    } catch (error) {
      next(error);
    }
  }
);

// 2.4 Get Active Device Sessions
adminAuthRouter.get(
  "/sessions",
  requireAuth,
  requireRole(["ADMIN"]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sessions = await adminService.getActiveSessions(req.user!.userId);
      res.status(200).json(buildApiResponse(sessions));
    } catch (error) {
      next(error);
    }
  }
);

// 2.5 Revoke Specific Session
adminAuthRouter.delete(
  "/sessions/:sessionId",
  requireAuth,
  requireRole(["ADMIN"]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sessionId } = revokeSessionSchema.parse({ sessionId: req.params.sessionId });
      const result = await adminService.revokeSession(req.user!.userId, sessionId);
      res.status(200).json(buildApiResponse(result, result.message));
    } catch (error) {
      next(error);
    }
  }
);

// 2.6 Revoke All Other Sessions
adminAuthRouter.post(
  "/sessions/revoke-others",
  requireAuth,
  requireRole(["ADMIN"]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await adminService.revokeAllOtherSessions(
        req.user!.userId,
        req.body.refreshToken
      );
      res.status(200).json(buildApiResponse(result, result.message));
    } catch (error) {
      next(error);
    }
  }
);

// 1.6 Admin Forgot Password
adminAuthRouter.post(
  "/forgot-password",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      if (!email) {
        throw new AuthError("EMAIL_REQUIRED", "Email is required", 400);
      }

      const result = await adminService.forgotPassword(email);
      res.status(200).json(buildApiResponse(result, result.message));
    } catch (error) {
      next(error);
    }
  }
);

// 1.7 Admin Reset Password
adminAuthRouter.post(
  "/reset-password",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        throw new AuthError("MISSING_FIELDS", "Token and new password are required", 400);
      }

      const result = await adminService.resetPassword(token, newPassword);
      res.status(200).json(buildApiResponse(result, result.message));
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// 3. PILOT LIFECYCLE MANAGEMENT (ADMIN ONLY)
// ==========================================

// 3.1 Create Pilot
adminAuthRouter.post(
  "/pilots",
  requireAuth,
  requireRole(["ADMIN"]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = createPilotSchema.parse(req.body);
      const pilot = await adminService.createPilot(validatedData);
      res.status(201).json(buildApiResponse(pilot, "Pilot created successfully"));
    } catch (error) {
      next(error);
    }
  }
);

// 3.2 Get All Pilots
adminAuthRouter.get(
  "/pilots",
  requireAuth,
  requireRole(["ADMIN"]),
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pilots = await adminService.getAllPilots();
      res.status(200).json(buildApiResponse(pilots));
    } catch (error) {
      next(error);
    }
  }
);

// 3.3 Admin Reset Pilot Password
adminAuthRouter.post(
  "/pilots/reset-password",
  requireAuth,
  requireRole(["ADMIN"]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = adminResetPilotPasswordSchema.parse(req.body);
      const result = await adminService.resetPilotPassword(validatedData);
      res.status(200).json(buildApiResponse(result, result.message));
    } catch (error) {
      next(error);
    }
  }
);

// 3.4 Toggle Pilot Status
adminAuthRouter.patch(
  "/pilots/status",
  requireAuth,
  requireRole(["ADMIN"]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = togglePilotStatusSchema.parse(req.body);
      const updated = await adminService.togglePilotStatus(validatedData);
      res.status(200).json(buildApiResponse(updated, "Pilot status updated successfully"));
    } catch (error) {
      next(error);
    }
  }
);
