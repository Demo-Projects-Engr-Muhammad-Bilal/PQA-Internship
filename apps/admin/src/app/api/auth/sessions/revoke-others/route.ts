import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { AdminAuthService, buildApiResponse } from "@repo/services";
import type { JWTPayload } from "@repo/types";

export const POST = withAuth(
  async (request: NextRequest, user: JWTPayload) => {
    const body = await request.json();
    const { refreshToken } = body;
    const adminService = AdminAuthService.getInstance();
    const result = await adminService.revokeAllOtherSessions(user.userId, refreshToken);
    return NextResponse.json(
      buildApiResponse(result, result.message),
      { status: 200 }
    );
  },
  ["ADMIN"]
);
