import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { PilotFormService, buildApiResponse } from "@repo/services";
import { submitFormSchema } from "@repo/types";
import type { JWTPayload } from "@repo/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/forms/[id]/submit
 *
 * Pilot declares the form, attaches master signature + ship stamp,
 * and transitions the form from DRAFT or REJECTED → SUBMITTED.
 */
export const POST = withAuth(
  async (request: NextRequest, user: JWTPayload, { params }: RouteParams) => {
    const { id: formId } = await params;

    // Parse and validate the submission payload
    const body = await request.json();
    const payload = submitFormSchema.parse(body);

    // Derive client IP for audit trail
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    const submittedForm = await PilotFormService.submitForm(
      formId,
      user.userId,
      payload,
      ip
    );

    return NextResponse.json(
      buildApiResponse(submittedForm, "Form submitted successfully"),
      { status: 200 }
    );
  },
  ["PILOT"]
);
