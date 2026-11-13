import { Request, Response } from "express";

/**
 * Staff logout
 */
export const platformLogout = async (_req: Request, res: Response) => {
  res.clearCookie("platform_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  return res.status(200).json({
    success: true,
    message: "Logged out from platform console",
  });
};
