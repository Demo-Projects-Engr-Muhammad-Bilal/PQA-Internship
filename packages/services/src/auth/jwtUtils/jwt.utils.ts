import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { JWTPayload } from "@repo/types";

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || "default_access_secret_key_123";
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || "default_refresh_secret_key_456";

export class AuthCrypto {
  // Password hashing
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  // Password verification
  static async comparePassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }

  // Sign Access Token (15m expiry)
  static signAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
  }

  // Sign Refresh Token (7d expiry)
  static signRefreshToken(userId: string): string {
    return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
  }

  // Verify Access Token
  static verifyAccessToken(token: string): JWTPayload {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as JWTPayload;
  }

  // Verify Refresh Token
  static verifyRefreshToken(token: string): { userId: string } {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as { userId: string };
  }

  // SHA256 Token Hash for storing in DB
  static hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }
}
