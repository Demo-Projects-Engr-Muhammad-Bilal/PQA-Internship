import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { AdminFormService, buildApiResponse } from "@repo/services";
import type { JWTPayload } from "@repo/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const GET = withAuth(
  async (_request: NextRequest, _user: JWTPayload, { params }: RouteParams) => {
    const { id: formId } = await params;
    const form = await AdminFormService.getFormById(formId);
    return NextResponse.json(
      buildApiResponse(form, "Form details retrieved"),
      { status: 200 }
    );
  },
  ["ADMIN"]
);
