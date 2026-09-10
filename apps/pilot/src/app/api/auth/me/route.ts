import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/db";
import { withAuth } from "@repo/services";
import { PilotAuthService, buildApiResponse } from "@repo/services";
import { updatePilotSignatureSchema } from "@repo/types";
import type { JWTPayload } from "@repo/types";

export const GET = withAuth(
  async (_request: NextRequest, user: JWTPayload) => {
    const dbUser = await db.user.findUnique({
      where: { id: user.userId },
      select: { id: true, name: true, email: true, role: true, signatureImage: true },
    });
    return NextResponse.json(buildApiResponse(dbUser), { status: 200 });
  },
  ["PILOT"]
);

export const PATCH = withAuth(
  async (request: NextRequest, user: JWTPayload) => {
    const body = await request.json();
    const { signatureImage } = updatePilotSignatureSchema.parse(body);

    const updated = await PilotAuthService.updateSignature(user.userId, signatureImage);

    return NextResponse.json(
      buildApiResponse(updated, "Signature saved successfully"),
      { status: 200 }
    );
  },
  ["PILOT"]
);

