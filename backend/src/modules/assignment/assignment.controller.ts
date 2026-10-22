import { Request, Response } from "express";
import { handleError } from "../../utils/error-handler";
import * as assignmentService from "./assignment.service";

/**
 * Validates and resolves the schoolId for assignment operations.
 * Prevents client header spoofing across school boundaries.
 */
const getValidatedSchoolId = (req: Request): string | null => {
  const user = req.user;
  if (!user) return null;

  if (user.userType === "SUPER_ADMIN") {
    const header = req.headers["x-school-id"];
    const id = Array.isArray(header) ? header[0] : (header as string);
    return id || user.schoolId || null;
  }

  const userSchoolId = user.schoolId || (user as any).school?.id;
  const clientHeader = req.headers["x-school-id"];
  const suppliedId = Array.isArray(clientHeader) ? clientHeader[0] : (clientHeader as string);

  // If client supplied a header, it must match user's assigned school
  if (suppliedId && suppliedId !== "undefined" && userSchoolId && suppliedId !== userSchoolId) {
    return null;
  }

  return userSchoolId || suppliedId || null;
};

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
    const schoolId = getValidatedSchoolId(req);
    const { id } = req.params;

    if (!schoolId) {
      return res.status(403).json({ success: false, error: "Access denied or missing school ID" });
    }

    const safeId = Array.isArray(id) ? id[0] : id as string;
    const teacherId = (req as any).user?.id || (req as any).user?.userId;
    const data = await assignmentService.getTeacherAssignmentByIdService(safeId, schoolId, teacherId);

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
    const schoolId = getValidatedSchoolId(req);

    if (!userId || !schoolId) {
      return res.status(403).json({ success: false, error: "Access denied or missing school ID" });
    }

    const { status, page = "1", limit = "10" } = req.query;

    const data = await assignmentService.getTeacherAssignmentsService({
      schoolId,
      teacherId: userId,
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
    const schoolId = getValidatedSchoolId(req);

    if (!userId || !schoolId) {
      return res.status(403).json({ success: false, error: "Access denied or missing school ID" });
    }

    const {
      title,
      classIds,
      subjectId,
      departmentId,
      instructions,
      dueDate,
      maxScore,
      status,
      attachments,
      videoUrl,
      referenceUrl,
      scoreReleaseDate
    } = req.body;

    const attachmentUrl = attachments && attachments.length > 0 ? attachments[0] : undefined;

    const createdAssignments = await assignmentService.createAssignmentService({
      title,
      schoolId,
      teacherId: userId,
      classIds,
      subjectId,
      departmentId,
      instructions,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      totalMarks: maxScore ? parseFloat(maxScore) : undefined,
      status: (status === "publish" || status === "publish-now") ? "PUBLISHED" : status === "draft" ? "DRAFT" : "SCHEDULED",
      attachmentUrl,
      videoUrl,
      referenceUrl,
      scoreReleaseDate: scoreReleaseDate ? new Date(scoreReleaseDate) : undefined
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
    const schoolId = getValidatedSchoolId(req);
    const { assignmentId } = req.params;
    const { status } = req.body;

    if (!schoolId) {
      return res.status(403).json({ success: false, error: "Access denied or missing school ID" });
    }

    if (status !== "DRAFT" && status !== "PUBLISHED") {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }

    const safeAssignmentId = Array.isArray(assignmentId) ? assignmentId[0] : assignmentId as string;
    const userId = req.user?.id;
    const userType = req.user?.userType;

    const data = await assignmentService.updateAssignmentStatusService(safeAssignmentId, schoolId, status, userId, userType);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return handleError(res, error, "assignment.updateAssignmentStatus");
  }
};

export const updateAssignmentSettings = async (req: Request, res: Response) => {
  try {
    const { assignmentId } = req.params;
    const safeAssignmentId = Array.isArray(assignmentId) ? assignmentId[0] : assignmentId as string;
    const schoolId = getValidatedSchoolId(req);
    
    if (!schoolId) {
      return res.status(403).json({ success: false, message: "Access denied or missing school ID" });
    }

    const data = await assignmentService.updateAssignmentSettingsService(safeAssignmentId, schoolId, req.body);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return handleError(res, error, "assignment.updateAssignmentSettings");
  }
};

export const deleteAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const safeId = Array.isArray(id) ? id[0] : id as string;
    const schoolId = getValidatedSchoolId(req);
    
    if (!schoolId) {
      return res.status(403).json({ success: false, message: "Access denied or missing school ID" });
    }

    const userId = req.user?.id;
    const userType = req.user?.userType;

    await assignmentService.deleteAssignmentService(safeId, schoolId, userId, userType);
    return res.status(200).json({ success: true, message: 'Assignment deleted successfully' });
  } catch (error) {
    return handleError(res, error, 'assignment.deleteAssignment');
  }
};

export const gradeSubmission = async (req: Request, res: Response) => {
  try {
    const { id, subId } = req.params;
    const safeAssignmentId = Array.isArray(id) ? id[0] : id as string;
    const safeSubId = Array.isArray(subId) ? subId[0] : subId as string;
    
    const schoolId = getValidatedSchoolId(req);
    
    if (!schoolId) {
      return res.status(403).json({ success: false, message: "Access denied or missing school ID" });
    }

    const { grades } = req.body;
    if (!grades || !Array.isArray(grades)) {
      return res.status(400).json({ success: false, message: 'Missing or invalid grades payload' });
    }

    const userId = (req as any).user?.id;
    const userType = (req as any).user?.userType;
    await assignmentService.gradeSubmissionService(safeAssignmentId, safeSubId, schoolId, grades, userId, userType);
    return res.status(200).json({ success: true, message: 'Submission graded successfully' });
  } catch (error) {
    return handleError(res, error, 'assignment.gradeSubmission');
  }
};
