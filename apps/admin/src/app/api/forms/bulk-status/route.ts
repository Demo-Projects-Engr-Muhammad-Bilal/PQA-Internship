import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@repo/services";
import { AdminFormService, buildApiResponse } from "@repo/services";
import { z } from "zod";
import type { JWTPayload } from "@repo/types";

const bulkSchema = z.object({
  formIds: z.array(z.string()).min(1).max(100),
  status: z.enum(["APPROVED", "REJECTED"]),
  rejectionReason: z.string().optional(),
});

export const PATCH = withAuth(
  async (request: NextRequest, user: JWTPayload) => {
    const { formIds, status, rejectionReason } = bulkSchema.parse(await request.json());
    const result = await AdminFormService.bulkUpdateStatus(
      formIds,
      status,
      user.userId,
      rejectionReason
    );
    return NextResponse.json(
      buildApiResponse(result, `${result.updatedCount} form(s) updated to ${status}`),
      { status: 200 }
    );
  },
  ["ADMIN"]
);

