import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-middleware";
import { AdminAuthService, buildApiResponse } from "@repo/services";
import { loginSchema } from "@repo/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);
    const adminService = AdminAuthService.getInstance();
    const result = await adminService.loginAdmin(
      validatedData,
      request.headers.get("user-agent") ?? undefined,
      (request as any).ip ?? undefined
    );
    return NextResponse.json(
      buildApiResponse(result, "Login successful"),
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
