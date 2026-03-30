import { Request, Response } from "express";
import {
  getSchoolTeachersService,
  getSchoolStudentsService,
  getSchoolProfileService,
  updateSchoolProfileService,
  getSchoolSettingsService,
  updateSchoolSettingsService,
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

    const data = await getSchoolStudentsService(schoolId as string, filters);

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
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
  try {
    const { schoolId } = req.params;
    if (!schoolId) {
      return res.status(400).json({ success: false, message: "schoolId is required" });
    }

    const data = await getSchoolSettingsService(schoolId as string);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error(`[School Controller Error]`, error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch school settings",
    });
  }
};

/**
 * Handle updating school settings
 */
export const updateSchoolSettings = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;
    const updateData = req.body;

    if (!schoolId) {
      return res.status(400).json({ success: false, message: "schoolId is required" });
    }

    const data = await updateSchoolSettingsService(schoolId as string, updateData);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error(`[School Controller Error]`, error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update school settings",
    });
  }
};
