import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@repo/services";
import { AdminAuthService, buildApiResponse } from "@repo/services";
import { adminResetPilotPasswordSchema } from "@repo/types";
import type { JWTPayload } from "@repo/types";

export const POST = withAuth(
  async (request: NextRequest, _user: JWTPayload) => {
    const body = await request.json();
    const validatedData = adminResetPilotPasswordSchema.parse(body);
    const adminService = AdminAuthService.getInstance();
    const result = await adminService.resetPilotPassword(validatedData);
    return NextResponse.json(
      buildApiResponse(result, result.message),
      { status: 200 }
    );
  },
  ["ADMIN"]
);

