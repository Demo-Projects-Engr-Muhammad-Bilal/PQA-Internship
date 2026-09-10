import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { handleApiError } from "@repo/services";
import { AdminAuthService, buildApiResponse, authRateLimiter } from "@repo/services";
import { loginSchema } from "@repo/types";

export async function POST(request: NextRequest) {
    try {
    const ip = (request as any).ip ?? "127.0.0.1";
    if (authRateLimiter) {
      const { success } = await authRateLimiter.limit(ip);
      if (!success) {
        return NextResponse.json(
          { success: false, message: "Too many login attempts. Try again later." },
          { status: 429 }
        );
      }
    }

    const body = await request.json();
    const validatedData = loginSchema.parse(body);
    const adminService = AdminAuthService.getInstance();
    const result = await adminService.loginAdmin(
      validatedData,
      request.headers.get("user-agent") ?? undefined,
      (request as any).ip ?? undefined
    );

    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === "production";

    cookieStore.set("admin_access_token", result.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 15, // 15 minutes — matches JWT expiry
    });
    
    if (result.refreshToken) {
      cookieStore.set("admin_refresh_token", result.refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "strict",
        path: "/api/auth/refresh", // scope refresh token to the refresh endpoint only
        maxAge: 60 * 60 * 24 * 7, // 7 days — matches JWT expiry
      });
    }

    // Do NOT return raw tokens in the response body
    return NextResponse.json(
      buildApiResponse({ user: result.user }, "Login successful"),
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
