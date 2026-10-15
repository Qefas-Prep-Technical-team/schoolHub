import { Google } from "arctic";

const clientId = process.env.GOOGLE_CLIENT_ID || "";
const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const google = new Google(
  clientId,
  clientSecret,
  `${appUrl}/api/auth/google/callback`
);
