import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import {
  getClassExamAnalyticsService,
  getDepartmentExamAnalyticsService,
  getExamRankingService,
  getSessionExamAnalyticsService,
  getStudentGlobalStatsService,
} from "./exam-analytics.service";
import { handleError } from "../../utils/error-handler";

export const getExamRanking = async (req: Request, res: Response) => {
  try {
    if (!req.user || ![UserRole.ADMIN, UserRole.TEACHER].includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: "Only admins and teachers can view rankings",
      });
    }

    const data = await getExamRankingService({
      examId: req.params.id as string,
    });

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error: any) {
    return handleError(res, error, "exam.getExamRanking");
  }
};

export const getClassExamAnalytics = async (req: Request, res: Response) => {
  try {
    const data = await getClassExamAnalyticsService({
      examId: req.params.id as string,
      classId: String(req.query.classId || ""),
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return handleError(res, error, "exam.getClassExamAnalytics");
  }
};

export const getDepartmentExamAnalytics = async (req: Request, res: Response) => {
  try {
    const data = await getDepartmentExamAnalyticsService({
      examId: req.params.id as string,
      departmentId: String(req.query.departmentId || ""),
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return handleError(res, error, "exam.getDepartmentExamAnalytics");
  }
};

export const getSessionExamAnalytics = async (req: Request, res: Response) => {
  try {
    const data = await getSessionExamAnalyticsService({
      sessionId: String(req.query.sessionId || ""),
    });

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error: any) {
    return handleError(res, error, "exam.getSessionExamAnalytics");
  }
};

export const getMyGlobalStats = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.userType !== UserRole.STUDENT) {
        return res.status(403).json({
          success: false,
          message: "Only students can view their personal stats",
        });
      }

    const data = await getStudentGlobalStatsService({
      studentId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return handleError(res, error, "exam.getMyGlobalStats");
  }
};
