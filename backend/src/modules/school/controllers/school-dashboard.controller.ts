import { Request, Response } from "express";
import { handleError } from "../../../utils/error-handler";
import {
  validateSchoolAccess,
  validateAdminSchoolAccess,
  validateMemberOrParentSchoolAccess,
} from "../services/school-access.service";
import {
  getSchoolTeachersService,
  getSchoolStudentsService,
  SchoolStudentFilters,
} from "../services/school-members.service";
import {
  getSchoolStatsService,
  getSchoolPerformanceAnalysisService,
  getDashboardRecentActivityService,
  getSchoolTodayAttendanceService,
  getSchoolAttendanceOverviewService,
} from "../services/school-dashboard.service";

/**
 * Handle fetching school teachers (Restricted to ADMIN / SUPER_ADMIN or authorized school staff)
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
    if (!validateSchoolAccess(req, schoolId as string)) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied: You are not authorized to access this school's data.",
      });
    }

    const data = await getSchoolTeachersService(schoolId as string);

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error: unknown) {
    return handleError(res, error, "school.getSchoolTeachers");
  }
};

/**
 * Handle fetching school students
 */
export const getSchoolStudents = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;
    const { classId, departmentId, gender, status, search } = req.query;

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "schoolId is required in parameters",
      });
    }

    if (!validateSchoolAccess(req, schoolId as string)) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied: You are not authorized to access this school's data.",
      });
    }

    const filters: SchoolStudentFilters = {};
    if (classId && classId !== "null") filters.classId = classId as string;
    if (departmentId && departmentId !== "null") {
      filters.departmentId = departmentId as string;
    }
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
  } catch (error: unknown) {
    return handleError(res, error, "school.getSchoolStudents");
  }
};

/**
 * Handle fetching school stats
 */
export const getSchoolStats = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;
    if (!schoolId) {
      return res
        .status(400)
        .json({ success: false, message: "schoolId is required" });
    }

    if (!(await validateMemberOrParentSchoolAccess(req, schoolId as string))) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const data = await getSchoolStatsService(schoolId as string);
    return res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    return handleError(res, error, "school.getSchoolStats");
  }
};

/**
 * Handle fetching school stats (for the logged in user)
 */
export const getMySchoolStats = async (req: Request, res: Response) => {
  try {
    const schoolId = req.user?.schoolId || req.user?.tenantId;
    if (!schoolId) {
      return res
        .status(400)
        .json({ success: false, message: "schoolId not found in user token" });
    }

    if (!validateSchoolAccess(req, schoolId)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const data = await getSchoolStatsService(schoolId);
    return res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    return handleError(res, error, "school.getMySchoolStats");
  }
};

/**
 * Handle fetching school performance analysis
 */
export const getSchoolPerformanceAnalysis = async (
  req: Request,
  res: Response,
) => {
  try {
    const { schoolId } = req.params;
    if (!schoolId) {
      return res
        .status(400)
        .json({ success: false, message: "schoolId is required" });
    }

    if (!validateAdminSchoolAccess(req, schoolId as string)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const data = await getSchoolPerformanceAnalysisService(
      schoolId as string,
      req.user.id,
    );
    return res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    return handleError(res, error, "school.getSchoolPerformanceAnalysis");
  }
};

/**
 * Handle fetching school dashboard summary (Admin-only)
 */
export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;
    if (!schoolId) {
      return res
        .status(400)
        .json({ success: false, message: "schoolId is required" });
    }

    if (!validateAdminSchoolAccess(req, schoolId as string)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const data = await getDashboardRecentActivityService(schoolId as string);
    return res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    return handleError(res, error, "school.getDashboardSummary");
  }
};

/**
 * Handle fetching today's attendance across all classes (Admin-only)
 */
export const getSchoolTodayAttendance = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;
    const { date } = req.query;
    if (!schoolId) {
      return res
        .status(400)
        .json({ success: false, message: "schoolId is required" });
    }
    if (!validateAdminSchoolAccess(req, schoolId as string)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    const data = await getSchoolTodayAttendanceService(
      schoolId as string,
      date as string | undefined,
    );
    return res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    return handleError(res, error, "school.getSchoolTodayAttendance");
  }
};

/**
 * Handle fetching comprehensive attendance overview (Week / Month / Term + Subject & Class breakdown)
 */
export const getSchoolAttendanceOverview = async (
  req: Request,
  res: Response,
) => {
  try {
    const { schoolId } = req.params;
    const { range, subjectId, classId } = req.query;
    if (!schoolId) {
      return res
        .status(400)
        .json({ success: false, message: "schoolId is required" });
    }
    if (!validateSchoolAccess(req, schoolId as string)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    const validRange =
      range === "month" || range === "term" ? range : "week";
    const data = await getSchoolAttendanceOverviewService(schoolId as string, {
      range: validRange,
      subjectId: typeof subjectId === "string" ? subjectId : undefined,
      classId: typeof classId === "string" ? classId : undefined,
    });
    return res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    return handleError(res, error, "school.getSchoolAttendanceOverview");
  }
};

