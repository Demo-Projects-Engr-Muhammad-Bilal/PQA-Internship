import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@repo/services";
import { AdminFormService, buildApiResponse } from "@repo/services";
import { z } from "zod";
import type { JWTPayload } from "@repo/types";

const filterSchema = z.object({
  status: z.enum(["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"]).optional(),
  vesselType: z.string().optional(),
  activityType: z.string().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  search: z.string().optional(),
});

export const GET = withAuth(
  async (request: NextRequest, _user: JWTPayload) => {
    const url = new URL(request.url);
    const filters = filterSchema.parse(Object.fromEntries(url.searchParams));
    const forms = await AdminFormService.getFilteredForms(filters);
    return NextResponse.json(buildApiResponse(forms, "Filtered forms retrieved"), { status: 200 });
  },
  ["ADMIN"]
);

