import { Request, Response } from "express";
import { clearAuthCookies, logoutSession } from "../services/logout.service";

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken as string | undefined;
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
  const accessToken = (req.cookies?.token as string | undefined) || bearerToken;

  try {
    await logoutSession(refreshToken, accessToken);
  } catch (error) {
    console.error("[auth.logout] Unexpected error during logout:", error);
  }

  clearAuthCookies(res);

  return res.status(200).json({
    success: true,
    message: "Logged out",
  });
};
