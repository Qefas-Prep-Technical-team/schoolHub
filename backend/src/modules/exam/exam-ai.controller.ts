import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import {
  cleanupAndFormatPassageText,
  generateStructuredExamQuestionsFromPrompt,
  parseRawExamTextToStructuredQuestions,
} from "./exam-ai.service";
import { handleError } from "../../utils/error-handler";
import { AiLimiterService } from "../subscription/ai-limiter.service";

export const parseRawExamText = async (req: Request, res: Response) => {
  try {
    if (!req.user || ![UserRole.ADMIN, UserRole.TEACHER].includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: "Only admins and teachers can use AI exam parsing",
      });
    }

    // 1. Check daily rate limit
    const stats = await AiLimiterService.getAiUsageStats(
      req.user.id,
      req.user.userType,
      req.user.schoolId
    );

    if (stats.current >= stats.limit) {
      return res.status(429).json({
        success: false,
        message: `Daily AI usage limit reached (${stats.limit} prompts/day). Please try again tomorrow or upgrade your plan.`,
        limit: stats.limit,
        current: stats.current,
      });
    }

    const { rawText, subjectName, examTitle, questionType } = req.body;

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
      questionType,
    });

    // 2. Log usage after successful generation
    await AiLimiterService.logAiUsage(req.user.id, "PARSE_TEXT");

    return res.status(200).json({
      success: true,
      message: "Exam text parsed successfully",
      data,
    });
  } catch (error: any) {
    return handleError(res, error, "exam.parseRawExamText");
  }
};

export const cleanupReadingPassage = async (req: Request, res: Response) => {
  try {
    if (!req.user || ![UserRole.ADMIN, UserRole.TEACHER].includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: "Only administrators and teachers can use AI passage cleanup",
      });
    }

    const { rawText, subjectName } = req.body;

    if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
      return res.status(400).json({
        success: false,
        message: "rawText is required and cannot be empty",
      });
    }

    // 1. Check daily rate limit
    const stats = await AiLimiterService.getAiUsageStats(
      req.user.id,
      req.user.userType,
      req.user.schoolId
    );

    if (stats.current >= stats.limit) {
      return res.status(429).json({
        success: false,
        message: `Daily AI usage limit reached (${stats.limit} prompts/day). Please try again tomorrow or upgrade your plan.`,
        limit: stats.limit,
        current: stats.current,
      });
    }

    const cleanedText = await cleanupAndFormatPassageText({
      rawText: rawText.trim(),
      subjectName,
    });

    // 2. Log usage after successful execution
    await AiLimiterService.logAiUsage(req.user.id, "CLEANUP_PASSAGE");

    return res.status(200).json({
      success: true,
      message: "Passage cleaned up and formatted successfully",
      data: { cleanedText },
    });
  } catch (error: any) {
    return handleError(res, error, "exam.cleanupReadingPassage");
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

    // 1. Check daily rate limit
    const stats = await AiLimiterService.getAiUsageStats(
      req.user.id,
      req.user.userType,
      req.user.schoolId
    );

    if (stats.current >= stats.limit) {
      return res.status(429).json({
        success: false,
        message: `Daily AI usage limit reached (${stats.limit} prompts/day). Please try again tomorrow or upgrade your plan.`,
        limit: stats.limit,
        current: stats.current,
      });
    }

    const { prompt, subjectName, examTitle, questionCount, questionType } = req.body;

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
      questionType,
    });

    // 2. Log usage after successful generation
    await AiLimiterService.logAiUsage(req.user.id, "GENERATE_QUESTIONS");

    return res.status(200).json({
      success: true,
      message: "Exam questions generated successfully",
      data,
    });
  } catch (error: any) {
    return handleError(res, error, "exam.generateExamQuestions");
  }
};
