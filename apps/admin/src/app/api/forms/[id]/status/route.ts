import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@repo/services";
import { AdminFormService, buildApiResponse } from "@repo/services";
import { z } from "zod";
import type { JWTPayload } from "@repo/types";

const updateStatusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  rejectionReason: z.string().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const PATCH = withAuth(
  async (request: NextRequest, _user: JWTPayload, { params }: RouteParams) => {
    const { id: formId } = await params;
    const body = await request.json();
    const { status, rejectionReason } = updateStatusSchema.parse(body);

    const updatedForm = await AdminFormService.updateFormStatus(
      formId,
      status as "APPROVED" | "REJECTED",
      _user.userId,
      rejectionReason
    );

    return NextResponse.json(
      buildApiResponse(updatedForm, `Form status updated to ${status}`),
      { status: 200 }
    );
  },
  ["ADMIN"]
);
