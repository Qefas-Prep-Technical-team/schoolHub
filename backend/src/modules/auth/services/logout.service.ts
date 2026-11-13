import { Response } from "express";
import jwt from "jsonwebtoken";
import prisma, { withRetry } from "../../../config/database";
import { invalidateSessionCache } from "../../../middleware/authMiddleware";

interface DecodedSessionToken {
  userId?: string;
  userType?: string;
}

/**
 * Clears all HTTP auth cookies with matching cookie attributes so neither
 * dashboard nor platform cookies linger across sessions.
 */
export function clearAuthCookies(res: Response) {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
  });
  // Clear strict variant as well in case cookie was issued by Google OAuth
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    path: "/",
  });
  res.clearCookie("platform_token", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
  });
}

function invalidateTokenSessionCache(token?: string) {
  if (!token) return;
  try {
    const decoded = jwt.decode(token) as DecodedSessionToken | null;
    if (decoded?.userId) {
      invalidateSessionCache(decoded.userId, decoded.userType);
    }
  } catch {
    // Ignore malformed tokens during logout cleanup
  }
}

/**
 * Revokes the refresh token in the database (with retry) and evicts any
 * short-lived in-memory auth cache entry for the signing-out user.
 */
export async function logoutSession(refreshTokenCookie?: string, accessToken?: string) {
  invalidateTokenSessionCache(accessToken);
  invalidateTokenSessionCache(refreshTokenCookie);

  if (refreshTokenCookie) {
    try {
      await withRetry(
        () => prisma.refreshToken.deleteMany({ where: { token: refreshTokenCookie } }),
        "auth_logout_deleteRefreshToken"
      );
    } catch (error) {
      console.error("[auth.logout] Failed to delete refresh token record:", error);
    }
  }
}
