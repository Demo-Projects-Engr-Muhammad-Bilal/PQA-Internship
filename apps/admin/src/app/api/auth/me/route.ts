import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@repo/services";
import { AdminAuthService, buildApiResponse } from "@repo/services";
import { updateAdminProfileSchema } from "@repo/types";
import type { JWTPayload } from "@repo/types";

export const GET = withAuth(
  async (_request: NextRequest, user: JWTPayload) => {
    return NextResponse.json(buildApiResponse(user), { status: 200 });
  },
  ["ADMIN"]
);

export const PATCH = withAuth(
  async (request: NextRequest, user: JWTPayload) => {
    const body = await request.json();
    const validatedData = updateAdminProfileSchema.parse(body);
    const adminService = AdminAuthService.getInstance();
    const updated = await adminService.updateProfile(user.userId, validatedData);
    return NextResponse.json(
      buildApiResponse(updated, "Profile updated successfully"),
      { status: 200 }
    );
  },
  ["ADMIN"]
);

