import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { PilotFormService, buildApiResponse } from "@repo/services";
import { createPilotFormSchema } from "@repo/types";
import type { JWTPayload } from "@repo/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const GET = withAuth(
  async (_request: NextRequest, user: JWTPayload, { params }: RouteParams) => {
    const { id: formId } = await params;
    const form = await PilotFormService.getFormById(formId, user.userId);
    return NextResponse.json(
      buildApiResponse(form, "Form details retrieved"),
      { status: 200 }
    );
  },
  ["PILOT"]
);

export const PUT = withAuth(
  async (request: NextRequest, user: JWTPayload, { params }: RouteParams) => {
    const { id: formId } = await params;
    const body = await request.json();
    const validatedData = createPilotFormSchema.parse(body);
    const updatedForm = await PilotFormService.updateForm(user.userId, formId, validatedData);
    return NextResponse.json(
      buildApiResponse(updatedForm, "Pilot form updated successfully"),
      { status: 200 }
    );
  },
  ["PILOT"]
);
