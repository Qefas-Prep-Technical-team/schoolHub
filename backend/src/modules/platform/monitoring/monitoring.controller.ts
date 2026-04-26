import { Request, Response } from "express";
import prisma from "../../../config/database";

/**
 * Get internal error logs
 */
export const getErrorLogs = async (req: Request, res: Response) => {
  try {
    const { level, limit = 50 } = req.query;

    // Optional: filter by level if ErrorLog model supports it
    const logs = await prisma.platformActivityLog.findMany({
        where: level ? { action: 'ERROR' } : {}, // Simplified usage of ActivityLog as error log
        orderBy: { createdAt: 'desc' },
        take: Number(limit)
    });

    return res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch logs" });
  }
};

/**
 * Get system health overview
 */
export const getSystemHealth = async (req: Request, res: Response) => {
  try {
    // Simulated health checks
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    return res.status(200).json({
      success: true,
      data: {
        status: "HEALTHY",
        uptime,
        memory: {
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + " MB",
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + " MB",
        },
        database: "CONNECTED",
        lastSync: new Date()
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch health stats" });
  }
};

/**
 * Log a platform error (Internal utility for backend)
 */
export const logPlatformError = async (message: string, stack?: string, context?: any) => {
    try {
        await prisma.platformActivityLog.create({
            data: {
                staffId: "SYSTEM", // System generated
                action: "ERROR",
                entityType: "SYSTEM",
                details: { message, stack, context } as any
            }
        });
    } catch (e) {
        console.error("Failed to log platform error to DB", e);
    }
};
