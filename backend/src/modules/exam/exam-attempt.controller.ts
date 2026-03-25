import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import {
  getExamAttemptService,
  getExamResultService,
  getExamReviewDataService,
  saveExamAnswerService,
  startExamAttemptService,
  submitExamAttemptService,
} from "./exam-attempt.service";

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
    });

    return res.status(200).json({
      success: true,
      message: "Exam attempt started successfully",
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to start exam attempt",
    });
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
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch exam attempt",
    });
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
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to save answer",
    });
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
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to submit exam",
    });
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
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch result",
    });
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
      examId: req.params.id,
      studentId,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch review data",
    });
  }
};
