import { Request, Response } from "express";
import { getTeacherClassOfflineGradesService } from "./teacher-class-offline-grades.service";
import { handleError } from "../../utils/error-handler";

/**
 * Controller to handle fetching offline grades for a specific class assigned to the teacher.
 * Route: GET /api/v1/teacher/classes/:classId/offline-grades
 */
export const getTeacherClassOfflineGrades = async (req: Request, res: Response) => {
  try {
    const teacherId = (req as any).user?.id;
    const classId = Array.isArray(req.params.classId) ? req.params.classId[0] : req.params.classId;
    const userSchoolId = (req as any).user?.schoolId;
    const schoolId = (req.query.schoolId as string) || userSchoolId;

    if (!classId) {
      return res.status(400).json({ success: false, error: "classId parameter is required" });
    }

    const data = await getTeacherClassOfflineGradesService(
      teacherId,
      classId,
      schoolId,
      req.query
    );

    return res.status(200).json({
      success: true,
      data: data.grades,
      classInfo: data.classInfo,
      total: data.total
    });
  } catch (error: any) {
    return handleError(res, error, "teacher.getTeacherClassOfflineGrades");
  }
};
