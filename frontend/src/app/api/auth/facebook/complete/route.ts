import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const rawPending = request.cookies.get("fb_pending_oauth")?.value;
    if (!rawPending) {
      return NextResponse.json(
        {
          success: false,
          message: "No pending social registration found or session expired. Please sign in with Facebook again.",
        },
        { status: 400 }
      );
    }

    let pending: { facebookId?: string; name?: string; role?: string } = {};
    try {
      pending = JSON.parse(rawPending);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid registration session data." },
        { status: 400 }
      );
    }

    if (!pending.facebookId) {
      return NextResponse.json(
        { success: false, message: "Missing Facebook user ID in session." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const email = body.email?.toLowerCase().trim();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

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
    const mappedRole = roleMapping[(pending.role || "student").toLowerCase()] || "STUDENT";

    const res = await axios.post(`${backendUrl}/auth/facebook`, {
      facebookId: pending.facebookId,
      email,
      name: pending.name || email.split("@")[0],
      userRole: mappedRole,
    });

    if (!res.data.success) {
      return NextResponse.json(
        {
          success: false,
          message: res.data.message || "Failed to complete registration.",
        },
        { status: 400 }
      );
    }

    const { accessToken, refreshToken, userRole, isNewUser, isPlatformStaff } = res.data.data;
    const isProd = process.env.NODE_ENV === "production";

    let destination = isPlatformStaff
      ? "/console"
      : isNewUser
      ? `/onboarding?type=${userRole.toLowerCase()}`
      : `/dashboard/${userRole.toLowerCase().replace("_", "-")}`;

    const response = NextResponse.json({
      success: true,
      data: {
        destination,
        role: userRole?.toLowerCase(),
      },
    });

    // Clear pending cookie
    response.cookies.delete("fb_pending_oauth");

    // Set auth session cookies
    if (isPlatformStaff) {
      response.cookies.set("platform_token", accessToken, {
        path: "/",
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        maxAge: 8 * 60 * 60,
      });
    } else {
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
    }

    return response;
  } catch (err: unknown) {
    const axiosError = err as { response?: { data?: { message?: string } }; message?: string };
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.message ||
      "Failed to complete profile registration.";

    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 400 }
    );
  }
}
