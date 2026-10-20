import { NextRequest, NextResponse } from "next/server";
import { getFacebookClient } from "@/lib/facebook";
import axios from "axios";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");
  const errorReason = searchParams.get("error_reason");

  const storedRole =
    request.cookies.get("facebook_intended_role")?.value || "student";
  const storedRedirectUri = request.cookies.get("facebook_redirect_uri")?.value;
  const inviteToken = request.cookies.get("facebook_invite_token")?.value;

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

  // 1. Handle user denied consent or Facebook OAuth errors
  if (errorParam || errorReason) {
    if (errorParam === "access_denied" || errorReason === "user_denied") {
      loginUrl.searchParams.set("error", "Facebook sign-in was cancelled");
    } else {
      loginUrl.searchParams.set(
        "error",
        `Facebook authentication error: ${errorParam || errorReason}`
      );
    }
    return NextResponse.redirect(loginUrl);
  }

  // 2. Read stored verification cookie
  const storedState = request.cookies.get("facebook_oauth_state")?.value;

  if (!code || !state || !storedState) {
    loginUrl.searchParams.set(
      "error",
      "Invalid or expired authentication session. Please try again."
    );
    return NextResponse.redirect(loginUrl);
  }

  // 3. Verify state matches stored state cookie (CSRF protection)
  if (state !== storedState) {
    loginUrl.searchParams.set(
      "error",
      "Security state verification failed. Please try again."
    );
    return NextResponse.redirect(loginUrl);
  }

  // 4. Exchange authorization code for Facebook access token
  let tokens;
  try {
    const client = getFacebookClient(storedRedirectUri || request.nextUrl.origin);
    tokens = await client.validateAuthorizationCode(code);
  } catch (err: unknown) {
    console.error("Facebook token exchange failed:", err instanceof Error ? err.message : "OAuth error");
    loginUrl.searchParams.set(
      "error",
      "Failed to complete secure authentication with Facebook."
    );
    return NextResponse.redirect(loginUrl);
  }

  // 5. Fetch profile from Facebook Graph API (public_profile and email)
  let profile: { id?: string; name?: string; email?: string } = {};
  try {
    const accessToken = tokens.accessToken();
    const fbResponse = await fetch(
      "https://graph.facebook.com/me?fields=id,name,email",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!fbResponse.ok) {
      throw new Error(`Graph API returned ${fbResponse.status}`);
    }

    profile = await fbResponse.json();
  } catch (err: unknown) {
    console.error("Facebook Graph API fetch failed:", err instanceof Error ? err.message : "Fetch error");
    loginUrl.searchParams.set(
      "error",
      "Failed to retrieve your profile information from Facebook."
    );
    return NextResponse.redirect(loginUrl);
  }

  if (!profile.id) {
    loginUrl.searchParams.set(
      "error",
      "Incomplete profile information received from Facebook."
    );
    return NextResponse.redirect(loginUrl);
  }

  const isProd = process.env.NODE_ENV === "production";

  // 6. Option A: If Facebook returned no email, route to profile completion step
  if (!profile.email) {
    const completeUrl = new URL("/auth/complete-profile", request.url);
    completeUrl.searchParams.set("provider", "facebook");
    if (profile.name) {
      completeUrl.searchParams.set("name", profile.name);
    }

    const response = NextResponse.redirect(completeUrl);

    // Store pending social profile in a secure, short-lived HTTP-only cookie
    const pendingPayload = JSON.stringify({
      facebookId: profile.id,
      name: profile.name || "",
      role: storedRole,
    });

    response.cookies.set("fb_pending_oauth", pendingPayload, {
      path: "/",
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes
    });

    response.cookies.delete("facebook_oauth_state");
    response.cookies.delete("facebook_intended_role");
    return response;
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

    const res = await axios.post(`${backendUrl}/auth/facebook`, {
      facebookId: profile.id,
      email: profile.email,
      name: profile.name || profile.email.split("@")[0],
      userRole: mappedRole,
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

    // Handle Platform Staff Console Login
    if (isPlatformStaff) {
      const response = NextResponse.redirect(new URL("/console", request.url));
      response.cookies.delete("facebook_oauth_state");
      response.cookies.delete("facebook_intended_role");
      response.cookies.delete("facebook_invite_token");

      response.cookies.set("platform_token", accessToken, {
        path: "/",
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        maxAge: 8 * 60 * 60,
      });

      return response;
    }

    // Determine destination dashboard for regular users
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

    // Clear temporary OAuth cookies
    response.cookies.delete("facebook_oauth_state");
    response.cookies.delete("facebook_intended_role");
    response.cookies.delete("facebook_redirect_uri");

    // Set session cookies
    response.cookies.set("token", accessToken, {
      path: "/",
      httpOnly: false,
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
      "Failed to log in with Facebook.";

    console.error("Backend Facebook authentication error:", errorMessage);

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
    response.cookies.delete("facebook_oauth_state");
    response.cookies.delete("facebook_intended_role");
    response.cookies.delete("facebook_redirect_uri");
    return response;
  }
}
