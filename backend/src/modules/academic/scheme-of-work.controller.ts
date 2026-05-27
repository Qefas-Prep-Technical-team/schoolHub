import { Request, Response } from "express";
import { 
  getSubjectSchemesService, 
  createSchemeEntryService, 
  updateSchemeEntryService, 
  deleteSchemeEntryService, 
  bulkSyncSchemeService 
} from "./scheme-of-work.service";
import { getSingleString } from "../../utils/request-utils";
import { handleError } from "../../utils/error-handler";

export const getSubjectSchemes = async (req: Request, res: Response) => {
  try {
    const subjectId = getSingleString(req.params.id);
    const data = await getSubjectSchemesService(subjectId);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return handleError(res, error, "academic.getSubjectSchemes");
  }
};

export const createSchemeEntry = async (req: Request, res: Response) => {
  try {
    const subjectId = getSingleString(req.params.id);
    const entry = await createSchemeEntryService({ ...req.body, subjectId });
    return res.status(201).json({ success: true, data: entry });
  } catch (error: any) {
    return handleError(res, error, "academic.createSchemeEntry");
  }
};

export const updateSchemeEntry = async (req: Request, res: Response) => {
  try {
    const id = getSingleString(req.params.id);
    const entry = await updateSchemeEntryService(id, req.body);
    return res.status(200).json({ success: true, data: entry });
  } catch (error: any) {
    return handleError(res, error, "academic.updateSchemeEntry");
  }
};

export const deleteSchemeEntry = async (req: Request, res: Response) => {
  try {
    const id = getSingleString(req.params.id);
    await deleteSchemeEntryService(id);
    return res.status(200).json({ success: true, message: "Entry deleted" });
  } catch (error: any) {
    return handleError(res, error, "academic.deleteSchemeEntry");
  }
};

export const bulkSyncScheme = async (req: Request, res: Response) => {
  try {
    const subjectId = getSingleString(req.params.id);
    const { entries } = req.body;
    const data = await bulkSyncSchemeService(subjectId, entries);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return handleError(res, error, "academic.bulkSyncScheme");
  }
};
