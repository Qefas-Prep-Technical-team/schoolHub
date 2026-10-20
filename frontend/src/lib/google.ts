import { Google } from "arctic";

const clientId = process.env.GOOGLE_CLIENT_ID || "";
const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";

export function getGoogleRedirectUri(origin?: string): string {
  // 1. Explicit app URL from environment (if configured to non-localhost, use it)
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl && !envUrl.includes("localhost")) {
    return `${envUrl.replace(/\/$/, "")}/api/auth/google/callback`;
  }
  // 2. Vercel deployment URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}/api/auth/google/callback`;
  }
  // 3. Dynamic origin from the incoming HTTP request
  if (origin && !origin.includes("localhost")) {
    return `${origin.replace(/\/$/, "")}/api/auth/google/callback`;
  }
  // 4. Default configured URL or localhost fallback
  const fallback = (envUrl || "http://localhost:3000").replace(/\/$/, "");
  return `${fallback}/api/auth/google/callback`;
}

export function getGoogleClient(originOrUri?: string): Google {
  const redirectUri = originOrUri?.includes("/api/auth/google/callback")
    ? originOrUri
    : getGoogleRedirectUri(originOrUri);
  return new Google(clientId, clientSecret, redirectUri);
}

export const google = getGoogleClient();

