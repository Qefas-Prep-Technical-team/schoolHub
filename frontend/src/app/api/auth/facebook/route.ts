import { NextRequest, NextResponse } from "next/server";
import { generateState } from "arctic";
import { facebook } from "@/lib/facebook";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get("role") || "student";
    const inviteToken = searchParams.get("inviteToken") || "";

    const state = generateState();

    // Facebook OAuth URL with scopes public_profile and email only
    const url = facebook.createAuthorizationURL(state, [
      "public_profile",
      "email",
    ]);

    const isProd = process.env.NODE_ENV === "production";
    const response = NextResponse.redirect(url);

    const cookieOptions = {
      path: "/",
      httpOnly: true,
      secure: isProd,
      sameSite: "lax" as const,
      maxAge: 60 * 10, // 10 minutes
    };

    response.cookies.set("facebook_oauth_state", state, cookieOptions);
    response.cookies.set("facebook_intended_role", role, cookieOptions);
    if (inviteToken) {
      response.cookies.set("facebook_invite_token", inviteToken, cookieOptions);
    }

    return response;
  } catch (error) {
    console.error("Failed to initiate Facebook authentication:", error);
    const role = request.nextUrl.searchParams.get("role") || "student";
    const loginPath = role === "staff" ? "/auth/login" : "/login";
    const loginUrl = new URL(loginPath, request.url);
    loginUrl.searchParams.set(
      "error",
      "Failed to initiate Facebook sign-in. Please check configuration."
    );
    return NextResponse.redirect(loginUrl);
  }
}
