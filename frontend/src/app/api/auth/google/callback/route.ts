import { NextRequest, NextResponse } from "next/server";
import { decodeIdToken } from "arctic";
import { getGoogleClient } from "@/lib/google";
import axios from "axios";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");

  const storedRole =
    request.cookies.get("google_intended_role")?.value || "student";
  const storedRedirectUri = request.cookies.get("google_redirect_uri")?.value;
  const inviteToken = request.cookies.get("google_invite_token")?.value;

  const rolePathMap: Record<string, string> = {
    student: "/login/student",
    teacher: "/login/teacher",
    admin: "/login/school-admin",
    "school-admin": "/login/school-admin",
    school: "/login/school-admin",
    parent: "/login/parent",
    staff: "/auth/login",
  };

  const loginPath = inviteToken
    ? `/auth/setup?token=${encodeURIComponent(inviteToken)}`
    : rolePathMap[storedRole.toLowerCase()] || "/login";
  const loginUrl = new URL(loginPath, request.url);

  // 1. Handle user denied consent or OAuth provider errors
  if (errorParam) {
    if (errorParam === "access_denied") {
      loginUrl.searchParams.set("error", "Google sign-in was cancelled");
    } else {
      loginUrl.searchParams.set(
        "error",
        `Google authentication error: ${errorParam}`
      );
    }
    return NextResponse.redirect(loginUrl);
  }

  // 2. Read stored verification cookies
  const storedState = request.cookies.get("google_oauth_state")?.value;
  const codeVerifier = request.cookies.get("google_code_verifier")?.value;

  if (!code || !state || !storedState || !codeVerifier) {
    loginUrl.searchParams.set(
      "error",
      "Invalid or expired authentication session. Please try again."
    );
    return NextResponse.redirect(loginUrl);
  }

  // 3. Verify state matches stored state cookie
  if (state !== storedState) {
    loginUrl.searchParams.set(
      "error",
      "Security state verification failed. Please try again."
    );
    return NextResponse.redirect(loginUrl);
  }

  let tokens;
  try {
    // 4. Exchange authorization code with Google using PKCE codeVerifier and matching redirect URI
    const client = getGoogleClient(storedRedirectUri || request.nextUrl.origin);
    tokens = await client.validateAuthorizationCode(code, codeVerifier);
  } catch (err: unknown) {
    console.error("Token exchange failed:", err instanceof Error ? err.message : err);
    loginUrl.searchParams.set(
      "error",
      "Failed to complete secure authentication with Google."
    );
    return NextResponse.redirect(loginUrl);
  }

  // 5. Decode ID token to extract claims
  const idToken = tokens.idToken();
  const claims = decodeIdToken(idToken) as {
    sub?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
  };

  if (!claims.sub || !claims.email) {
    loginUrl.searchParams.set(
      "error",
      "Incomplete profile information received from Google."
    );
    return NextResponse.redirect(loginUrl);
  }

  // 6. Reject if email_verified is false
  if (!claims.email_verified) {
    loginUrl.searchParams.set(
      "error",
      "Your Google email is not verified. Please verify your email with Google first."
    );
    return NextResponse.redirect(loginUrl);
  }

  // 7. Find, link or create user via backend server-side authentication service
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    const roleMapping: Record<string, "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | "STAFF"> = {
      "school": "ADMIN",
      "school-admin": "ADMIN",
      "admin": "ADMIN",
      "teacher": "TEACHER",
      "student": "STUDENT",
      "parent": "PARENT",
      "staff": "STAFF",
    };
    const mappedRole = roleMapping[storedRole.toLowerCase()] || "STUDENT";

    const res = await axios.post(`${backendUrl}/auth/google`, {
      googleId: claims.sub,
      email: claims.email,
      name: claims.name || claims.email.split("@")[0],
      userRole: mappedRole,
      emailVerified: claims.email_verified,
      inviteToken: inviteToken || undefined,
    });

    if (!res.data.success) {
      loginUrl.searchParams.set(
        "error",
        res.data.message || "Failed to finalize authentication."
      );
      return NextResponse.redirect(loginUrl);
    }

    const { accessToken, refreshToken, userRole, isNewUser, isPlatformStaff } = res.data.data;
    const isProd = process.env.NODE_ENV === "production";

    // Handle Platform Staff Console Login
    if (isPlatformStaff) {
      const response = NextResponse.redirect(new URL("/console", request.url));
      response.cookies.delete("google_oauth_state");
      response.cookies.delete("google_code_verifier");
      response.cookies.delete("google_intended_role");
      response.cookies.delete("google_invite_token");

      response.cookies.set("platform_token", accessToken, {
        path: "/",
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        maxAge: 8 * 60 * 60,
      });

      return response;
    }

    // 8. Determine destination dashboard
    let destination = `/dashboard/${userRole.toLowerCase().replace("_", "-")}`;
    if (isNewUser) {
      destination = `/onboarding?type=${userRole.toLowerCase()}`;
    }

    // Redirect to login/callback to populate client Zustand store and show welcome toast
    const callbackRedirect = new URL("/login/callback", request.url);
    callbackRedirect.searchParams.set("auth", "success");
    callbackRedirect.searchParams.set("role", userRole.toLowerCase());
    callbackRedirect.searchParams.set("dest", destination);

    const response = NextResponse.redirect(callbackRedirect);

    // 9. Clear temporary OAuth cookies
    response.cookies.delete("google_oauth_state");
    response.cookies.delete("google_code_verifier");
    response.cookies.delete("google_intended_role");
    response.cookies.delete("google_redirect_uri");

    // 10. Set session cookies
    response.cookies.set("token", accessToken, {
      path: "/",
      httpOnly: false, // Accessible to client-side Axios & Next.js middleware
      secure: isProd,
      sameSite: "lax",
      maxAge: 24 * 60 * 60,
    });

    if (refreshToken) {
      response.cookies.set("refreshToken", refreshToken, {
        path: "/",
        httpOnly: true,
        secure: isProd,
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (err: unknown) {
    const axiosError = err as {
      response?: {
        data?: {
          message?: string;
          code?: string;
          detectedRole?: string;
          correctPortal?: string;
        };
      };
      message?: string;
    };
    const errorData = axiosError.response?.data;
    const errorMessage =
      errorData?.message ||
      axiosError.message ||
      "Failed to log in with Google.";

    console.error("Backend Google authentication error:", errorMessage);

    const isWrongPortal =
      errorData?.code === "WRONG_PORTAL" ||
      errorMessage.toLowerCase().includes("please login through the correct portal") ||
      errorMessage.toLowerCase().includes("registered as a");

    let detectedRole = errorData?.detectedRole;
    let correctPortal = errorData?.correctPortal;

    if (!detectedRole && isWrongPortal) {
      if (errorMessage.toLowerCase().includes("school admin") || errorMessage.toLowerCase().includes("admin")) {
        detectedRole = "School Admin";
        correctPortal = "/login/school-admin";
      } else if (errorMessage.toLowerCase().includes("teacher")) {
        detectedRole = "Teacher";
        correctPortal = "/login/teacher";
      } else if (errorMessage.toLowerCase().includes("student")) {
        detectedRole = "Student";
        correctPortal = "/login/student";
      } else if (errorMessage.toLowerCase().includes("parent")) {
        detectedRole = "Parent";
        correctPortal = "/login/parent";
      } else if (errorMessage.toLowerCase().includes("staff")) {
        detectedRole = "Platform Staff";
        correctPortal = "/auth/login";
      }
    }

    loginUrl.searchParams.set("error", errorMessage);

    if (isWrongPortal && detectedRole) {
      loginUrl.searchParams.set("wrong_portal", "true");
      loginUrl.searchParams.set("detected_role", detectedRole);
      if (correctPortal) {
        loginUrl.searchParams.set("correct_portal", correctPortal);
      }
    }

    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("google_oauth_state");
    response.cookies.delete("google_code_verifier");
    response.cookies.delete("google_intended_role");
    response.cookies.delete("google_redirect_uri");
    return response;
  }
}
