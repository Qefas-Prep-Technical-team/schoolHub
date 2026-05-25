import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import {
  generateStructuredExamQuestionsFromPrompt,
  parseRawExamTextToStructuredQuestions,
} from "./exam-ai.service";
import { handleError } from "../../utils/error-handler";

export const parseRawExamText = async (req: Request, res: Response) => {
  try {
    if (!req.user || ![UserRole.ADMIN, UserRole.TEACHER].includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: "Only admins and teachers can use AI exam parsing",
      });
    }

    const { rawText, subjectName, examTitle } = req.body;

    if (!rawText) {
      return res.status(400).json({
        success: false,
        message: "rawText is required",
      });
    }

    const data = await parseRawExamTextToStructuredQuestions({
      rawText,
      subjectName,
      examTitle,
    });

    return res.status(200).json({
      success: true,
      message: "Exam text parsed successfully",
      data,
    });
  } catch (error: any) {
    return handleError(res, error, "exam.parseRawExamText");
  }
};

export const generateExamQuestions = async (req: Request, res: Response) => {
  try {
    if (!req.user || ![UserRole.ADMIN, UserRole.TEACHER].includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: "Only admins and teachers can generate exam questions",
      });
    }

    const { prompt, subjectName, examTitle, questionCount } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "prompt is required",
      });
    }

    const data = await generateStructuredExamQuestionsFromPrompt({
      prompt,
      subjectName,
      examTitle,
      questionCount,
    });

    return res.status(200).json({
      success: true,
      message: "Exam questions generated successfully",
      data,
    });
  } catch (error: any) {
    return handleError(res, error, "exam.generateExamQuestions");
  }
};
