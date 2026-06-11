const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { teacherAttendanceService } = require('./src/modules/teacher/teacher-attendance.service');

async function run() {
  try {
    // We don't have valid IDs, but we can see if it fails on Zod validation or Prisma schema validation immediately.
    // Wait, teacherAttendanceService doesn't do Zod validation, it's just the Prisma logic.
    // Let's just test Zod validation.
    const { z } = require('zod');
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

    const payload = {
      classId: "123e4567-e89b-12d3-a456-426614174000",
      date: "2026-06-10T00:00:00.000Z",
      attendanceRecords: [
        {
          studentId: "123e4567-e89b-12d3-a456-426614174000",
          status: "PRESENT",
          note: ""
        }
      ]
    };
    
    console.log("Zod parse:", saveAttendanceSchema.parse(payload));
  } catch(e) {
    console.error("TEST ERROR:", e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
