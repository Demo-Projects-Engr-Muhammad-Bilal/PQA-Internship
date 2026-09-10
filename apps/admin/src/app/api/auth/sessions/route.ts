import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@repo/services";
import { AdminAuthService, buildApiResponse } from "@repo/services";
import type { JWTPayload } from "@repo/types";

export const GET = withAuth(
  async (_request: NextRequest, user: JWTPayload) => {
    const adminService = AdminAuthService.getInstance();
    const sessions = await adminService.getActiveSessions(user.userId);
    return NextResponse.json(
      buildApiResponse(sessions),
      { status: 200 }
    );
  },
  ["ADMIN"]
);

