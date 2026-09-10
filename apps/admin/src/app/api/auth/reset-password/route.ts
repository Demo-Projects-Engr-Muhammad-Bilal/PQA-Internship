import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@repo/services";
import { AdminAuthService, buildApiResponse, AuthError } from "@repo/services";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;
    
    if (!token || !newPassword) {
      throw new AuthError("MISSING_FIELDS", "Token and new password are required", 400);
    }

    const adminService = AdminAuthService.getInstance();
    const result = await adminService.resetPassword(token, newPassword);
    return NextResponse.json(
      buildApiResponse(result, result.message),
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

