import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { buildApiResponse } from "@repo/services";
import type { JWTPayload } from "@repo/types";

export const GET = withAuth(
  async (_request: NextRequest, user: JWTPayload) => {
    return NextResponse.json(buildApiResponse(user), { status: 200 });
  },
  ["PILOT"]
);
