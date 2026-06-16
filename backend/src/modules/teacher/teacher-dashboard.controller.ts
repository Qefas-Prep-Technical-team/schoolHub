import { Request, Response } from "express";
import { getTeacherClassAssignmentsService, getTeacherClassDetailService, getTeacherClassGradesService, getTeacherClassesService, getTeacherDashboardStatsService, getTeacherLinkedSchoolsService, getTeacherPerformanceTrendsService, getTeacherProfileService, getTeacherSettingsService, getTeacherStudentsService, getTeacherSubjectsService, requestTeacherEmailUpdateService, updateTeacherProfileService, updateTeacherSettingsService, verifyTeacherEmailUpdateService, updateTeacherClassStudentGradeService } from "./teacher-dashboard.service";

/**
 * Handle fetching teacher settings
 */
export const getTeacherSettings = async (req: Request, res: Response) => {
  try {
    const teacherId = (req as any).user.id;
    const data = await getTeacherSettingsService(teacherId);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return handleError(res, error, "teacher.getTeacherSettings");
  }
};

/**
 * Handle updating teacher settings
 */
export const updateTeacherSettings = async (req: Request, res: Response) => {
  try {
    const teacherId = (req as any).user.id;
    const settings = req.body;
    const data = await updateTeacherSettingsService(teacherId, settings);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return handleError(res, error, "teacher.updateTeacherSettings");
  }
};
import { sendEmailUpdateVerification } from "../auth/auth.service";
import { handleError } from "../../utils/error-handler";

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
    return handleError(res, error, "teacher.getTeacherDashboardStats");
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
    return handleError(res, error, "teacher.getTeacherLinkedSchools");
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
    return handleError(res, error, "teacher.getTeacherPerformanceTrends");
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
    return handleError(res, error, "teacher.getTeacherStudents");
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
    return handleError(res, error, "teacher.getTeacherClasses");
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
    return handleError(res, error, "teacher.getTeacherClassDetail");
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
    return handleError(res, error, "teacher.getTeacherClassAssignments");
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
    return handleError(res, error, "teacher.getTeacherClassGrades");
  }
};

/**
 * Handle fetching subjects assigned to a teacher
 */
export const getTeacherSubjects = async (req: Request, res: Response) => {
    try {
        const teacherId = (req as any).user.id;
        const { schoolId } = req.query;

        if (!schoolId) {
            return res.status(400).json({
                success: false,
                message: "schoolId is required",
            });
        }

        const data = await getTeacherSubjectsService(teacherId, schoolId as string);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error: any) {
    return handleError(res, error, "teacher.getTeacherSubjects");
  }
};

/**
 * Handle fetching teacher profile
 */
export const getTeacherProfile = async (req: Request, res: Response) => {
    try {
        const teacherId = (req as any).user.id;
        const profile = await getTeacherProfileService(teacherId);

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Teacher profile not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: profile,
        });
    } catch (error: any) {
    return handleError(res, error, "teacher.getTeacherProfile");
  }
};

/**
 * Handle updating teacher profile
 */
export const updateTeacherProfile = async (req: Request, res: Response) => {
    try {
        const teacherId = (req as any).user.id;
        const { name, gender, dateOfBirth, profileImage, bannerImage } = req.body;

        const updatedProfile = await updateTeacherProfileService(teacherId, {
            name,
            gender,
            dateOfBirth,
            profileImage,
            bannerImage,
        });

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updatedProfile,
        });
    } catch (error: any) {
    return handleError(res, error, "teacher.updateTeacherProfile");
  }
};

/**
 * Handle requesting email update for teacher
 */
export const requestTeacherEmailUpdate = async (req: Request, res: Response) => {
    try {
        const teacherId = (req as any).user.id;
        const { newEmail } = req.body;

        if (!newEmail) {
            return res.status(400).json({ success: false, message: "New email is required" });
        }

        const code = await requestTeacherEmailUpdateService(teacherId, newEmail);
        await sendEmailUpdateVerification(newEmail, code);

        return res.status(200).json({
            success: true,
            message: "Verification code sent to your new email",
        });
    } catch (error: any) {
    return handleError(res, error, "teacher.requestTeacherEmailUpdate");
  }
};

/**
 * Handle confirming email update for teacher
 */
export const confirmTeacherEmailUpdate = async (req: Request, res: Response) => {
    try {
        const teacherId = (req as any).user.id;
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ success: false, message: "Verification code is required" });
        }

        await verifyTeacherEmailUpdateService(teacherId, code);

        return res.status(200).json({
            success: true,
            message: "Email updated successfully",
        });
    } catch (error: any) {
    return handleError(res, error, "teacher.confirmTeacherEmailUpdate");
  }
};

/**
 * Update aggregate CA and EXAM grades for a student
 */
export const updateTeacherClassStudentGrade = async (req: Request, res: Response) => {
    try {
        const { classId, studentId } = req.params;
        const teacherId = (req as any).user.id;
        
        const data = await updateTeacherClassStudentGradeService(teacherId, classId as string, studentId as string, req.body);
        
        return res.status(200).json({ success: true, message: "Grade updated successfully", data });
    } catch (error: any) {
        return handleError(res, error, "teacher.updateTeacherClassStudentGrade");
    }
};
