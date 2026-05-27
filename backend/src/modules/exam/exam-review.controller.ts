import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import {
  getManualReviewQueueService,
  markSubjectiveAnswerService,
} from "./exam-review.service";
import { handleError } from "../../utils/error-handler";

export const getManualReviewQueue = async (req: Request, res: Response) => {
  try {
    if (!req.user || ![UserRole.ADMIN, UserRole.TEACHER].includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: "Only admins and teachers can review subjective answers",
      });
    }

    const data = await getManualReviewQueueService({
      examId: req.query.examId as string | undefined,
    });

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error: any) {
    return handleError(res, error, "exam.getManualReviewQueue");
  }
};

export const markSubjectiveAnswer = async (req: Request, res: Response) => {
  try {
    if (!req.user || ![UserRole.ADMIN, UserRole.TEACHER].includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: "Only admins and teachers can mark subjective answers",
      });
    }

    const { scoreAwarded, reviewNote } = req.body;

    const data = await markSubjectiveAnswerService({
      answerId: req.params.answerId as string,
      scoreAwarded,
      reviewNote,
      reviewerId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Subjective answer marked successfully",
      data,
    });
  } catch (error: any) {
    return handleError(res, error, "exam.markSubjectiveAnswer");
  }
};
