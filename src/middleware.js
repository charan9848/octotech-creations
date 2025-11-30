import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const path = req.nextUrl.pathname;

  // 1. Check for Maintenance Mode (Skip for admin login, admin dashboard, and api routes)
  if (!path.startsWith('/admin') && !path.startsWith('/api') && !path.startsWith('/maintenance') && !path.startsWith('/_next')) {
    try {
      // Fetch maintenance status from our internal API
      const res = await fetch(`${req.nextUrl.origin}/api/check-maintenance`);
      if (res.ok) {
        const { maintenanceMode } = await res.json();
        if (maintenanceMode) {
           return NextResponse.redirect(new URL("/maintenance", req.url));
        }
      }
    } catch (e) {
      // Fail open if check fails so site doesn't break
      console.error("Maintenance check failed", e);
    }
  }

  // 2. Admin Authentication Logic
  if (path.startsWith("/admin/dashboard")) {
    const token = await getToken({ req });
    
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/artist-login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - maintenance (the maintenance page itself)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|maintenance).*)',
  ],
};
