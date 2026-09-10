import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@repo/services";
import { AdminAuthService, buildApiResponse } from "@repo/services";
import { togglePilotStatusSchema } from "@repo/types";
import type { JWTPayload } from "@repo/types";

export const PATCH = withAuth(
  async (request: NextRequest, _user: JWTPayload) => {
    const body = await request.json();
    const validatedData = togglePilotStatusSchema.parse(body);
    const adminService = AdminAuthService.getInstance();
    const updated = await adminService.togglePilotStatus(validatedData);
    return NextResponse.json(
      buildApiResponse(updated, "Pilot status updated successfully"),
      { status: 200 }
    );
  },
  ["ADMIN"]
);

