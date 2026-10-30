import { Request, Response } from "express";
import { googleAuthService } from "../auth.service";
import { extractDeviceInfo, processNewDeviceLogin, setDeviceVerifiedCookie } from "../auth.device";
import { handleError } from "../../../utils/error-handler";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";

/**
 * Handles Google OAuth Authentication & Session Issuance
 */
export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { idToken, googleId, email, name, userRole, emailVerified, inviteToken } = req.body;

    if (!idToken && (!googleId || !email) && !inviteToken) {
      return res.status(400).json({
        success: false,
        message: "Google ID or Token is required",
      });
    }

    // Extract rich device information
    const deviceInfo = extractDeviceInfo(req);

    const tokenOrData = idToken || { googleId, email, name, emailVerified, inviteToken };
    const authResult = await googleAuthService(
      tokenOrData,
      userRole as UserRole,
      deviceInfo,
    );

    const { user, accessToken, refreshToken, token, isNewUser, userRole: actualRole, isPlatformStaff } = authResult as any;

    if (user && !isNewUser) {
      await processNewDeviceLogin({
        req,
        res,
        userId: user.id,
        userEmail: user.email,
        userRole: actualRole,
        deviceInfo,
      });
    }

    // Set HttpOnly cookies if accessed directly
    if (accessToken) {
      res.cookie(isPlatformStaff ? "platform_token" : "token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: (isPlatformStaff ? 8 : 24) * 60 * 60 * 1000,
      });
    }

    if (refreshToken) {
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    }

    let deviceVerifiedToken = "";
    if (user) {
      deviceVerifiedToken = jwt.sign(
        { userId: user.id, deviceModel: deviceInfo.deviceModel || "Known Device" },
        process.env.JWT_SECRET || "default_secret",
        { expiresIn: "365d" }
      );
      setDeviceVerifiedCookie(res, user.id, deviceInfo.deviceModel);
    }

    return res.status(200).json({
      success: true,
      message: "Google Authentication successful",
      data: {
        user: {
          id: user.id,
          name: user.name || user.fullName,
          email: user.email,
          role: user.role,
          require2FA: user.isTwoFactorEnabled || false,
          adminCode: user.adminCode || undefined,
          teacherCode: user.teacherCode || undefined,
          studentCode: user.studentCode || undefined,
          parentCode: user.parentCode || undefined,
          plan: user.plan || undefined,
        },
        accessToken: accessToken || token,
        refreshToken,
        token: accessToken || token,
        deviceVerifiedToken,
        userRole: actualRole,
        isNewUser: !!isNewUser,
        isPlatformStaff: !!isPlatformStaff,
      },
    });
  } catch (error: any) {
    if (error.code === "WRONG_PORTAL" || error.detectedRole) {
      return res.status(403).json({
        success: false,
        code: "WRONG_PORTAL",
        message: error.message,
        detectedRole: error.detectedRole,
        correctPortal: error.correctPortal,
      });
    }
    return handleError(res, error, "auth.googleAuth");
  }
};
