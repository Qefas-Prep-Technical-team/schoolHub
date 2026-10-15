import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import axios from "axios";

// Helper to decode base64url to Buffer
function base64UrlDecode(input: string): Buffer {
  let base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64");
}

export async function POST(request: NextRequest) {
  try {
    const clientSecret = process.env.FACEBOOK_APP_SECRET;
    if (!clientSecret) {
      console.error("FACEBOOK_APP_SECRET is not configured on the server");
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 }
      );
    }

    // Read signed_request from form data or JSON body
    let signedRequest: string | null = null;
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      signedRequest = formData.get("signed_request") as string | null;
    } else if (contentType.includes("application/json")) {
      const json = await request.json();
      signedRequest = json.signed_request || null;
    } else {
      // Fallback: try raw text
      const rawText = await request.text();
      const params = new URLSearchParams(rawText);
      signedRequest = params.get("signed_request");
    }

    if (!signedRequest || typeof signedRequest !== "string" || !signedRequest.includes(".")) {
      return NextResponse.json(
        { error: "Missing or invalid signed_request parameter" },
        { status: 400 }
      );
    }

    const [encodedSig, encodedPayload] = signedRequest.split(".");
    if (!encodedSig || !encodedPayload) {
      return NextResponse.json(
        { error: "Malformed signed_request structure" },
        { status: 400 }
      );
    }

    // 1. Verify HMAC-SHA256 signature using timingSafeEqual
    const expectedSig = crypto
      .createHmac("sha256", clientSecret)
      .update(encodedPayload)
      .digest();

    const actualSig = base64UrlDecode(encodedSig);

    if (
      expectedSig.length !== actualSig.length ||
      !crypto.timingSafeEqual(expectedSig, actualSig)
    ) {
      console.warn("Facebook Data Deletion signed_request signature verification failed");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 403 }
      );
    }

    // 2. Parse decoded payload
    const payloadJson = base64UrlDecode(encodedPayload).toString("utf-8");
    const data = JSON.parse(payloadJson) as {
      user_id?: string;
      algorithm?: string;
      issued_at?: number;
    };

    const facebookUserId = data.user_id;
    if (!facebookUserId) {
      return NextResponse.json(
        { error: "No user_id found in payload" },
        { status: 400 }
      );
    }

    // 3. Notify backend to unlink Facebook account and log compliance ticket
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    let confirmationCode = `DEL-FB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    try {
      const backendRes = await axios.post(
        `${backendUrl}/auth/facebook/data-deletion`,
        { facebookUserId }
      );
      if (backendRes.data?.data?.confirmationCode) {
        confirmationCode = backendRes.data.data.confirmationCode;
      }
    } catch (backendErr) {
      console.error(
        "Backend facebook data deletion call failed, using generated code:",
        backendErr instanceof Error ? backendErr.message : backendErr
      );
    }

    const appUrl = (
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    ).replace(/\/$/, "");

    // 4. Return Meta-compliant response
    return NextResponse.json({
      url: `${appUrl}/data-deletion?code=${encodeURIComponent(confirmationCode)}`,
      confirmation_code: confirmationCode,
    });
  } catch (error: unknown) {
    console.error("Facebook Data Deletion callback error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Internal processing error" },
      { status: 500 }
    );
  }
}
