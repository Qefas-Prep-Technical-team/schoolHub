import prisma from "../../config/database";
import { createNotification } from "../notification/notification.service";

export const getClassAttendanceService = async (classId: string, date?: string) => {
  return prisma.attendance.findMany({
    where: {
      classId,
      ...(date ? { date: new Date(date) } : {}),
    },
    include: {
      student: true,
    },
    orderBy: { date: "desc" },
  });
};

export const submitAttendanceService = async (classId: string, records: any[]) => {
  const result = await prisma.$transaction(
    records.map((r) => {
      const normalizedDate = new Date(r.date).toISOString().split('T')[0] + 'T00:00:00.000Z';
      return prisma.attendance.upsert({
        where: {
          classId_studentId_date: {
            classId,
            studentId: r.studentId,
            date: normalizedDate,
          },
        },
        update: { status: r.status, note: r.note },
        create: {
          classId,
          studentId: r.studentId,
          date: normalizedDate,
          status: r.status,
          note: r.note,
        },
      });
    })
  );

  // Fire and forget notifications to parents
  for (const r of records) {
    try {
      const parentLinks = await prisma.parentChildLink.findMany({
        where: { studentId: r.studentId },
      });

      if (parentLinks.length > 0) {
        const student = await prisma.student.findUnique({ where: { id: r.studentId } });
        const studentName = student?.name || "Your child";

        for (const link of parentLinks) {
          await createNotification({
            recipientType: "PARENT",
            recipientId: link.parentId,
            type: "ACADEMIC",
            title: "Attendance Update",
            message: `${studentName} was marked ${r.status.toUpperCase()} for class on ${r.date}.`,
          }).catch(console.error); // Catch individual notification errors
        }
      }
    } catch (e) {
      console.error("Error fetching parent links for notification:", e);
    }
  }

  return result;
};

export const getClassAttendanceSummaryService = async (classId: string, month?: string) => {
  const where: any = { classId };
  if (month) {
    const [year, m] = month.split('-').map(Number);
    const startDate = new Date(Date.UTC(year, m - 1, 1));
    const endDate = new Date(Date.UTC(year, m, 0, 23, 59, 59, 999));
    where.date = {
      gte: startDate,
      lte: endDate,
    };
  }

  const attendances = await prisma.attendance.findMany({
    where,
  });

  const total = attendances.length;
  const present = attendances.filter(a => a.status === 'present').length;
  const absent = attendances.filter(a => a.status === 'absent').length;
  const late = attendances.filter(a => a.status === 'late').length;

  return {
    total,
    present,
    absent,
    late,
    rate: total > 0 ? (present / total) * 100 : 100,
  };
};
