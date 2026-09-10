import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@repo/services";
import { AdminAuthService, buildApiResponse } from "@repo/services";
import { createPilotSchema } from "@repo/types";
import type { JWTPayload } from "@repo/types";

export const POST = withAuth(
  async (request: NextRequest, _user: JWTPayload) => {
    const body = await request.json();
    const validatedData = createPilotSchema.parse(body);
    const adminService = AdminAuthService.getInstance();
    const pilot = await adminService.createPilot(validatedData);
    return NextResponse.json(
      buildApiResponse(pilot, "Pilot created successfully"),
      { status: 201 }
    );
  },
  ["ADMIN"]
);

export const GET = withAuth(
  async (_request: NextRequest, _user: JWTPayload) => {
    const adminService = AdminAuthService.getInstance();
    const pilots = await adminService.getAllPilots();
    return NextResponse.json(
      buildApiResponse(pilots),
      { status: 200 }
    );
  },
  ["ADMIN"]
);

