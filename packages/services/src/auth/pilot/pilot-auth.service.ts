import { db } from "@repo/db";
import { LoginInput, AuthResponse, JWTPayload } from "@repo/types";
import { AuthCrypto } from "../jwtUtils/jwt.utils";
import { AuthError } from "../../errors/auth.error";

export class PilotAuthService {
  // Pilot Login
  public static async loginPilot(
    input: LoginInput,
    userAgent?: string,
    ipAddress?: string
  ): Promise<AuthResponse> {
    const user = await db.user.findUnique({
      where: { email: input.email },
    });

    // Check existence and role
    if (!user || user.role !== "PILOT") {
      throw new AuthError("INVALID_CREDENTIALS", "Invalid pilot credentials", 401);
    }

    // Check account status
    if (!user.isActive) {
      throw new AuthError(
        "ACCOUNT_DEACTIVATED",
        "Pilot account has been deactivated. Please contact admin.",
        403
      );
    }

    // Verify password
    const isPasswordValid = await AuthCrypto.comparePassword(
      input.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new AuthError("INVALID_CREDENTIALS", "Invalid pilot credentials", 401);
    }

    // Update last login timestamp
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.generateAuthTokens(user, userAgent, ipAddress);
  }

  // Pilot Refresh Token Rotation
  public static async refreshAccessToken(
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

    if (storedToken.user.role !== "PILOT" || !storedToken.user.isActive) {
      throw new AuthError("UNAUTHORIZED_SESSION", "Unauthorized session", 401);
    }

    // Revoke old token
    await db.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    // Generate new pair
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

  // Pilot Logout
  public static async logout(refreshToken: string): Promise<void> {
    const tokenHash = AuthCrypto.hashToken(refreshToken);
    await db.refreshToken.updateMany({
      where: { tokenHash },
      data: { isRevoked: true },
    });
  }

  // Update signature
  public static async updateSignature(userId: string, signatureImage: string) {
    return db.user.update({
      where: { id: userId },
      data: { signatureImage },
      select: { id: true, name: true, email: true, signatureImage: true },
    });
  }

  // Token Generation Helper
  private static async generateAuthTokens(
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
