import { Request, Response } from "express";
import { getTeacherClassAssignmentsService, getTeacherClassDetailService, getTeacherClassGradesService, getTeacherClassesService, getTeacherDashboardStatsService, getTeacherLinkedSchoolsService, getTeacherPerformanceTrendsService, getTeacherStudentsService } from "./teacher-dashboard.service";

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
    const { schoolId, classId, search, page, limit } = req.query;

    const data = await getTeacherStudentsService({
      teacherId,
      schoolId: schoolId as string,
      classId: classId as string,
      search: search as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 8
    });

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
/**
 * Handle fetching classes for teacher
 */
export const getTeacherClasses = async (req: Request, res: Response) => {
  try {
    const teacherId = (req as any).user.id;
    const { schoolId } = req.query;

    const data = await getTeacherClassesService(teacherId, schoolId as string);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error(`[Teacher Dashboard Controller Error]`, error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch teacher classes",
    });
  }
};
/**
 * Handle fetching detailed data for a specific class
 */
export const getTeacherClassDetail = async (req: Request, res: Response) => {
  try {
    const teacherId = (req as any).user.id;
    const { classId } = req.params;

    const data = await getTeacherClassDetailService(teacherId, classId as string);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error(`[Teacher Dashboard Controller Error]`, error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch class details",
    });
  }
};

/**
 * Handle fetching assignments for a specific class
 */
export const getTeacherClassAssignments = async (req: Request, res: Response) => {
  try {
    const teacherId = (req as any).user.id;
    const { classId } = req.params;
    const { category } = req.query;

    const data = await getTeacherClassAssignmentsService(teacherId, classId as string, category as string);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error(`[Teacher Dashboard Controller Error]`, error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch class assignments",
    });
  }
};

/**
 * Handle fetching grades for a specific class
 */
export const getTeacherClassGrades = async (req: Request, res: Response) => {
  try {
    const teacherId = (req as any).user.id;
    const { classId } = req.params;

    const data = await getTeacherClassGradesService(teacherId, classId as string);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error(`[Teacher Dashboard Controller Error]`, error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch grades",
    });
  }
};
