import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import {
  addAIQuestionsToPaperService,
  addManualQuestionsToPaperService,
  createExamService,
  createSubjectPaperService,
  publishExamService,
  publishSubjectPaperService,
  validateExamService,
  validateSubjectPaperService,
} from "./exam.service";
import {
  canManageExam,
  canManageSubjectPaper,
} from "./exam.permissions";
import { canTeacherManageSubject } from "../academic/teacher-subject.permissions";

export const createExam = async (req: Request, res: Response) => {
  try {
    if (!req.user || ![UserRole.ADMIN, UserRole.TEACHER].includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: "Only admins and teachers can create exams",
      });
    }

    const data = await createExamService(req.body);

    return res.status(201).json({
      success: true,
      message: "Exam created successfully",
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create exam",
    });
  }
};

export const createSubjectPaper = async (req: Request, res: Response) => {
  try {
    const { subjectId, teacherId, title, instructions, durationMinutes } = req.body;

    if (!req.user || ![UserRole.ADMIN, UserRole.TEACHER].includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: "Only admins and teachers can create subject papers",
      });
    }

    if (req.user.userType === UserRole.TEACHER) {
      const examAllowed = await canManageExam({
        userId: req.user.id,
        userType: req.user.userType,
        examId: req.params.id as string,
      });

      if (!examAllowed) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to manage this exam",
        });
      }

      const canManageSubject = await canTeacherManageSubject({
        teacherId: req.user.id,
        subjectId,
      });

      if (!canManageSubject) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to create a paper for this subject",
        });
      }
    }

    const data = await createSubjectPaperService({
      examId: req.params.id as string,
      subjectId,
      teacherId,
      title,
      instructions,
      durationMinutes,
    });

    return res.status(201).json({
      success: true,
      message: "Subject paper created successfully",
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create subject paper",
    });
  }
};

export const addManualQuestionsToPaper = async (req: Request, res: Response) => {
  try {
    if (!req.user || ![UserRole.ADMIN, UserRole.TEACHER].includes(req.user.userType)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const allowed = await canManageSubjectPaper({
      userId: req.user.id,
      userType: req.user.userType,
      subjectPaperId: req.params.paperId as string,
    });

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to manage this subject paper",
      });
    }

    const data = await addManualQuestionsToPaperService({
      subjectPaperId: req.params.paperId as string,
      questions: req.body.questions || [],
    });

    return res.status(200).json({
      success: true,
      message: "Manual questions added successfully",
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to add manual questions",
    });
  }
};

export const addAIQuestionsToPaper = async (req: Request, res: Response) => {
  try {
    if (!req.user || ![UserRole.ADMIN, UserRole.TEACHER].includes(req.user.userType)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const allowed = await canManageSubjectPaper({
      userId: req.user.id,
      userType: req.user.userType,
      subjectPaperId: req.params.paperId as string,
    });

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to manage this subject paper",
      });
    }

    const data = await addAIQuestionsToPaperService({
      subjectPaperId: req.params.paperId as string,
      questions: req.body.questions || [],
    });

    return res.status(200).json({
      success: true,
      message: "AI questions added successfully",
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to add AI questions",
    });
  }
};

export const validateSubjectPaper = async (req: Request, res: Response) => {
  try {
    const data = await validateSubjectPaperService(req.params.paperId as string);
    return res.status(200).json({
      success: true,
      message: "Subject paper validated successfully",
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Validation failed",
    });
  }
};

export const publishSubjectPaper = async (req: Request, res: Response) => {
  try {
    const data = await publishSubjectPaperService(req.params.paperId as string);
    return res.status(200).json({
      success: true,
      message: "Subject paper published successfully",
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Publish failed",
    });
  }
};

export const validateExam = async (req: Request, res: Response) => {
  try {
    const data = await validateExamService(req.params.id as string);
    return res.status(200).json({
      success: true,
      message: "Exam validated successfully",
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Exam validation failed",
    });
  }
};

export const publishExam = async (req: Request, res: Response) => {
  try {
    const data = await publishExamService(req.params.id as string);
    return res.status(200).json({
      success: true,
      message: "Exam published successfully",
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Exam publish failed",
    });
  }
};
