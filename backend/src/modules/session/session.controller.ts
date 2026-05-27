import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import {
  createSessionService,
  getActiveSessionService,
  getSessionsService,
  updateSessionService,
  archiveSessionService,
  deleteSessionService,
} from "./session.service";
import { handleError } from "../../utils/error-handler";

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
    return handleError(res, error, "session.createSession");
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
    return handleError(res, error, "session.getSessions");
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
    return handleError(res, error, "session.getActiveSession");
  }
};

export const updateSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, startDate, endDate, isActive, termDates } = req.body;

    if (!req.user || req.user.userType !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Only admins can update sessions",
      });
    }

    const data = await updateSessionService(id as string, req.user.id as string, {
      name,
      startDate,
      endDate,
      isActive,
      termDates,
    });

    return res.status(200).json({
      success: true,
      message: "Session updated successfully",
      data,
    });
  } catch (error: any) {
    return handleError(res, error, "session.updateSession");
  }
};

export const archiveSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.user || req.user.userType !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Only admins can archive sessions",
      });
    }

    const data = await archiveSessionService(id as string, req.user.id as string);

    return res.status(200).json({
      success: true,
      message: "Session archived successfully",
      data,
    });
  } catch (error: any) {
    return handleError(res, error, "session.archiveSession");
  }
};

export const deleteSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.user || req.user.userType !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Only admins can delete sessions",
      });
    }

    await deleteSessionService(id as string, req.user.id as string);

    return res.status(200).json({
      success: true,
      message: "Session deleted successfully",
    });
  } catch (error: any) {
    return handleError(res, error, "session.deleteSession");
  }
};
