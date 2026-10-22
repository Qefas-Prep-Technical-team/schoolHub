import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import {
  getManualReviewQueueService,
  markSubjectiveAnswerService,
} from "./exam-review.service";
import { handleError } from "../../utils/error-handler";

export const getManualReviewQueue = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || ![UserRole.ADMIN, UserRole.TEACHER].includes(user.userType)) {
      return res.status(403).json({
        success: false,
        message: "Only admins and teachers can review subjective answers",
      });
    }

    const isSuperAdmin = (user.userType as string) === "SUPER_ADMIN";
    const schoolId = isSuperAdmin ? undefined : (user.schoolId || (user as any).school?.id);

    const data = await getManualReviewQueueService({
      schoolId,
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
    const user = req.user;
    if (!user || ![UserRole.ADMIN, UserRole.TEACHER].includes(user.userType)) {
      return res.status(403).json({
        success: false,
        message: "Only admins and teachers can mark subjective answers",
      });
    }

    const { scoreAwarded, reviewNote } = req.body;
    const isSuperAdmin = (user.userType as string) === "SUPER_ADMIN";
    const schoolId = isSuperAdmin ? undefined : (user.schoolId || (user as any).school?.id);

    const data = await markSubjectiveAnswerService({
      answerId: req.params.answerId as string,
      scoreAwarded,
      reviewNote,
      reviewerId: user.id,
      schoolId,
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
