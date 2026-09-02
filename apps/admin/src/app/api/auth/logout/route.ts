import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { LogoutService, buildApiResponse } from "@repo/services";
import { refreshTokenSchema } from "@repo/types";
import type { JWTPayload } from "@repo/types";

export const POST = withAuth(
  async (request: NextRequest, _user: JWTPayload) => {
    const body = await request.json();
    const { refreshToken } = refreshTokenSchema.parse(body);
    const result = await LogoutService.logout(refreshToken);
    return NextResponse.json(
      buildApiResponse(result, result.message),
      { status: 200 }
    );
  },
  ["ADMIN"]
);
