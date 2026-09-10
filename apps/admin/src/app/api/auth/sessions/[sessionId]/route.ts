import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@repo/services";
import { AdminAuthService, buildApiResponse } from "@repo/services";
import { revokeSessionSchema } from "@repo/types";
import type { JWTPayload } from "@repo/types";

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

export const DELETE = withAuth(
  async (_request: NextRequest, user: JWTPayload, { params }: RouteParams) => {
    const { sessionId } = await params;
    const validatedSessionId = revokeSessionSchema.parse({ sessionId }).sessionId;
    const adminService = AdminAuthService.getInstance();
    const result = await adminService.revokeSession(user.userId, validatedSessionId);
    return NextResponse.json(
      buildApiResponse(result, result.message),
      { status: 200 }
    );
  },
  ["ADMIN"]
);
