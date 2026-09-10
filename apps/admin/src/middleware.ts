import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Generate a unique nonce per request for CSP
  const nonce = btoa(crypto.randomUUID()); // btoa() is available on Edge Runtime; Buffer is not

  // Allow 'unsafe-eval' in development only (React/Turbopack requires it for
  // error overlays and call-stack reconstruction; never needed in production).
  const isDev = process.env.NODE_ENV === "development";
  const scriptSrc = isDev
    ? `'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`
    : `'self' 'nonce-${nonce}' 'strict-dynamic'`;

  const csp = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
  ].join("; ").concat(";");

  // 2. Forward nonce + CSP to Next.js internals so hydration scripts get the nonce
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  // 3. Existing auth routing logic (preserved)
  const token = request.cookies.get("admin_access_token")?.value;

  const isAuthPage =
    pathname === "/" ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");

  const isDashboardPage = pathname.startsWith("/dashboard");

  // Rule 1: Not logged in → block dashboard, redirect to login
  if (isDashboardPage && !token) {
    const redirectResponse = NextResponse.redirect(new URL("/", request.url));
    redirectResponse.headers.set("Content-Security-Policy", csp);
    return redirectResponse;
  }

  // Rule 2: Already logged in → don't show auth pages, redirect to dashboard
  if (isAuthPage && token) {
    const redirectResponse = NextResponse.redirect(new URL("/dashboard", request.url));
    redirectResponse.headers.set("Content-Security-Policy", csp);
    return redirectResponse;
  }

  // 4. Pass request with nonce headers; set CSP on response too
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
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
