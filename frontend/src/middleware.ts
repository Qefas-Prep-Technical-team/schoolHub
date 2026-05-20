import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const host = req.headers.get("host") || "";

  // 1. Exclude static assets, API routes, and standard next components
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/api") ||
    url.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Extract subdomain
  let subdomain = "";
  if (host.includes("localhost")) {
    const parts = host.split(".");
    if (parts.length > 1) {
      parts.pop(); // pop localhost:3000
      subdomain = parts.join(".");
    }
  } else {
    // production: e.g. subdomain.qefas.com or subdomain.schoolhub.com
    const parts = host.split(".");
    if (parts.length > 2) {
      parts.pop(); // com
      parts.pop(); // qefas or main domain
      subdomain = parts.join(".");
    }
  }

  // Strip leading 'www.' if present
  if (subdomain.startsWith("www.")) {
    subdomain = subdomain.substring(4);
  }

  // 3. Exclude main domain and system subdomains
  if (
    !subdomain ||
    subdomain === "www" ||
    subdomain === "flexiti" ||
    subdomain === "localhost" ||
    subdomain === "schoolhub"
  ) {
    return NextResponse.next();
  }

  // 4. Exclude system pages that should not be multitenant rewritten
  const systemPaths = [
    "/dashboard",
    "/login",
    "/signup",
    "/verification",
    "/onboarding",
    "/checkout",
    "/unauthorized",
    "/pricing",
    "/features",
    "/join",
    "/auth"
  ];

  const isSystemPath = systemPaths.some(path => 
    url.pathname === path || url.pathname.startsWith(`${path}/`)
  );

  if (isSystemPath) {
    return NextResponse.next();
  }

  // 5. Rewrite to /subdomain/[subdomain] dynamic route
  if (url.pathname.startsWith(`/${subdomain}`)) {
    return NextResponse.next();
  }

  return NextResponse.rewrite(
    new URL(`/${subdomain}${url.pathname}`, req.url)
  );
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
