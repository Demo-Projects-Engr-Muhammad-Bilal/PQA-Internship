import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@repo/services";
import { AuditService, buildApiResponse } from "@repo/services";
import type { JWTPayload } from "@repo/types";

export const GET = withAuth(
  async (request: NextRequest, _user: JWTPayload) => {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 100;
    
    const logs = await AuditService.getLogs(limit);
    return NextResponse.json(buildApiResponse(logs, "Audit logs retrieved"), { status: 200 });
  },
  ["ADMIN"]
);

