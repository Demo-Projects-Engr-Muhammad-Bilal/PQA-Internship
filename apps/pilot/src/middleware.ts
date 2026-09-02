import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("pilot_access_token")?.value;

  const isAuthPage = pathname === "/";
  const isDashboardPage = pathname.startsWith("/dashboard");

  // Rule 1: Agar pilot logged in nahi hai aur dashboard attempt kare, toh login par redirect karein
  if (isDashboardPage && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Rule 2: Agar pilot logged in hai toh dubara login page mat dikhayein
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
