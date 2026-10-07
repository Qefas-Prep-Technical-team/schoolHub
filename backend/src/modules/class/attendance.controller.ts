import { Request, Response } from "express";
import {
  getClassAttendanceService,
  submitAttendanceService,
  getClassAttendanceSummaryService
} from "./attendance.service";
import { handleError } from "../../utils/error-handler";
import { z } from "zod";
import prisma from "../../config/database";

const submitAttendanceSchema = z.object({
  records: z
    .array(
      z.object({
        studentId: z.string().min(1, "studentId is required"),
        status: z.enum(["present", "absent", "late", "excused"]),
        note: z.string().optional().default(""),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
      })
    )
    .min(1, "No attendance records provided"),
});

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
    const parsed = submitAttendanceSchema.safeParse(req.body);
    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      console.warn(`[class.submitAttendance] Validation failed for class ${id}: ${msg}`);
      return res.status(400).json({ success: false, error: msg, message: msg });
    }
    const user = req.user as any;
    let actualName = "Unknown";
    
    if (user?.id) {
      if (user.userType === "ADMIN" || user.userType === "SCHOOL_ADMIN") {
        const admin = await prisma.admin.findUnique({ where: { id: user.id } });
        if (admin) actualName = admin.name;
      } else if (user.userType === "TEACHER") {
        const teacher = await prisma.teacher.findUnique({ where: { id: user.id } });
        if (teacher) actualName = teacher.name;
      } else if (user.userType === "STUDENT") {
        const student = await prisma.student.findUnique({ where: { id: user.id } });
        if (student) actualName = student.name;
      }
    }

    const recordsWithUser = parsed.data.records.map(r => {
      return {
        ...r,
        recordedById: user?.id,
        recordedByName: actualName,
        recordedByRole: user?.userType,
      };
    });
    const data = await submitAttendanceService(id, recordsWithUser);
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
