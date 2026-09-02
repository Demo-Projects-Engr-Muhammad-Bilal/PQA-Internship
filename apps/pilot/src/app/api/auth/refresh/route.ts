import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-middleware";
import { PilotAuthService, buildApiResponse } from "@repo/services";
import { refreshTokenSchema } from "@repo/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = refreshTokenSchema.parse(body);
    const result = await PilotAuthService.refreshAccessToken(
      refreshToken,
      request.headers.get("user-agent") ?? undefined,
      (request as any).ip ?? undefined
    );
    return NextResponse.json(
      buildApiResponse(result, "Token refreshed successfully"),
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
