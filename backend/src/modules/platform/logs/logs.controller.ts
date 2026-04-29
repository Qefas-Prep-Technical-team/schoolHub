import { Request, Response } from "express";
import prisma from "../../../config/database";

/**
 * List all platform activity logs
 */
export const listLogs = async (req: Request, res: Response) => {
  try {
    const { staffId, action, entityType } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (staffId) where.staffId = staffId;
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;

    const [logs, total] = await Promise.all([
      prisma.platformActivityLog.findMany({
        where,
        include: {
          staff: { select: { fullName: true, role: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.platformActivityLog.count({ where })
    ]);

    return res.status(200).json({ 
      success: true, 
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch activity logs" });
  }
};

/**
 * Log a new manual platform action (Internal helper)
 */
export const createActivityLog = async (staffId: string, action: string, entityType?: string, entityId?: string, details?: any) => {
  try {
    await prisma.platformActivityLog.create({
      data: {
        staffId,
        action,
        entityType: entityType || "GENERAL",
        entityId,
        details: details as any
      }
    });
  } catch (error) {
    console.error("Failed to persist platform activity log", error);
  }
};
