import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Paths that don't require authentication
  const isAuthRoute = pathname.startsWith("/api/auth");
  const isLoginPage = pathname === "/login";
  const isPublicAsset = pathname.includes(".") || pathname.startsWith("/_next"); // Images, CSS, JS, etc.

  // 2. Check for the session token
  // Better Auth uses this cookie name by default.
  // In production (HTTPS), it might be prefixed with __Secure-
  const sessionToken =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");

  // 3. Redirect unauthenticated users to Login
  if (!sessionToken && !isLoginPage && !isAuthRoute && !isPublicAsset) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 4. Redirect authenticated users AWAY from Login (to Dashboard)
  if (sessionToken && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // This matcher ensures middleware runs on all paths EXCEPT static assets
  // We handle the specific logic inside the function above for clarity
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
