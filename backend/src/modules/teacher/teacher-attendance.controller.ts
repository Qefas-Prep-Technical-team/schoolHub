import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { teacherAttendanceService } from './teacher-attendance.service';

const saveAttendanceSchema = z.object({
  classId: z.string().uuid(),
  date: z.string().transform((val) => new Date(val)),
  attendanceRecords: z.array(
    z.object({
      studentId: z.string().uuid(),
      status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
      note: z.string().optional(),
    })
  ),
});

export class TeacherAttendanceController {
  saveClassAttendance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { schoolId } = req.params;
      // Extract teacherId from the authenticated user
      const teacherId = (req as any).user?.id || (req as any).user?.userId;

      if (!teacherId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const data = saveAttendanceSchema.parse(req.body);

      const result = await teacherAttendanceService.saveClassAttendance(
        schoolId as string,
        teacherId,
        data.classId,
        data.date,
        data.attendanceRecords
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("[saveClassAttendance] ERROR:", error.message, error.stack);
      next(error);
    }
  };
}

export const teacherAttendanceController = new TeacherAttendanceController();
