import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import { getStudentGradesService, getGradeByIdService, getAllGradesService } from "./grade.service";

export const getStudentGrades = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.userType === UserRole.STUDENT ? req.user.id : (req.query.studentId as string);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!studentId) {
      return res.status(400).json({ success: false, message: "studentId is required" });
    }

    const data = await getStudentGradesService(studentId, page, limit);
    return res.status(200).json({ success: true, ...data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getGradeById = async (req: Request, res: Response) => {
  try {
    const data = await getGradeByIdService(req.params.id as string);
    if (!data) {
      return res.status(404).json({ success: false, message: "Grade not found" });
    }
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllGrades = async (req: Request, res: Response) => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      return res.status(403).json({ success: false, message: "Unauthorized: School ID missing" });
    }

    const { classId, subject } = req.query;

    const data = await getAllGradesService({
      schoolId,
      classId: classId as string,
      subject: subject as string,
    });
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
