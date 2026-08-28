import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("admin_access_token")?.value;

  // Identify auth-related public routes
  const isAuthPage =
    pathname === "/" ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");

  const isDashboardPage = pathname.startsWith("/dashboard");

  // Rule 1: Agar user logged in nahi hai aur dashboard access karna chahta hai, block karke login par bhej dein
  if (isDashboardPage && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Rule 2: Agar user already logged in hai aur login/register pages khol raha hai, wapis dashboard par bhej dein
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Ensure middleware runs only on these specific routes to optimize performance
export const config = {
  matcher: [
    "/",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/dashboard/:path*",
  ],
};