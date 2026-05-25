import { Request, Response } from "express";
import { 
  getClassTimetableService, 
  upsertTimetablePeriodService, 
  deleteTimetablePeriodService,
  autoGenerateTimetableService,
  replicateTimetableService
} from "./timetable.service";
import { handleError } from "../../utils/error-handler";

export const getClassTimetable = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { termPeriodId } = req.query;
    const data = await getClassTimetableService(id, termPeriodId as string);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return handleError(res, error, "class.getClassTimetable");
  }
};

export const upsertTimetablePeriod = async (req: Request, res: Response) => {
  try {
    const classId = req.params.id as string;
    const data = await upsertTimetablePeriodService({ ...req.body, classId });
    return res.status(200).json({ success: true, message: "Timetable updated", data });
  } catch (error: any) {
    return handleError(res, error, "class.upsertTimetablePeriod");
  }
};

export const deleteTimetablePeriod = async (req: Request, res: Response) => {
  try {
    const periodId = req.params.periodId as string;
    await deleteTimetablePeriodService(periodId);
    return res.status(200).json({ success: true, message: "Period deleted" });
  } catch (error: any) {
    return handleError(res, error, "class.deleteTimetablePeriod");
  }
};

export const autoGenerateTimetable = async (req: Request, res: Response) => {
  try {
    const classId = req.params.id as string;
    const { termPeriodId } = req.body;
    if (!termPeriodId) {
      return res.status(400).json({ success: false, error: "termPeriodId is required" });
    }
    const data = await autoGenerateTimetableService(classId, termPeriodId);
    return res.status(200).json({ success: true, message: "Timetable auto-generated successfully", data });
  } catch (error: any) {
    return handleError(res, error, "class.autoGenerateTimetable");
  }
};

export const replicateTimetable = async (req: Request, res: Response) => {
  try {
    const classId = req.params.id as string;
    const { sourceTermPeriodId, targetTermPeriodId } = req.body;
    if (!sourceTermPeriodId || !targetTermPeriodId) {
      return res.status(400).json({ success: false, error: "Both sourceTermPeriodId and targetTermPeriodId are required" });
    }
    const data = await replicateTimetableService(classId, sourceTermPeriodId, targetTermPeriodId);
    return res.status(200).json({ success: true, message: "Timetable replicated successfully", data });
  } catch (error: any) {
    return handleError(res, error, "class.replicateTimetable");
  }
};
