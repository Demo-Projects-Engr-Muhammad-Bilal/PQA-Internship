import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { handleApiError } from "@repo/services";
import { PilotAuthService, buildApiResponse } from "@repo/services";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("pilot_refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "No refresh token" },
        { status: 401 }
      );
    }

    const result = await PilotAuthService.refreshAccessToken(
      refreshToken,
      request.headers.get("user-agent") ?? undefined,
      (request as any).ip ?? undefined
    );

    const isProd = process.env.NODE_ENV === "production";

    cookieStore.set("pilot_access_token", result.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 15,
    });
    
    if (result.refreshToken) {
      cookieStore.set("pilot_refresh_token", result.refreshToken, {
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
