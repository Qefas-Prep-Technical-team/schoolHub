import { Request, Response } from "express";
import * as gradeService from "./grade.service";

export const getGradeHub = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.query;
    const grades = await gradeService.getGradeHubService(schoolId as string, req.query);
    res.json({ success: true, data: grades });
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
    const { score, remarks } = req.body;
    const grade = await gradeService.updateGradeScoreService(id as string, score, remarks);
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
