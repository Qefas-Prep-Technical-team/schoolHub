import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  console.log("🔐 Middleware check:", { pathname, hasToken: !!token });

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/forgot-password", "/reset-password"];

  // Check if current route is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // If user has token and is trying to access public routes, redirect to dashboard
  if (token && isPublicRoute) {
    console.log(
      "🔄 Redirecting authenticated user from public route to dashboard"
    );
    return NextResponse.redirect(new URL("/dashboard/parent", req.url));
  }

  // If user doesn't have token and is trying to access protected routes, redirect to login
  if (!token && !isPublicRoute) {
    console.log("🔄 Redirecting unauthenticated user to login");

    // For API routes, return JSON error
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // For pages, redirect to login
    return NextResponse.redirect(new URL("/login", req.url));
  }

  console.log("✅ Allowing access to:", pathname);
  return NextResponse.next();
}

// Apply middleware to specific routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export const runtime = "nodejs";
