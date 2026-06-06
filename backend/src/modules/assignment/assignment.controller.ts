import { Request, Response } from "express";
import { handleError } from "../../utils/error-handler";
import * as assignmentService from "./assignment.service";

export const getStudentAssignments = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.id;
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
    const studentId = req.user?.id;
    const { id } = req.params;

    if (!studentId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const safeId = Array.isArray(id) ? id[0] : id as string;
    const data = await assignmentService.getAssignmentByIdService(studentId, safeId);

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return handleError(res, error, "assignment.getAssignmentById");
  }
};

export const getTeacherAssignmentById = async (req: Request, res: Response) => {
  try {
    const schoolId = req.headers["x-school-id"] as string;
    const { id } = req.params;

    if (!schoolId) {
      return res.status(400).json({ success: false, error: "Missing school ID" });
    }

    const safeId = Array.isArray(id) ? id[0] : id as string;
    const data = await assignmentService.getTeacherAssignmentByIdService(safeId, schoolId);

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return handleError(res, error, "assignment.getTeacherAssignmentById");
  }
};

export const submitAssignment = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.id;
    const { id } = req.params;

    if (!studentId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const safeId = Array.isArray(id) ? id[0] : id as string;
    const data = await assignmentService.submitAssignmentService(studentId, safeId, req.body);

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return handleError(res, error, "assignment.submitAssignment");
  }
};

export const getTeacherAssignments = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const schoolId = req.headers["x-school-id"] as string;

    if (!userId || !schoolId || schoolId === "undefined") {
      return res.status(400).json({ success: false, error: "Missing or invalid school ID" });
    }

    // Determine if user is admin or teacher based on context/role if needed.
    // For now, if role is TEACHER, pass teacherId. If admin, pass undefined to fetch all.
    const isTeacher = req.user?.userType === "TEACHER";
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
    const userId = req.user?.id;
    const schoolId = req.headers["x-school-id"] as string;

    if (!userId || !schoolId || schoolId === "undefined") {
      return res.status(400).json({ success: false, error: "Missing or invalid school ID" });
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
      status: (status === "publish" || status === "publish-now") ? "PUBLISHED" : status === "draft" ? "DRAFT" : "SCHEDULED",
      attachmentUrl
    });

    return res.status(201).json({ success: true, data: createdAssignments });
  } catch (error) {
    return handleError(res, error, "assignment.createAssignment");
  }
};

export const addQuestion = async (req: Request, res: Response) => {
  try {
    const { assignmentId } = req.params;
    const safeAssignmentId = Array.isArray(assignmentId) ? assignmentId[0] : assignmentId as string;
    const data = await assignmentService.addQuestionToAssignment(safeAssignmentId, req.body);
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return handleError(res, error, "assignment.addQuestion");
  }
};

export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;
    const safeQuestionId = Array.isArray(questionId) ? questionId[0] : questionId as string;
    const data = await assignmentService.updateAssignmentQuestion(safeQuestionId, req.body);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return handleError(res, error, "assignment.updateQuestion");
  }
};

export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;
    const safeQuestionId = Array.isArray(questionId) ? questionId[0] : questionId as string;
    const data = await assignmentService.deleteAssignmentQuestion(safeQuestionId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return handleError(res, error, "assignment.deleteQuestion");
  }
};

export const reorderQuestions = async (req: Request, res: Response) => {
  try {
    const { assignmentId } = req.params;
    const { reorderedIds } = req.body;
    const safeAssignmentId = Array.isArray(assignmentId) ? assignmentId[0] : assignmentId as string;
    const data = await assignmentService.reorderAssignmentQuestions(safeAssignmentId, reorderedIds);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return handleError(res, error, "assignment.reorderQuestions");
  }
};

export const updateAssignmentStatus = async (req: Request, res: Response) => {
  try {
    const headerSchoolId = req.headers["x-school-id"];
    const schoolId = Array.isArray(headerSchoolId) ? headerSchoolId[0] : headerSchoolId as string;
    const { assignmentId } = req.params;
    const { status } = req.body;

    if (!schoolId) {
      return res.status(400).json({ success: false, error: "Missing school ID" });
    }

    if (status !== "DRAFT" && status !== "PUBLISHED") {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }

    const safeAssignmentId = Array.isArray(assignmentId) ? assignmentId[0] : assignmentId as string;
    const data = await assignmentService.updateAssignmentStatusService(safeAssignmentId, schoolId, status);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return handleError(res, error, "assignment.updateAssignmentStatus");
  }
};

export const updateAssignmentSettings = async (req: Request, res: Response) => {
  try {
    const { assignmentId } = req.params;
    const safeAssignmentId = Array.isArray(assignmentId) ? assignmentId[0] : assignmentId as string;
    const schoolIdHeader = req.headers["x-school-id"];
    const schoolId = Array.isArray(schoolIdHeader) ? schoolIdHeader[0] : schoolIdHeader as string;
    
    if (!schoolId) {
      return res.status(400).json({ success: false, message: "Missing school ID" });
    }

    const data = await assignmentService.updateAssignmentSettingsService(safeAssignmentId, schoolId, req.body);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return handleError(res, error, "assignment.updateAssignmentSettings");
  }
};
