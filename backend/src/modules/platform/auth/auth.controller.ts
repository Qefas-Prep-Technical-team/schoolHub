import { Request, Response } from "express";
import prisma from "../../../config/database";
import { comparePassword, generateStaffToken } from "./auth.service";

/**
 * Isolated login for Platform Staff
 */
export const platformLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find staff record
    const staff = await prisma.platformStaff.findUnique({
      where: { email },
    });

    if (!staff || !staff.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials or account deactivated",
      });
    }

    // Verify password
    const isMatch = await comparePassword(password, staff.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update last login
    await prisma.platformStaff.update({
      where: { id: staff.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate isolated staff token
    const token = generateStaffToken({
      id: staff.id,
      email: staff.email,
      role: staff.role,
    });

    // Set cookie
    res.cookie("platform_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
      sameSite: "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Platform login successful",
      data: {
        id: staff.id,
        fullName: staff.fullName,
        email: staff.email,
        role: staff.role,
        token
      },
    });
  } catch (error: any) {
    console.error(`[Platform Auth Error]`, error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during platform login",
    });
  }
};

/**
 * Staff logout
 */
export const platformLogout = async (req: Request, res: Response) => {
  res.clearCookie("platform_token");
  return res.status(200).json({
    success: true,
    message: "Logged out from platform console",
  });
};

/**
 * Get current staff profile
 */
export const getStaffProfile = async (req: Request, res: Response) => {
  try {
    const staffId = (req as any).staff?.id;
    if (!staffId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const staff = await prisma.platformStaff.findUnique({
      where: { id: staffId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true
      }
    });

    return res.status(200).json({
      success: true,
      data: staff
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
};
