import { db } from "@repo/db";
import { AuthCrypto } from "../jwtUtils/jwt.utils";

/**
 * Revokes the refresh-token session tied to the given refresh token.
 * Shared by both AdminApp and PilotApp — logout is the same operation
 * (invalidate one session row) regardless of role.
 *
 * Idempotent by design: a token that's already revoked or unknown still
 * returns success, since the end state the caller wants ("I am logged
 * out") is already true.
 */
export class LogoutService {
  public static async logout(refreshToken: string): Promise<{ message: string }> {
    const tokenHash = AuthCrypto.hashToken(refreshToken);

    await db.refreshToken.updateMany({
      where: { tokenHash, isRevoked: false },
      data: { isRevoked: true },
    });

    return { message: "Logged out successfully" };
  }
}
