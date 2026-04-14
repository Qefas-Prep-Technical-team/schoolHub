import { Request, Response } from "express";
import { getTeacherDashboardStatsService, getTeacherLinkedSchoolsService, getTeacherPerformanceTrendsService, getTeacherStudentsService } from "./teacher-dashboard.service";

/**
 * Handle fetching teacher dashboard stats
 */
export const getTeacherDashboardStats = async (req: Request, res: Response) => {
  try {
    const teacherId = (req as any).user.id;
    const { schoolId } = req.query;

    const data = await getTeacherDashboardStatsService(teacherId, schoolId as string);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error(`[Teacher Dashboard Controller Error]`, error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch teacher dashboard stats",
    });
  }
};

/**
 * Handle fetching teacher's linked schools
 */
export const getTeacherLinkedSchools = async (req: Request, res: Response) => {
  try {
    const teacherId = (req as any).user.id;

    const data = await getTeacherLinkedSchoolsService(teacherId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error(`[Teacher Dashboard Controller Error]`, error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch linked schools",
    });
  }
};

/**
 * Handle fetching teacher performance trends
 */
export const getTeacherPerformanceTrends = async (req: Request, res: Response) => {
  try {
    const teacherId = (req as any).user.id;
    const { schoolId, range } = req.query;

    const data = await getTeacherPerformanceTrendsService(
      teacherId, 
      schoolId as string, 
      range as any
    );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error(`[Teacher Dashboard Controller Error]`, error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch performance trends",
    });
  }
};

/**
 * Handle fetching students for teacher dashboard
 */
export const getTeacherStudents = async (req: Request, res: Response) => {
  try {
    const teacherId = (req as any).user.id;
    const { schoolId } = req.query;

    const data = await getTeacherStudentsService(
      teacherId, 
      schoolId as string
    );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error(`[Teacher Dashboard Controller Error]`, error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch students",
    });
  }
};
