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
    const settingsMap = settings.reduce((acc: any, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
    
    return res.status(200).json({ success: true, data: settingsMap });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch settings" });
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

    const updates = settings.map(s => 
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
            null,
            { count: settings.length }
        );
    }

    return res.status(200).json({ success: true, message: "Settings batch updated" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to batch update settings" });
  }
};
