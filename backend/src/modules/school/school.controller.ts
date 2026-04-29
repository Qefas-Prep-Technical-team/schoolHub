import { Request, Response } from "express";
import {
  getSchoolTeachersService,
  getSchoolStudentsService,
  getSchoolProfileService,
  updateSchoolProfileService,
  getSchoolSettingsService,
  updateSchoolSettingsService,
  getSchoolStatsService,
  getSchoolPerformanceAnalysisService,
  getDashboardRecentActivityService,
  getSchoolBillingService,
} from "./school.service";

/**
 * Handle fetching school teachers
 */
export const getSchoolTeachers = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "schoolId is required in parameters",
      });
    }
    console.log("Fetching teachers for schoolId:", schoolId);

    const data = await getSchoolTeachersService(schoolId as string);

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error: any) {
    console.error(`[School Controller Error]`, error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch school teachers",
    });
  }
};

/**
 * Handle fetching school students
 */
export const getSchoolStudents = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;
    const { classId, gender, status, search } = req.query;

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "schoolId is required in parameters",
      });
    }

    const filters: any = {};
    if (classId) filters.classId = classId as string;
    if (gender) filters.gender = gender as string;
    if (status) {
      filters.verified = status === "Verified";
    }
    if (search) filters.search = search as string;

    const result = await getSchoolStudentsService(schoolId as string, filters);

    return res.status(200).json({
      success: true,
      count: result.total,
      data: result.data,
    });
  } catch (error: any) {
    console.error(`[School Controller Error]`, error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch school students",
    });
  }
};

/**
 * Handle fetching school stats
 */
export const getSchoolStats = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;
    if (!schoolId) {
      return res.status(400).json({ success: false, message: "schoolId is required" });
    }

    const data = await getSchoolStatsService(schoolId as string);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error(`[School Controller Error]`, error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch school stats",
    });
  }
};

/**
 * Handle fetching school performance analysis
 */
export const getSchoolPerformanceAnalysis = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;
    if (!schoolId) {
      return res.status(400).json({ success: false, message: "schoolId is required" });
    }

    const data = await getSchoolPerformanceAnalysisService(schoolId as string);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error(`[School Controller Error]`, error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch performance analysis",
    });
  }
};

/**
 * Handle fetching school profile
 */
export const getSchoolProfile = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;
    if (!schoolId) {
      return res.status(400).json({ success: false, message: "schoolId is required" });
    }

    const data = await getSchoolProfileService(schoolId as string);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error(`[School Controller Error]`, error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch school profile",
    });
  }
};

/**
 * Handle updating school profile
 */
export const updateSchoolProfile = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;
    const updateData = req.body;

    if (!schoolId) {
      return res.status(400).json({ success: false, message: "schoolId is required" });
    }

    const data = await updateSchoolProfileService(schoolId as string, updateData);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error(`[School Controller Error]`, error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update school profile",
    });
  }
};

/**
 * Handle fetching school settings
 */
export const getSchoolSettings = async (req: Request, res: Response) => {
  const { schoolId } = req.params;
  try {
    if (!schoolId) {
      return res.status(400).json({ success: false, message: "School ID is required in the request parameters." });
    }
    
    console.log(`[SettingsController] GET request for schoolId: ${schoolId}`);
    const data = await getSchoolSettingsService(schoolId as string);
    
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error(`[SettingsController] GET Error for ${schoolId}:`, error);
    
    // Check if it's a "Not Found" error from service
    const isNotFound = error.message.includes("record not found");
    
    return res.status(isNotFound ? 404 : 400).json({
      success: false,
      message: error.message || "An unexpected error occurred while fetching school settings.",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Handle updating school settings
 */
export const updateSchoolSettings = async (req: Request, res: Response) => {
  const { schoolId } = req.params;
  try {
    const updateData = req.body;

    if (!schoolId) {
      return res.status(400).json({ success: false, message: "School ID is required in the request parameters to perform an update." });
    }
    
    console.log(`[SettingsController] PATCH request for schoolId: ${schoolId}`);
    const data = await updateSchoolSettingsService(schoolId as string, updateData);
    
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error(`[SettingsController] PATCH Error for ${schoolId}:`, error);
    
    return res.status(400).json({
      success: false,
      message: error.message || "An unexpected error occurred while updating school settings.",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Handle fetching school dashboard summary
 */
export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;
    if (!schoolId) {
      return res.status(400).json({ success: false, message: "schoolId is required" });
    }

    const data = await getDashboardRecentActivityService(schoolId as string);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error(`[School Controller Error]`, error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch dashboard summary",
    });
  }
};

/**
 * Handle fetching school billing data
 */
export const getSchoolBilling = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;

    if (!schoolId) {
      return res.status(400).json({ success: false, message: "schoolId is required" });
    }

    const data = await getSchoolBillingService(schoolId as string, page, limit);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error(`[School Controller Error]`, error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch billing data",
    });
  }
};
