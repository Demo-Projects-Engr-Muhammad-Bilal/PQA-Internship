import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { JWTPayload } from "@repo/types";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.length < 32) {
    throw new Error(
      `${name} must be set to a strong secret (>=32 chars) in every environment. Refusing to boot with a weak/missing secret.`
    );
  }
  return value;
}

const ACCESS_TOKEN_SECRET = requireEnv("JWT_ACCESS_SECRET");
const REFRESH_TOKEN_SECRET = requireEnv("JWT_REFRESH_SECRET");
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
