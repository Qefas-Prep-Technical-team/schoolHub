import { Request, Response } from "express";
import { 
  getClassTimetableService, 
  upsertTimetablePeriodService, 
  deleteTimetablePeriodService 
} from "./timetable.service";

export const getClassTimetable = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const data = await getClassTimetableService(id);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const upsertTimetablePeriod = async (req: Request, res: Response) => {
  try {
    const classId = req.params.id as string;
    const data = await upsertTimetablePeriodService({ ...req.body, classId });
    return res.status(200).json({ success: true, message: "Timetable updated", data });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteTimetablePeriod = async (req: Request, res: Response) => {
  try {
    const periodId = req.params.periodId as string;
    await deleteTimetablePeriodService(periodId);
    return res.status(200).json({ success: true, message: "Period deleted" });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
