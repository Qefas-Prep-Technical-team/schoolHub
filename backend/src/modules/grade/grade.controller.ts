import { Request, Response } from "express";
import * as gradeService from "./grade.service";

export const getGradeHub = async (req: Request, res: Response) => {
  try {
    const { schoolId, page = 1, limit = 10 } = req.query;
    const { grades, total } = await gradeService.getGradeHubService(schoolId as string, req.query);
    
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
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createGradeEntry = async (req: Request, res: Response) => {
  try {
    const grade = await gradeService.createGradeEntryService(req.body);
    res.json({ success: true, data: grade });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateGradeScore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { score, remarks, status } = req.body;
    const grade = await gradeService.updateGradeScoreService(id as string, { score, remarks, status });
    res.json({ success: true, data: grade });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const publishGrade = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const grade = await gradeService.updateGradeScoreService(id as string, { status: 'PUBLISHED' });
    res.json({ success: true, data: grade });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const processOCR = async (req: Request, res: Response) => {
  try {
    const { imageUrl } = req.body;
    const extractedData = await gradeService.processGradeOCRService(imageUrl);
    res.json({ success: true, data: extractedData });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const bulkCreateGrades = async (req: Request, res: Response) => {
  try {
    const { schoolId, grades } = req.body;
    const result = await gradeService.bulkCreateGradesService(schoolId, grades);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteGrade = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await gradeService.deleteGradeService(id as string);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
