import prisma, { withRetry } from "../../config/database";
import { createNotificationsBulk, BulkNotificationInput } from "../notification/notification.service";

export const getClassAttendanceService = async (classId: string, date?: string) => {
  return withRetry(() => prisma.attendance.findMany({
    where: {
      classId,
      ...(date ? { date: new Date(date) } : {}),
    },
    include: {
      student: true,
    },
    orderBy: { date: "desc" },
  }), "getClassAttendanceService");
};

export const submitAttendanceService = async (classId: string, records: any[]) => {
  const result = await withRetry(() => prisma.$transaction(
    records.map((r) => {
      const normalizedDate = new Date(new Date(r.date).toISOString().split('T')[0] + 'T00:00:00.000Z');
      return prisma.attendance.upsert({
        where: {
          classId_studentId_date: {
            classId,
            studentId: r.studentId,
            date: normalizedDate,
          },
        },
        update: { 
          status: r.status, 
          note: r.note,
          recordedById: r.recordedById,
          recordedByName: r.recordedByName,
          recordedByRole: r.recordedByRole
        },
        create: {
          classId,
          studentId: r.studentId,
          date: normalizedDate,
          status: r.status,
          note: r.note,
          recordedById: r.recordedById,
          recordedByName: r.recordedByName,
          recordedByRole: r.recordedByRole
        },
      });
    })
  ), "submitAttendanceService_transaction");

  // Fire-and-forget parent notifications so the HTTP response is not blocked.
  // Previously this awaited 2+ queries and a notification per student sequentially,
  // which exceeded the 60s client timeout for full classes.
  void notifyParentsOfAttendance(records).catch((e) =>
    console.error("[submitAttendanceService] Parent notification error:", e)
  );

  return result;
};

const notifyParentsOfAttendance = async (records: any[]) => {
  const studentIds = [...new Set(records.map((r) => r.studentId as string))];
  const [parentLinks, students] = await Promise.all([
    prisma.parentChildLink.findMany({ where: { studentId: { in: studentIds } } }),
    prisma.student.findMany({ where: { id: { in: studentIds } }, select: { id: true, name: true } }),
  ]);
  if (parentLinks.length === 0) return;

  const nameById = new Map(students.map((s) => [s.id, s.name]));
  const recordByStudent = new Map(records.map((r) => [r.studentId as string, r]));

  const notifications: BulkNotificationInput[] = [];
  for (const link of parentLinks) {
    const r = recordByStudent.get(link.studentId);
    if (!r) continue;
    const studentName = nameById.get(link.studentId) || "Your child";
    notifications.push({
      recipientType: "PARENT",
      recipientId: link.parentId,
      type: "ACADEMIC",
      title: "Attendance Update",
      message: `${studentName} was marked ${String(r.status).toUpperCase()} for class on ${r.date}.`,
    });
  }

  // Single DB insert regardless of class size
  await createNotificationsBulk(notifications);
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

  const attendances = await withRetry(() => prisma.attendance.findMany({
    where,
  }), "getClassAttendanceSummaryService");

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
