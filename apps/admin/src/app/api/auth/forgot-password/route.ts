import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@repo/services";
import { AdminAuthService, buildApiResponse, AuthError } from "@repo/services";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;
    
    if (!email) {
      throw new AuthError("EMAIL_REQUIRED", "Email is required", 400);
    }

    const adminService = AdminAuthService.getInstance();
    const result = await adminService.forgotPassword(email);
    return NextResponse.json(
      buildApiResponse(result, result.message),
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

