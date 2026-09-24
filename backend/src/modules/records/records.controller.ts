import { Request, Response, NextFunction } from "express";
import { handleError } from "../../utils/error-handler";
import * as recordsService from "./records.service";
import * as recordsSchema from "./records.schema";
import prisma from "../../config/database";

export const getClassSubjectResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = (req.user as any)?.schoolId;
    if (!schoolId) {
      return res.status(400).json({ success: false, message: "School ID not found" });
    }

    const { query } = recordsSchema.getClassSubjectResultsSchema.parse({ query: req.query });

    let filterOptions: any = query;

    if (req.user?.userType === "TEACHER") {
      // The user requested that teachers can see all results (so it's not empty), 
      // but they can only edit the ones they created.
      filterOptions = { ...query };
    }

    const results = await recordsService.getClassSubjectResults(schoolId, filterOptions);

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    handleError(res, error, "records.controller.ts -> getClassSubjectResults");
  }
};

export const getStudentTermResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = (req.user as any)?.schoolId;
    if (!schoolId) {
      return res.status(400).json({ success: false, message: "School ID not found" });
    }

    const { query } = recordsSchema.getStudentTermResultsSchema.parse({ query: req.query });

    const results = await recordsService.getStudentTermResults(schoolId, query as any);

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    handleError(res, error, "records.controller.ts -> getStudentTermResults");
  }
};

export const createClassSubjectResult = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = (req.user as any)?.schoolId;
    if (!schoolId) {
      return res.status(400).json({ success: false, message: "School ID not found" });
    }

    const { body } = recordsSchema.createClassSubjectResultSchema.parse({ body: req.body });

    const userId = (req.user as any)?.id || (req.user as any)?.userId;
    const result = await recordsService.createClassSubjectResult(schoolId, { ...body, createdById: userId } as any);

    res.status(201).json({
      success: true,
      data: result,
      message: "Result configuration created successfully"
    });
  } catch (error) {
    handleError(res, error, "records.controller.ts -> createClassSubjectResult");
  }
};

export const getClassSubjectResultById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = (req.user as any)?.schoolId;
    if (!schoolId) {
      return res.status(400).json({ success: false, message: "School ID not found" });
    }

    const { params } = recordsSchema.getClassSubjectResultByIdSchema.parse({ params: req.params });

    const result = await recordsService.getClassSubjectResultById(schoolId, params.id);

    if (!result) {
      return res.status(404).json({ success: false, message: "Result configuration not found" });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    handleError(res, error, "records.controller.ts -> getClassSubjectResultById");
  }
};

export const updateClassSubjectResult = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = (req.user as any)?.schoolId;
    if (!schoolId) {
      return res.status(400).json({ success: false, message: "School ID not found" });
    }

    const { params, body } = recordsSchema.updateClassSubjectResultSchema.parse({ 
      params: req.params,
      body: req.body 
    });

    const result = await recordsService.updateClassSubjectResult(schoolId, params.id, body as any);

    res.status(200).json({
      success: true,
      data: result,
      message: "Result configuration updated successfully"
    });
  } catch (error) {
    handleError(res, error, "records.controller.ts -> updateClassSubjectResult");
  }
};

export const getStudentSubjectResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = (req.user as any)?.schoolId;
    if (!schoolId) {
      return res.status(400).json({ success: false, message: "School ID not found" });
    }

    const { query } = recordsSchema.getStudentSubjectResultsSchema.parse({ query: req.query });

    const results = await recordsService.getStudentSubjectResults(schoolId, query as any);

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    handleError(res, error, "records.controller.ts -> getStudentSubjectResults");
  }
};

export const bulkUpsertStudentSubjectResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = (req.user as any)?.schoolId;
    if (!schoolId) {
      return res.status(400).json({ success: false, message: "School ID not found" });
    }

    const { body } = recordsSchema.bulkUpsertStudentSubjectResultsSchema.parse({ body: req.body });

    await recordsService.bulkUpsertStudentSubjectResults(schoolId, body as any);

    res.status(200).json({
      success: true,
      message: "Scores saved successfully",
    });
  } catch (error) {
    handleError(res, error, "records.controller.ts -> bulkUpsertStudentSubjectResults");
  }
};

export const updatePaperLinks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = (req.user as any)?.schoolId;
    if (!schoolId) {
      return res.status(400).json({ success: false, message: "School ID not found" });
    }
    const id = req.params.id as string;
    const { paperLinks } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Result ID is required" });
    }
    if (!paperLinks || typeof paperLinks !== "object") {
      return res.status(400).json({ success: false, message: "paperLinks object is required" });
    }

    const result = await recordsService.updateClassSubjectResultPaperLinks(schoolId, id, paperLinks);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    handleError(res, error, "records.controller.ts -> updatePaperLinks");
  }
};

export const calculatePaperSync = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = (req.user as any)?.schoolId;
    if (!schoolId) {
      return res.status(400).json({ success: false, message: "School ID not found" });
    }
    const id = req.params.id as string;
    const { studentIds, category } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Result ID is required" });
    }
    if (!studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({ success: false, message: "studentIds array is required" });
    }

    const result = await recordsService.calculatePaperSync(schoolId, id, studentIds, category);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    handleError(res, error, "records.controller.ts -> calculatePaperSync");
  }
};

export const getStudentScoreBreakdown = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = (req.user as any)?.schoolId;
    if (!schoolId) {
      return res.status(400).json({ success: false, message: "School ID not found" });
    }
    const id = req.params.id as string;
    const studentId = req.params.studentId as string;

    if (!id || !studentId) {
      return res.status(400).json({ success: false, message: "Result ID and Student ID are required" });
    }

    const result = await recordsService.getStudentScoreBreakdown(schoolId, id, studentId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    handleError(res, error, "records.controller.ts -> getStudentScoreBreakdown");
  }
};

export const publishClassSubjectResult = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = (req.user as any)?.schoolId;
    if (!schoolId) {
      return res.status(400).json({ success: false, message: "School ID not found" });
    }
    const id = req.params.id as string;
    
    if (!id) {
      return res.status(400).json({ success: false, message: "Result ID is required" });
    }

    const result = await recordsService.publishClassSubjectResult(schoolId, id);
    res.status(200).json({ success: true, message: "Result published successfully", data: result });
  } catch (error) {
    handleError(res, error, "records.controller.ts -> publishClassSubjectResult");
  }
};

export const unpublishClassSubjectResult = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = (req.user as any)?.schoolId;
    if (!schoolId) {
      return res.status(400).json({ success: false, message: "School ID not found" });
    }
    const id = req.params.id as string;
    
    if (!id) {
      return res.status(400).json({ success: false, message: "Result ID is required" });
    }

    const result = await recordsService.unpublishClassSubjectResult(schoolId, id);
    res.status(200).json({ success: true, message: "Result unpublished successfully", data: result });
  } catch (error) {
    handleError(res, error, "records.controller.ts -> unpublishClassSubjectResult");
  }
};
