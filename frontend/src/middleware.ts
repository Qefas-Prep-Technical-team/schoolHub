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
  if (host.includes("localhost") || host.includes("lvh.me")) {
    const parts = host.split(".");
    if (parts.length > 1) {
      // pop localhost:3000 or lvh.me:3000
      // wait, lvh.me has two parts: lvh and me.
      // So if host is subdomain.lvh.me:3000 -> parts: ["subdomain", "lvh", "me:3000"]
      if (host.includes("lvh.me")) {
        parts.pop(); // me:3000
        parts.pop(); // lvh
      } else {
        parts.pop(); // localhost:3000
      }
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
    subdomain === "lvh" ||
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
    if (url.pathname.startsWith("/dashboard")) {
      const token = req.cookies.get("token")?.value;
      
      if (!token) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("redirect", url.pathname);
        return NextResponse.redirect(loginUrl);
      }

      if (url.pathname.startsWith("/dashboard/teacher")) {
        try {
          const payloadBase64 = token.split(".")[1];
          const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
          const decodedPayload = JSON.parse(atob(base64));
          
          if (decodedPayload.userType !== "TEACHER") {
            return NextResponse.redirect(new URL("/unauthorized", req.url));
          }
        } catch (e) {
          // Let client-side protection handle invalid token formats
        }
      }
    }

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
