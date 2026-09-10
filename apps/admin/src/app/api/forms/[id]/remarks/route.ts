import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@repo/services";
import { AdminFormService, buildApiResponse } from "@repo/services";
import { z } from "zod";
import type { JWTPayload } from "@repo/types";

const remarkSchema = z.object({ message: z.string().min(1).max(2000) });

interface RouteParams { params: Promise<{ id: string }>; }

export const GET = withAuth(
  async (_request: NextRequest, _user: JWTPayload, { params }: RouteParams) => {
    const { id: formId } = await params;
    const remarks = await AdminFormService.getRemarks(formId);
    return NextResponse.json(buildApiResponse(remarks, "Remarks retrieved"), { status: 200 });
  },
  ["ADMIN"]
);

export const POST = withAuth(
  async (request: NextRequest, user: JWTPayload, { params }: RouteParams) => {
    const { id: formId } = await params;
    const { message } = remarkSchema.parse(await request.json());
    const remark = await AdminFormService.addRemark(formId, user.userId, message);
    return NextResponse.json(buildApiResponse(remark, "Remark added"), { status: 201 });
  },
  ["ADMIN"]
);
