import { Facebook } from "arctic";

const clientId = process.env.FACEBOOK_APP_ID || "";
const clientSecret = process.env.FACEBOOK_APP_SECRET || "";
const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

export const facebook = new Facebook(
  clientId,
  clientSecret,
  `${appUrl}/api/auth/facebook/callback`
);
