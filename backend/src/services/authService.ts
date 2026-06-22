import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/database";
import { UserType } from "modules/auth/auth.types";

const getAccessSecret = () => {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error("JWT_ACCESS_SECRET not set in environment");
  return secret;
};

const getRefreshSecret = () => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error("JWT_REFRESH_SECRET not set in environment");
  return secret;
};

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string | null) => {
  if (!hash) return false;
  return bcrypt.compare(password, hash);
};

export const generateAccessToken = (userId: string, userType: UserType) => {
  console.log("DEBUG: jwt.sign access token for", userId);
  return jwt.sign({ userId, userType }, getAccessSecret(), { expiresIn: "1h" });
};

interface DeviceTrackingInfo {
  deviceType?: string;
  deviceModel?: string;
  osVersion?: string;
  ipAddress?: string;
}

export const generateRefreshToken = async (
  userId: string,
  userType: UserType,
  deviceInfo?: DeviceTrackingInfo
) => {
  console.log("DEBUG: jwt.sign refresh token for", userId);
  const token = jwt.sign({ userId, userType }, getRefreshSecret(), {
    expiresIn: "7d",
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  if (deviceInfo && deviceInfo.deviceModel) {
    const existingSession = await prisma.refreshToken.findFirst({
      where: {
        userId,
        deviceModel: deviceInfo.deviceModel,
        osVersion: deviceInfo.osVersion,
        isValid: true,
      },
    });

    if (existingSession) {
      console.log("DEBUG: prisma.refreshToken.update for", userId);
      await prisma.refreshToken.update({
        where: { id: existingSession.id },
        data: {
          token,
          expiresAt,
          ipAddress: deviceInfo.ipAddress || existingSession.ipAddress,
          lastActiveAt: new Date(),
        },
      });
      return token;
    }
  }

  console.log("DEBUG: prisma.refreshToken.create for", userId);
  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      userType,
      expiresAt,
      deviceType: deviceInfo?.deviceType,
      deviceModel: deviceInfo?.deviceModel,
      osVersion: deviceInfo?.osVersion,
      ipAddress: deviceInfo?.ipAddress,
    },
  });

  return token;
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, getAccessSecret());
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, getRefreshSecret());
};
