import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@repo/services";
import { AdminFormService, buildApiResponse } from "@repo/services";
import type { JWTPayload } from "@repo/types";

export const GET = withAuth(
  async (_request: NextRequest, _user: JWTPayload) => {
    const forms = await AdminFormService.getAllForms();
    return NextResponse.json(
      buildApiResponse(forms, "System forms retrieved successfully"),
      { status: 200 }
    );
  },
  ["ADMIN"]
);

