import { Facebook } from "arctic";

const clientId = process.env.FACEBOOK_APP_ID || "";
const clientSecret = process.env.FACEBOOK_APP_SECRET || "";

export function getFacebookRedirectUri(origin?: string): string {
  // 1. Explicit app URL from environment
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl && !envUrl.includes("localhost")) {
    return `${envUrl.replace(/\/$/, "")}/api/auth/facebook/callback`;
  }
  // 2. Vercel deployment URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}/api/auth/facebook/callback`;
  }
  // 3. Dynamic origin from request
  if (origin && !origin.includes("localhost")) {
    return `${origin.replace(/\/$/, "")}/api/auth/facebook/callback`;
  }
  const fallback = (envUrl || "http://localhost:3000").replace(/\/$/, "");
  return `${fallback}/api/auth/facebook/callback`;
}

export function getFacebookClient(originOrUri?: string): Facebook {
  const redirectUri = originOrUri?.includes("/api/auth/facebook/callback")
    ? originOrUri
    : getFacebookRedirectUri(originOrUri);
  return new Facebook(clientId, clientSecret, redirectUri);
}

export const facebook = getFacebookClient();

