import { Request, Response } from "express";
import { 
  getSubjectSchemesService, 
  createSchemeEntryService, 
  updateSchemeEntryService, 
  deleteSchemeEntryService, 
  bulkSyncSchemeService 
} from "./scheme-of-work.service";
import { getSingleString } from "../../utils/request-utils";

export const getSubjectSchemes = async (req: Request, res: Response) => {
  try {
<<<<<<< HEAD
    const subjectId = getSingleString(req.params.id);
=======
    const subjectId = req.params.id as string;
>>>>>>> be22764e1e3563322c0acc4c834adbfe0d64c76e
    const data = await getSubjectSchemesService(subjectId);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const createSchemeEntry = async (req: Request, res: Response) => {
  try {
<<<<<<< HEAD
    const subjectId = getSingleString(req.params.id);
=======
    const subjectId = req.params.id as string;
>>>>>>> be22764e1e3563322c0acc4c834adbfe0d64c76e
    const entry = await createSchemeEntryService({ ...req.body, subjectId });
    return res.status(201).json({ success: true, data: entry });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const updateSchemeEntry = async (req: Request, res: Response) => {
  try {
<<<<<<< HEAD
    const id = getSingleString(req.params.id);
=======
    const id = req.params.id as string;
>>>>>>> be22764e1e3563322c0acc4c834adbfe0d64c76e
    const entry = await updateSchemeEntryService(id, req.body);
    return res.status(200).json({ success: true, data: entry });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteSchemeEntry = async (req: Request, res: Response) => {
  try {
<<<<<<< HEAD
    const id = getSingleString(req.params.id);
=======
    const id = req.params.id as string;
>>>>>>> be22764e1e3563322c0acc4c834adbfe0d64c76e
    await deleteSchemeEntryService(id);
    return res.status(200).json({ success: true, message: "Entry deleted" });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const bulkSyncScheme = async (req: Request, res: Response) => {
  try {
<<<<<<< HEAD
    const subjectId = getSingleString(req.params.id);
=======
    const subjectId = req.params.id as string;
>>>>>>> be22764e1e3563322c0acc4c834adbfe0d64c76e
    const { entries } = req.body;
    const data = await bulkSyncSchemeService(subjectId, entries);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
