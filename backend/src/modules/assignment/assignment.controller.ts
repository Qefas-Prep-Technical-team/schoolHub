import { Request, Response } from "express";
import { handleError } from "../../utils/error-handler";
import * as assignmentService from "./assignment.service";

export const getStudentAssignments = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.userId;
    if (!studentId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { status, page = "1", limit = "10" } = req.query;

    const data = await assignmentService.getStudentAssignmentsService({
      studentId,
      status: status as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return handleError(res, error, "assignment.getStudentAssignments");
  }
};

export const getAssignmentById = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.userId;
    const { id } = req.params;

    if (!studentId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const data = await assignmentService.getAssignmentByIdService(studentId, id);

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return handleError(res, error, "assignment.getAssignmentById");
  }
};

export const submitAssignment = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.userId;
    const { id } = req.params;

    if (!studentId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const data = await assignmentService.submitAssignmentService(studentId, id, req.body);

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return handleError(res, error, "assignment.submitAssignment");
  }
};

export const getTeacherAssignments = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const schoolId = req.headers["x-school-id"] as string;

    if (!userId || !schoolId) {
      return res.status(401).json({ success: false, error: "Unauthorized or missing school ID" });
    }

    // Determine if user is admin or teacher based on context/role if needed.
    // For now, if role is TEACHER, pass teacherId. If admin, pass undefined to fetch all.
    const isTeacher = req.user?.role === "TEACHER";
    const { status, page = "1", limit = "10" } = req.query;

    const data = await assignmentService.getTeacherAssignmentsService({
      schoolId,
      teacherId: isTeacher ? userId : undefined,
      status: status as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return handleError(res, error, "assignment.getTeacherAssignments");
  }
};

export const createAssignment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const schoolId = req.headers["x-school-id"] as string;

    if (!userId || !schoolId) {
      return res.status(401).json({ success: false, error: "Unauthorized or missing school ID" });
    }

    const {
      title,
      classIds,
      subjectId,
      instructions,
      dueDate,
      maxScore,
      status,
      attachments
    } = req.body;

    const attachmentUrl = attachments && attachments.length > 0 ? attachments[0] : undefined;

    const createdAssignments = await assignmentService.createAssignmentService({
      title,
      schoolId,
      teacherId: userId,
      classIds,
      subjectId,
      instructions,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      totalMarks: maxScore ? parseFloat(maxScore) : undefined,
      status: status === "publish" ? "PUBLISHED" : status === "draft" ? "DRAFT" : "SCHEDULED",
      attachmentUrl
    });

    return res.status(201).json({ success: true, data: createdAssignments });
  } catch (error) {
    return handleError(res, error, "assignment.createAssignment");
  }
};
