import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UAParser } from "ua-parser-js";
import prisma from "../../config/database";
import { createNotification } from "../notification/notification.service";
import { sendNewDeviceLoginEmail } from "./auth.service";

export interface DeviceInfo {
  deviceType: string;
  deviceModel: string;
  osVersion: string;
  ipAddress: string;
}

/**
 * Extracts rich, distinct device and browser information from incoming HTTP request headers.
 * Differentiates browsers (e.g. Chrome vs Firefox vs Edge) and mobile vs desktop clients.
 */
export const extractDeviceInfo = (req: Request): DeviceInfo => {
  const userAgent = req.headers["user-agent"] || "";
  const UAParserClass = UAParser as any;
  const parser = new UAParserClass(userAgent);
  const result = parser.getResult();

  const isMobileHeader = req.headers["x-device-type"] === "mobile";
  const explicitModel = req.headers["x-device-model"] as string;
  const explicitOs = req.headers["x-os-version"] as string;

  const browserName = result.browser.name || "";
  const osName = result.os.name || "Unknown OS";
  const osVersion = result.os.version || "";

  let finalDeviceModel = explicitModel;
  if (!finalDeviceModel) {
    if (result.device.model) {
      const vendor = result.device.vendor ? `${result.device.vendor} ` : "";
      finalDeviceModel = `${vendor}${result.device.model}${browserName ? ` (${browserName})` : ""}`;
    } else if (osName === "Windows") {
      finalDeviceModel = `Windows PC (${browserName || "Browser"})`;
    } else if (osName === "Mac OS") {
      finalDeviceModel = `Mac (${browserName || "Browser"})`;
    } else if (osName === "iOS") {
      finalDeviceModel = `iPhone (${browserName || "Mobile Safari"})`;
    } else if (osName === "Android") {
      finalDeviceModel = `Android Device (${browserName || "Chrome"})`;
    } else {
      finalDeviceModel = browserName ? `${browserName} on ${osName}` : "Unknown Device";
    }
  }

  const finalOsVersion = explicitOs || `${osName} ${osVersion}`.trim();

  const ipAddress = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "")
    .toString()
    .split(",")[0]
    .trim() || "Unknown IP";

  const deviceType =
    (req.headers["x-device-type"] as string) ||
    result.device.type ||
    (isMobileHeader ? "mobile" : "desktop");

  return {
    deviceType,
    deviceModel: finalDeviceModel,
    osVersion: finalOsVersion,
    ipAddress,
  };
};

/**
 * Checks whether the incoming request contains a valid, non-expired deviceVerified cookie for this user.
 */
export const verifyDeviceCookie = (req: Request, userId: string): boolean => {
  const cookieToken = req.cookies?.deviceVerified;
  if (!cookieToken) return false;

  try {
    const payload = jwt.verify(
      cookieToken,
      process.env.JWT_SECRET || "default_secret"
    ) as any;
    return payload && payload.userId === userId;
  } catch {
    return false;
  }
};

/**
 * Sets a persistent 365-day deviceVerified cookie on the response so subsequent logins on this
 * specific browser are recognized as a known device.
 */
export const setDeviceVerifiedCookie = (
  res: Response,
  userId: string,
  deviceModel?: string
) => {
  const deviceToken = jwt.sign(
    { userId, deviceModel: deviceModel || "Known Device" },
    process.env.JWT_SECRET || "default_secret",
    { expiresIn: "365d" }
  );

  res.cookie("deviceVerified", deviceToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 365 * 24 * 60 * 60 * 1000,
  });
};

/**
 * Checks if a login is from a new/unrecognized device and dispatches in-app notification + email.
 * Always establishes a persistent deviceVerified cookie upon successful processing.
 */
export const processNewDeviceLogin = async ({
  req,
  res,
  userId,
  userEmail,
  userRole,
  deviceInfo,
  isPreAuthVerified = false,
}: {
  req: Request;
  res: Response;
  userId: string;
  userEmail: string;
  userRole: string;
  deviceInfo: DeviceInfo;
  isPreAuthVerified?: boolean;
}) => {
  const isMobileClient = req.headers["x-device-type"] === "mobile";
  const hasValidCookie = verifyDeviceCookie(req, userId);

  // Check if the user has any prior sessions (skip alert on very first login ever)
  const totalPriorSessions = await prisma.refreshToken.count({
    where: { userId },
  });

  if (totalPriorSessions > 0) {
    // Check if this exact device model and OS has a recorded session
    const existingDeviceCount = await prisma.refreshToken.count({
      where: {
        userId,
        deviceModel: deviceInfo.deviceModel,
        osVersion: deviceInfo.osVersion,
      },
    });

    const isNewDevice =
      isPreAuthVerified ||
      (!isMobileClient && !hasValidCookie) ||
      existingDeviceCount === 0;

    if (isNewDevice) {
      // 1. Dispatch real-time in-app notification
      try {
        await createNotification({
          recipientType: userRole as any,
          recipientId: userId,
          type: "GENERAL",
          title: "New Device Login Detected",
          message: `We detected a new login to your account from ${deviceInfo.deviceModel} on ${deviceInfo.osVersion}. If this wasn't you, please secure your account immediately by changing your password.`,
          meta: {
            priority: "HIGH",
            deviceModel: deviceInfo.deviceModel,
            osVersion: deviceInfo.osVersion,
            ipAddress: deviceInfo.ipAddress,
            loginAt: new Date().toISOString(),
          },
        });
      } catch (notifErr) {
        console.error("Failed to create new device login notification:", notifErr);
      }

      // 2. Dispatch security email
      sendNewDeviceLoginEmail(userEmail, {
        ...deviceInfo,
        location: deviceInfo.ipAddress,
        time: new Date().toUTCString(),
      }).catch((emailErr) => {
        console.error("Failed to dispatch new device login email:", emailErr);
      });
    }
  }

  // Always issue the 365-day persistent device cookie for web clients
  if (!isMobileClient) {
    setDeviceVerifiedCookie(res, userId, deviceInfo.deviceModel);
  }
};
