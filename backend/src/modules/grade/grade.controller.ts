import { Request, Response } from "express";
import * as gradeService from "./grade.service";
import { handleError } from "../../utils/error-handler";

export const getGradeHub = async (req: Request, res: Response) => {
  try {
    const { schoolId, page = 1, limit = 10 } = req.query;
    const userRole = (req as any).user?.role || (req as any).user?.userType;
    const userId = (req as any).user?.id;

    const queryFilters = { ...req.query };
    if (userRole === 'TEACHER') {
      queryFilters.teacherClassesOnly = 'true';
      queryFilters.currentTeacherId = userId;
    }

    const { grades, total } = await gradeService.getGradeHubService(schoolId as string, queryFilters);
    
    const totalPages = Math.ceil(total / Number(limit));

    res.json({ 
      success: true, 
      data: grades,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages
      }
    });
  } catch (error: any) {
    return handleError(res, error, "grade.getGradeHub");
  }
};

export const createGradeEntry = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role || (req as any).user.userType;
    const grade = await gradeService.createGradeEntryService(req.body, userId, userRole);
    res.json({ success: true, data: grade });
  } catch (error: any) {
    return handleError(res, error, "grade.createGradeEntry");
  }
};

export const updateGradeScore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { score, remarks, status } = req.body;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role || (req as any).user.userType;
    const grade = await gradeService.updateGradeScoreService(id as string, { score, remarks, status }, userId, userRole);
    res.json({ success: true, data: grade });
  } catch (error: any) {
    return handleError(res, error, "grade.updateGradeScore");
  }
};

export const publishGrade = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role || (req as any).user.userType;
    const grade = await gradeService.updateGradeScoreService(id as string, { status: 'PUBLISHED' }, userId, userRole);
    res.json({ success: true, data: grade });
  } catch (error: any) {
    return handleError(res, error, "grade.publishGrade");
  }
};

export const processOCR = async (req: Request, res: Response) => {
  try {
    const { imageUrl } = req.body;
    const extractedData = await gradeService.processGradeOCRService(imageUrl);
    res.json({ success: true, data: extractedData });
  } catch (error: any) {
    return handleError(res, error, "grade.processOCR");
  }
};

export const bulkCreateGrades = async (req: Request, res: Response) => {
  try {
    const { schoolId, grades } = req.body;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role || (req as any).user.userType;
    const result = await gradeService.bulkCreateGradesService(schoolId, grades, userId, userRole);
    res.json({ success: true, data: result });
  } catch (error: any) {
    return handleError(res, error, "grade.bulkCreateGrades");
  }
};

export const deleteGrade = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await gradeService.deleteGradeService(id as string);
    res.json({ success: true, data: result });
  } catch (error: any) {
    return handleError(res, error, "grade.deleteGrade");
  }
};
