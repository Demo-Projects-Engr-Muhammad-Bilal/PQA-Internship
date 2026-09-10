import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { handleApiError } from "@repo/services";
import { AdminAuthService, buildApiResponse } from "@repo/services";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("admin_refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "No refresh token" },
        { status: 401 }
      );
    }

    const adminService = AdminAuthService.getInstance();
    const result = await adminService.refreshAccessToken(
      refreshToken,
      request.headers.get("user-agent") ?? undefined,
      (request as any).ip ?? undefined
    );

    const isProd = process.env.NODE_ENV === "production";

    cookieStore.set("admin_access_token", result.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 15,
    });
    
    if (result.refreshToken) {
      cookieStore.set("admin_refresh_token", result.refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "strict",
        path: "/api/auth/refresh",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return NextResponse.json(
      buildApiResponse(result, "Token refreshed successfully"),
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
