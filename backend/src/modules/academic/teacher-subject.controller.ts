import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import {
  assignTeacherToSubjectService,
  getTeacherSubjectsService,
} from "./teacher-subject.service";
import { handleError } from "../../utils/error-handler";

export const assignTeacherToSubject = async (req: Request, res: Response) => {
  try {
    const { teacherId, subjectId, schoolId } = req.body;

    if (!req.user || req.user.userType !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Only admins can assign teachers to subjects",
      });
    }

    const data = await assignTeacherToSubjectService({
      adminId: req.user.id,
      teacherId,
      subjectId,
      schoolId,
    });

    return res.status(200).json({
      success: true,
      message: "Teacher assigned to subject successfully",
      data,
    });
  } catch (error: any) {
    return handleError(res, error, "academic.assignTeacherToSubject");
  }
};

export const getTeacherSubjects = async (req: Request, res: Response) => {
  try {
    const teacherId =
      req.user?.userType === UserRole.TEACHER ? req.user.id : String(req.query.teacherId || "");

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: "teacherId is required",
      });
    }

    const data = await getTeacherSubjectsService({
      teacherId,
      schoolId: req.query.schoolId as string | undefined,
    });

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error: any) {
    return handleError(res, error, "academic.getTeacherSubjects");
  }
};
