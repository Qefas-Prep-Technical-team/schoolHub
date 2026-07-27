import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import {
  deleteExamAttemptService,
  getExamAttemptService,
  getExamAttemptsService,
  getExamResultService,
  getExamReviewDataService,
  getStudentExamAttemptsService,
  saveExamAnswerService,
  startExamAttemptService,
  submitExamAttemptService,
  submitSubjectPaperAttemptService,
} from "./exam-attempt.service";
import { handleError } from "../../utils/error-handler";

export const startExamAttempt = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.userType !== UserRole.STUDENT) {
      return res.status(403).json({
        success: false,
        message: "Only students can start exams",
      });
    }

    const data = await startExamAttemptService({
      examId: req.params.id as string,
      studentId: req.user.id,
      deviceId: req.body.deviceId,
    });

    return res.status(200).json({
      success: true,
      message: "Exam attempt started successfully",
      data,
    });
  } catch (error: any) {
    return handleError(res, error, "exam.startExamAttempt");
  }
};

export const getExamAttempt = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.userType !== UserRole.STUDENT) {
      return res.status(403).json({
        success: false,
        message: "Only students can view their exam attempt",
      });
    }

    const data = await getExamAttemptService({
      examId: req.params.id as string,
      studentId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return handleError(res, error, "exam.getExamAttempt");
  }
};

export const saveExamAnswer = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.userType !== UserRole.STUDENT) {
      return res.status(403).json({
        success: false,
        message: "Only students can submit answers",
      });
    }

    const { subjectPaperId, questionId, answer } = req.body;

    const data = await saveExamAnswerService({
      examId: req.params.id as string,
      studentId: req.user.id,
      subjectPaperId,
      questionId,
      answer,
    });

    return res.status(200).json({
      success: true,
      message: "Answer saved successfully",
      data,
    });
  } catch (error: any) {
    return handleError(res, error, "exam.saveExamAnswer");
  }
};

export const submitExamAttempt = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.userType !== UserRole.STUDENT) {
      return res.status(403).json({
        success: false,
        message: "Only students can submit exam attempts",
      });
    }

    const data = await submitExamAttemptService({
      examId: req.params.id as string,
      studentId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Exam submitted successfully",
      data,
    });
  } catch (error: any) {
    return handleError(res, error, "exam.submitExamAttempt");
  }
};

export const getExamResult = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const studentId =
      req.user.userType === UserRole.STUDENT
        ? req.user.id
        : String(req.query.studentId || "");

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId is required",
      });
    }

    const data = await getExamResultService({
      examId: req.params.id as string,
      studentId,
      requestingUserRole: req.user.userType,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return handleError(res, error, "exam.getExamResult");
  }
};

export const getExamReviewData = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const studentId =
      req.user.userType === UserRole.STUDENT
        ? req.user.id
        : String(req.query.studentId || "");

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId is required",
      });
    }

    const data = await getExamReviewDataService({
      examId: req.params.id as string,
      studentId,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return handleError(res, error, "exam.getExamReviewData");
  }
};

export const getMyExamAttempts = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.userType !== UserRole.STUDENT) {
      return res.status(403).json({
        success: false,
        message: "Only students can view their exam attempts",
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const data = await getStudentExamAttemptsService(req.user.id, page, limit);

    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error: any) {
    return handleError(res, error, "exam.getMyExamAttempts");
  }
};
export const getExamAttempts = async (req: Request, res: Response) => {
  try {
    const data = await getExamAttemptsService({
      examId: req.params.id as string,
      schoolId: (req.user as any)?.schoolId,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return handleError(res, error, "exam.getExamAttempts");
  }
};

export const submitSubjectPaper = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.userType !== UserRole.STUDENT) {
      return res.status(403).json({
        success: false,
        message: "Only students can submit subject papers",
      });
    }

    const data = await submitSubjectPaperAttemptService({
      examId: req.params.id as string,
      studentId: req.user.id,
      subjectPaperId: req.params.paperId as string,
    });

    return res.status(200).json({
      success: true,
      message: "Subject paper submitted successfully",
      data,
    });
  } catch (error: any) {
    return handleError(res, error, "exam.submitSubjectPaper");
  }
};

export const deleteExamAttempt = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const studentId = req.params.studentId as string;

    if (!id || !studentId) {
      return res.status(400).json({
        success: false,
        message: "examId and studentId are required",
      });
    }

    await deleteExamAttemptService({
      examId: id,
      studentId,
    });

    return res.status(200).json({
      success: true,
      message: "Exam attempt deleted successfully",
    });
  } catch (error: any) {
    return handleError(res, error, "exam.deleteExamAttempt");
  }
};
