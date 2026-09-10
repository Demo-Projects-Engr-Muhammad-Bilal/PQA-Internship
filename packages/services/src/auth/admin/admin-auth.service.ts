import { db } from "@repo/db";
import {
  AdminRegisterInput,
  LoginInput,
  AuthResponse,
  JWTPayload,
  CreatePilotInput,
  AdminResetPilotPasswordInput,
  TogglePilotStatusInput,
  UpdateAdminProfileInput,
  ChangePasswordInput,
} from "@repo/types";
import { AuthCrypto } from "../jwtUtils/jwt.utils";
import { AuthError } from "../../errors/auth.error";
import crypto from "crypto";
import { Resend } from "resend";

export class AdminAuthService {
  private static instance: AdminAuthService;

  private constructor() {}

  public static getInstance(): AdminAuthService {
    if (!AdminAuthService.instance) {
      AdminAuthService.instance = new AdminAuthService();
    }
    return AdminAuthService.instance;
  }

  // Admin Self-Registration
  public async registerAdmin(
    input: AdminRegisterInput,
    userAgent?: string,
    ipAddress?: string
  ): Promise<AuthResponse> {
    const existingUser = await db.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new AuthError("EMAIL_EXISTS", "An account with this email already exists", 409);
    }

    const hashedPassword = await AuthCrypto.hashPassword(input.password);

