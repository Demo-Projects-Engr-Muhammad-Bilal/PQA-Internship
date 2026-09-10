import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { LogoutService, buildApiResponse } from "@repo/services";

export async function POST(_request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("pilot_refresh_token")?.value;

    if (refreshToken) {
      await LogoutService.logout(refreshToken);
    }

    cookieStore.delete("pilot_access_token");
    cookieStore.delete("pilot_refresh_token");

    return NextResponse.json(
      buildApiResponse(null, "Logged out successfully"),
      { status: 200 }
    );
  } catch {
    // Even if the server-side logout fails, clear the cookies to end the session
    const cookieStore = await cookies();
    cookieStore.delete("pilot_access_token");
    cookieStore.delete("pilot_refresh_token");
    return NextResponse.json(
      buildApiResponse(null, "Logged out"),
      { status: 200 }
    );
  }
}
