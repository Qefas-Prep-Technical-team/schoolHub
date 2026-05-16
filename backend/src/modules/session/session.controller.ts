import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import {
  createSessionService,
  getActiveSessionService,
  getSessionsService,
} from "./session.service";

export const createSession = async (req: Request, res: Response) => {
  try {
    const { schoolId, name, startDate, endDate, isActive, termDates } = req.body;

    if (!req.user || req.user.userType !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Only admins can create sessions",
      });
    }

    const data = await createSessionService({
      adminId: req.user.id,
      schoolId,
      name,
      startDate,
      endDate,
      isActive,
      termDates,
    });

    return res.status(201).json({
      success: true,
      message: "Session created successfully",
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create session",
    });
  }
};

export const getSessions = async (req: Request, res: Response) => {
  try {
    const data = await getSessionsService(req.query.schoolId as string | undefined);

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch sessions",
    });
  }
};

export const getActiveSession = async (req: Request, res: Response) => {
  try {
    const schoolId = String(req.query.schoolId || "");
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "schoolId is required",
      });
    }

    const data = await getActiveSessionService(schoolId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch active session",
    });
  }
};
