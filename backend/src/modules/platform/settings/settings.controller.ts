import { Request, Response } from "express";
import prisma from "../../../config/database";
import { createActivityLog } from "../logs/logs.controller";

/**
 * Get all platform settings
 */
export const getPlatformSettings = async (req: Request, res: Response) => {
  try {
    const settings = await prisma.platformSettings.findMany();
    // Convert to a handy key-value object for frontend
    const settingsMap = settings.reduce((acc: any, s: any) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
    
    return res.status(200).json({ success: true, data: settingsMap });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch settings" });
  }
};

/**
 * Get public platform settings (no auth required)
 */
export const getPublicPlatformSettings = async (req: Request, res: Response) => {
  try {
    const publicKeys = ["google_auth_enabled", "platform_name", "maintenance_mode"];
    const settings = await prisma.platformSettings.findMany({
      where: { key: { in: publicKeys } }
    });
    
    const settingsMap = settings.reduce((acc: any, s: any) => {
      acc[s.key] = s.value;
      return acc;
    }, {});

    // Ensure defaults if not set
    if (settingsMap.google_auth_enabled === undefined) settingsMap.google_auth_enabled = "true";
    if (settingsMap.maintenance_mode === undefined) settingsMap.maintenance_mode = "false";

    // Fetch Google Login feature status for role-specific checks
    const googleLoginFeature = await prisma.platformFeature.findUnique({
      where: { featureKey: "googleLogin" }
    });

    if (googleLoginFeature) {
      settingsMap.google_login_feature = {
        student: googleLoginFeature.studentEnabled,
        teacher: googleLoginFeature.teacherEnabled,
        parent: googleLoginFeature.parentEnabled,
        admin: googleLoginFeature.adminEnabled
      };
    } else {
      // Default to enabled if feature not defined in DB yet
      settingsMap.google_login_feature = {
        student: true,
        teacher: true,
        parent: true,
        admin: true
      };
    }
    
    return res.status(200).json({ success: true, data: settingsMap });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch public settings" });
  }
};

/**
 * Update a specific platform setting
 */
export const updateSetting = async (req: Request, res: Response) => {
  try {
    const { key, value } = req.body;

    if (!key) return res.status(400).json({ success: false, message: "Key is required" });

    const setting = await prisma.platformSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });

    // Activity Log
    const loggingStaff = (req as any).staff;
    if (loggingStaff) {
        await createActivityLog(
            loggingStaff.id,
            "UPDATE_SETTING",
            "PlatformSettings",
            setting.id,
            { key: setting.key }
        );
    }

    return res.status(200).json({
      success: true,
      message: `Setting '${key}' updated`,
      data: setting
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update setting" });
  }
};

/**
 * Batch update settings
 */
export const batchUpdateSettings = async (req: Request, res: Response) => {
  try {
    const { settings } = req.body; // Array of { key, value }

    if (!Array.isArray(settings)) {
        return res.status(400).json({ success: false, message: "Settings array required" });
    }

    const updates = settings.map((s: { key: string, value: any }) => 
        prisma.platformSettings.upsert({
            where: { key: s.key },
            update: { value: s.value },
            create: { key: s.key, value: s.value }
        })
    );

    await Promise.all(updates);

    // Activity Log
    const loggingStaff = (req as any).staff;
    if (loggingStaff) {
        await createActivityLog(
            loggingStaff.id,
            "BATCH_UPDATE_SETTINGS",
            "PlatformSettings",
            undefined,
            { count: settings.length }
        );
    }

    return res.status(200).json({ success: true, message: "Settings batch updated" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to batch update settings" });
  }
};
