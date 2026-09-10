import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@repo/services";
import { PilotFormService, buildApiResponse } from "@repo/services";
import { createPilotFormSchema } from "@repo/types";
import type { JWTPayload } from "@repo/types";

export const GET = withAuth(
  async (_request: NextRequest, user: JWTPayload) => {
    const forms = await PilotFormService.getMyForms(user.userId);
    return NextResponse.json(
      buildApiResponse(forms, "Forms retrieved successfully"),
      { status: 200 }
    );
  },
  ["PILOT"]
);

export const POST = withAuth(
  async (request: NextRequest, user: JWTPayload) => {
    const body = await request.json();
    const validatedData = createPilotFormSchema.parse(body);
    const newForm = await PilotFormService.createForm(user.userId, validatedData);
    return NextResponse.json(
      buildApiResponse(newForm, "Pilot form submitted successfully"),
      { status: 201 }
    );
  },
  ["PILOT"]
);

