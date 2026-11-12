import { Request, Response } from "express";
import { getSingleString } from "../../../utils/request-utils";
import {
  assignTeacherToClassService,
  assignTeacherToSubjectAdminService,
  removeTeacherFromClassAdminService,
  removeTeacherFromSubjectAdminService,
} from "../services/teacher-assignment.service";

export const assignTeacherToClass = async (req: Request, res: Response) => {
  try {
    const inputId = getSingleString(req.params.id as string | string[] | undefined);
    const { classId, isLead = false } = req.body;
    const result = await assignTeacherToClassService({
      inputId,
      classId,
      isLead,
      initiatorUserId: req.user?.id,
      initiatorUserType: req.user?.userType,
    });
    return res.status(result.status).json(result.body);
  } catch (error: unknown) {
    console.error("assignTeacherToClass error:", error);
    const message = error instanceof Error ? error.message : "Server error";
    return res.status(500).json({ success: false, message });
  }
};

export const assignTeacherToSubject = async (req: Request, res: Response) => {
  try {
    const inputId = getSingleString(req.params.id as string | string[] | undefined);
    const { subjectId } = req.body;
    const result = await assignTeacherToSubjectAdminService({
      inputId,
      subjectId,
      initiatorUserId: req.user?.id,
      initiatorUserType: req.user?.userType,
    });
    return res.status(result.status).json(result.body);
  } catch (error: unknown) {
    console.error("assignTeacherToSubject error:", error);
    const message = error instanceof Error ? error.message : "Server error";
    return res.status(500).json({ success: false, message });
  }
};

export const removeTeacherFromSubject = async (req: Request, res: Response) => {
  try {
    const teacherId = getSingleString(req.params.id as string | string[] | undefined);
    const subjectId = getSingleString(req.params.subjectId as string | string[] | undefined);
    const result = await removeTeacherFromSubjectAdminService({
      teacherId,
      subjectId,
      initiatorUserId: req.user?.id,
      initiatorUserType: req.user?.userType,
    });
    return res.status(result.status).json(result.body);
  } catch (error: unknown) {
    console.error("removeTeacherFromSubject error:", error);
    const message = error instanceof Error ? error.message : "Server error";
    return res.status(500).json({ success: false, message });
  }
};

export const removeTeacherFromClass = async (req: Request, res: Response) => {
  try {
    const teacherId = getSingleString(req.params.id as string | string[] | undefined);
    const classId = getSingleString(req.params.classId as string | string[] | undefined);
    const result = await removeTeacherFromClassAdminService({
      teacherId,
      classId,
      initiatorUserId: req.user?.id,
      initiatorUserType: req.user?.userType,
    });
    return res.status(result.status).json(result.body);
  } catch (error: unknown) {
    console.error("removeTeacherFromClass error:", error);
    const message = error instanceof Error ? error.message : "Server error";
    return res.status(500).json({ success: false, message });
  }
};
