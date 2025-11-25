import { NextResponse } from "next/server";

export function middleware() {
  console.log("🔥 MIDDLEWARE IS RUNNING 🔥");
  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