    const user = await db.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashedPassword,
        role: "ADMIN",
        isActive: true,
      },
    });

    return this.generateAuthTokens(user, userAgent, ipAddress);
  }

  // Admin Login
  public async loginAdmin(
    input: LoginInput,
    userAgent?: string,
    ipAddress?: string
  ): Promise<AuthResponse> {
    const user = await db.user.findUnique({
      where: { email: input.email },
    });

    if (!user || user.role !== "ADMIN") {
      throw new AuthError("INVALID_CREDENTIALS", "Invalid admin credentials", 401);
    }

    if (!user.isActive) {
      throw new AuthError("ACCOUNT_DEACTIVATED", "Account has been deactivated", 403);
    }

    const isPasswordValid = await AuthCrypto.comparePassword(
      input.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new AuthError("INVALID_CREDENTIALS", "Invalid admin credentials", 401);
    }

    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.generateAuthTokens(user, userAgent, ipAddress);
  }

  // --- NEW: FORGOT & RESET PASSWORD FLOW ---

  public async forgotPassword(email: string): Promise<{ message: string }> {
    const admin = await db.user.findUnique({
      where: { email },
    });

    // Security practice: Return success even if email doesn't exist
    if (!admin || admin.role !== "ADMIN") {
      return { message: "If this email is registered, a secure reset link has been sent." };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const expireTime = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    await db.user.update({
      where: { id: admin.id },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpire: expireTime,
      },
    });

    const frontendUrl = process.env.ADMIN_FRONTEND_URL || "http://localhost:3001";
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;


    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "onboarding@resend.dev", // Change this when you have a verified domain
      to: admin.email,
      subject: "Admin Portal - Password Reset Request",
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your Admin account.</p>
        <p>Please click the link below to set a new password. This link is valid for 15 minutes.</p>
        <a href="${resetUrl}" style="padding: 10px 20px; background-color: #eab308; color: #000; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    return { message: "If this email is registered, a secure reset link has been sent." };
  }

  public async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const admin = await db.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpire: {
          gt: new Date(),
        },
        role: "ADMIN",
      },
    });

    if (!admin) {
      throw new AuthError("INVALID_RESET_TOKEN", "Invalid or expired reset token.", 400);
    }

    const hashedPassword = await AuthCrypto.hashPassword(newPassword);

    await db.user.update({
      where: { id: admin.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpire: null,
      },
    });

    // Revoke all existing sessions to enforce security after password change
    await db.refreshToken.updateMany({
      where: { userId: admin.id },
      data: { isRevoked: true },
    });

    return { message: "Password has been reset successfully. Previous sessions revoked." };
  }

  // --- ADMIN SELF ACCOUNT MANAGEMENT ---
  // 1. Update Profile (Name/Email)
  public async updateProfile(adminId: string, input: UpdateAdminProfileInput) {
    if (input.email) {
      const existing = await db.user.findFirst({
        where: { email: input.email, NOT: { id: adminId } },
      });
      if (existing) throw new AuthError("EMAIL_TAKEN", "Email already taken by another account", 409);
    }

    return db.user.update({
      where: { id: adminId },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.email ? { email: input.email } : {}),
      },
      select: { id: true, name: true, email: true, role: true, updatedAt: true },
    });
  }

  // 2. Change Password (Self)
  public async changePassword(adminId: string, input: ChangePasswordInput) {
    const user = await db.user.findUnique({ where: { id: adminId } });
    if (!user) throw new AuthError("ADMIN_NOT_FOUND", "Admin not found", 404);

    const isMatch = await AuthCrypto.comparePassword(input.oldPassword, user.password);
    if (!isMatch) throw new AuthError("INVALID_PASSWORD", "Current password is incorrect", 400);

    const hashedPassword = await AuthCrypto.hashPassword(input.newPassword);
    await db.user.update({
      where: { id: adminId },
      data: { password: hashedPassword },
    });

    await db.refreshToken.updateMany({
      where: { userId: adminId },
      data: { isRevoked: true },
    });

    return { message: "Password updated successfully. Other sessions logged out." };
  }

  // 3. Get Active Device Sessions
  public async getActiveSessions(adminId: string) {
    return db.refreshToken.findMany({
      where: { userId: adminId, isRevoked: false, expiresAt: { gt: new Date() } },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // 4. Revoke Specific Device Session
  public async revokeSession(adminId: string, sessionId: string) {
    const session = await db.refreshToken.findFirst({
      where: { id: sessionId, userId: adminId },
    });
    if (!session) throw new AuthError("SESSION_NOT_FOUND", "Session not found", 404);

    await db.refreshToken.update({
      where: { id: sessionId },
      data: { isRevoked: true },
    });

    return { message: "Session revoked successfully" };
  }

  // 5. Logout from All Other Devices
  public async revokeAllOtherSessions(adminId: string, currentRefreshToken?: string) {
    let currentHash = "";
    if (currentRefreshToken) {
      currentHash = AuthCrypto.hashToken(currentRefreshToken);
    }

    await db.refreshToken.updateMany({
      where: {
        userId: adminId,
        isRevoked: false,
        ...(currentHash ? { NOT: { tokenHash: currentHash } } : {}),
      },
      data: { isRevoked: true },
    });

    return { message: "All other active sessions have been revoked" };
  }

  // --- PILOT LIFECYCLE MANAGEMENT (ADMIN ONLY) ---
  // 1. Create Pilot
  public async createPilot(input: CreatePilotInput) {
    const existing = await db.user.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      throw new AuthError("EMAIL_EXISTS", "User with this email already exists", 409);
    }

    const hashedPassword = await AuthCrypto.hashPassword(input.password);

    const pilot = await db.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashedPassword,
        role: "PILOT",
        isActive: true,
        signatureImage: input.signatureImage ?? null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        signatureImage: true,
        createdAt: true,
      },
    });

    return pilot;
  }

  // 2. Reset Pilot Password (Revokes all active sessions)
  public async resetPilotPassword(input: AdminResetPilotPasswordInput) {
    const pilot = await db.user.findUnique({
      where: { id: input.pilotId },
    });

    if (!pilot || pilot.role !== "PILOT") {
      throw new AuthError("PILOT_NOT_FOUND", "Pilot not found", 404);
    }

    const hashedPassword = await AuthCrypto.hashPassword(input.newPassword);

    await db.user.update({
      where: { id: input.pilotId },
      data: { password: hashedPassword },
    });

    await db.refreshToken.updateMany({
      where: { userId: input.pilotId },
      data: { isRevoked: true },
    });

    return { message: "Pilot password updated successfully. Active sessions revoked." };
  }

  // 3. Toggle Pilot Status (Activate / Deactivate)
  public async togglePilotStatus(input: TogglePilotStatusInput) {
    const pilot = await db.user.findUnique({
      where: { id: input.pilotId },
    });

    if (!pilot || pilot.role !== "PILOT") {
      throw new AuthError("PILOT_NOT_FOUND", "Pilot not found", 404);
    }

    const updated = await db.user.update({
      where: { id: input.pilotId },
      data: { isActive: input.isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!input.isActive) {
      await db.refreshToken.updateMany({
        where: { userId: input.pilotId },
        data: { isRevoked: true },
      });
    }

    return updated;
  }

  // 4. Get All Pilots
  public async getAllPilots() {
    return db.user.findMany({
      where: { role: "PILOT" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // Token Refresh Logic
  public async refreshAccessToken(
    refreshToken: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { userId } = AuthCrypto.verifyRefreshToken(refreshToken);
    const tokenHash = AuthCrypto.hashToken(refreshToken);

    const storedToken = await db.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (
      !storedToken ||
      storedToken.isRevoked ||
      storedToken.expiresAt < new Date() ||
      storedToken.userId !== userId
    ) {
      throw new AuthError("INVALID_REFRESH_TOKEN", "Invalid or expired refresh token", 401);
    }

    if (storedToken.user.role !== "ADMIN" || !storedToken.user.isActive) {
      throw new AuthError("UNAUTHORIZED_SESSION", "Unauthorized session", 401);
    }

    await db.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    const payload: JWTPayload = {
      userId: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
    };

    const newAccessToken = AuthCrypto.signAccessToken(payload);
    const newRefreshToken = AuthCrypto.signRefreshToken(storedToken.user.id);
    const newHash = AuthCrypto.hashToken(newRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db.refreshToken.create({
      data: {
        tokenHash: newHash,
        userId: storedToken.user.id,
        expiresAt,
        userAgent,
        ipAddress,
      },
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  // Helper: Token Generator & Session Storer
  private async generateAuthTokens(
    user: { id: string; email: string; name: string | null; role: "ADMIN" | "PILOT" },
    userAgent?: string,
    ipAddress?: string
  ): Promise<AuthResponse> {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = AuthCrypto.signAccessToken(payload);
    const refreshToken = AuthCrypto.signRefreshToken(user.id);
    const tokenHash = AuthCrypto.hashToken(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
        userAgent,
        ipAddress,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }
}
