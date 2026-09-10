import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@repo/services";
import { AdminAuthService, buildApiResponse } from "@repo/services";
import { changePasswordSchema } from "@repo/types";
import type { JWTPayload } from "@repo/types";

export const POST = withAuth(
  async (request: NextRequest, user: JWTPayload) => {
    const body = await request.json();
    const validatedData = changePasswordSchema.parse(body);
    const adminService = AdminAuthService.getInstance();
    const result = await adminService.changePassword(user.userId, validatedData);
    return NextResponse.json(
      buildApiResponse(result, result.message),
      { status: 200 }
    );
  },
  ["ADMIN"]
);

