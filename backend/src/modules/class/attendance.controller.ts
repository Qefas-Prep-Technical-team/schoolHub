import { Request, Response } from "express";
import { 
  getClassAttendanceService, 
  submitAttendanceService, 
  getClassAttendanceSummaryService 
} from "./attendance.service";
import { handleError } from "../../utils/error-handler";

export const getClassAttendance = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { date } = req.query;
    const data = await getClassAttendanceService(id, date as string);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return handleError(res, error, "class.getClassAttendance");
  }
};

export const submitAttendance = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { records } = req.body;
    const data = await submitAttendanceService(id, records);
    return res.status(200).json({ success: true, message: "Attendance submitted", data });
  } catch (error: any) {
    return handleError(res, error, "class.submitAttendance");
  }
};

export const getClassAttendanceSummary = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { month } = req.query;
    const data = await getClassAttendanceSummaryService(id, month as string);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return handleError(res, error, "class.getClassAttendanceSummary");
  }
};
