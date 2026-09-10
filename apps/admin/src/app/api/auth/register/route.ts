import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@repo/services";
import { AdminAuthService, buildApiResponse } from "@repo/services";
import { adminRegisterSchema } from "@repo/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = adminRegisterSchema.parse(body);
    const adminService = AdminAuthService.getInstance();
    const result = await adminService.registerAdmin(
      validatedData,
      request.headers.get("user-agent") ?? undefined,
      (request as any).ip ?? undefined
    );
    return NextResponse.json(
      buildApiResponse(result, "Admin registered successfully"),
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

