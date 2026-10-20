import { NextRequest, NextResponse } from "next/server";
import { generateState, generateCodeVerifier } from "arctic";
import { getGoogleClient, getGoogleRedirectUri } from "@/lib/google";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get("role") || "student";
    const inviteToken = searchParams.get("inviteToken") || "";

    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    const origin = request.nextUrl.origin;
    const redirectUri = getGoogleRedirectUri(origin);
    const client = getGoogleClient(redirectUri);

    const url = client.createAuthorizationURL(state, codeVerifier, [
      "openid",
      "email",
      "profile",
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

    response.cookies.set("google_oauth_state", state, cookieOptions);
    response.cookies.set("google_code_verifier", codeVerifier, cookieOptions);
    response.cookies.set("google_intended_role", role, cookieOptions);
    response.cookies.set("google_redirect_uri", redirectUri, cookieOptions);
    if (inviteToken) {
      response.cookies.set("google_invite_token", inviteToken, cookieOptions);
    }

    return response;
  } catch (error) {
    console.error("Failed to initiate Google authentication:", error);
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "error",
      "Failed to initiate Google sign-in. Please check configuration."
    );
    return NextResponse.redirect(loginUrl);
  }
}
