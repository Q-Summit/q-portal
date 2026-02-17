import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isValidRedirectPath } from "./lib/utils";

// Define paths that never trigger a redirect
const PUBLIC_PATHS = ["/login", "/api/auth"];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Edge proxy only performs an optimistic cookie-presence gate for redirects.
  // Full session validation is deferred to server components and API routes.

  // 1. Check for session cookie
  // Better Auth uses this cookie name by default.
  // In production (HTTPS), it might be prefixed with __Secure-
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ??
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  const isAuthPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  // 2. Redirect unauthenticated users to Login
  if (!sessionToken && !isAuthPath) {
    if (pathname.startsWith("/api")) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Construct the URL to include a 'callbackUrl' so users return where they were
    const loginUrl = new URL("/login", request.url);

    if (isValidRedirectPath(pathname)) {
      loginUrl.searchParams.set("callbackUrl", pathname + search);
    }

    return NextResponse.redirect(loginUrl);
  }

  // 3. Redirect authenticated users away from Login
  if (sessionToken && pathname === "/login") {
    // We have another check in place in complete-profil so users can't get past
    // their profile completion. If it's already done, they'll be redirected to
    // the dashboard from there.
    return NextResponse.redirect(new URL("/complete-profile", request.url));
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   */
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
