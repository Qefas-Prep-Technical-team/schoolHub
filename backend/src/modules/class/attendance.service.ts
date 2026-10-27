import prisma, { withRetry } from "../../config/database";
import { createNotificationsBulk, BulkNotificationInput } from "../notification/notification.service";

export const getClassAttendanceService = async (classId: string, date?: string) => {
  const attendances = await withRetry(() => prisma.attendance.findMany({
    where: {
      classId,
      ...(date ? { date: new Date(date) } : {}),
    },
    include: {
      student: {
        include: {
          department: true,
        },
      },
    },
    orderBy: { date: "desc" },
  }), "getClassAttendanceService");

  return attendances.map((rec) => {
    let comment = rec.note || "";
    let subjects: Record<string, any> = {};
    if (rec.note && rec.note.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(rec.note);
        comment = parsed.comment ?? "";
        subjects = parsed.subjects ?? {};
      } catch {
        comment = rec.note;
      }
    }

    return {
      ...rec,
      comment,
      subjects,
    };
  });
};

export const submitAttendanceService = async (
  classId: string, 
  records: any[],
  options?: { subjectId?: string; subjectName?: string }
) => {
  if (!records || records.length === 0) return [];

  // Group records by normalized date to query existing records efficiently
  const sampleDateStr = records[0].date;
  const normalizedDate = new Date(new Date(sampleDateStr).toISOString().split('T')[0] + 'T00:00:00.000Z');
  const studentIds = records.map((r) => r.studentId as string);

  const existingList = await prisma.attendance.findMany({
    where: {
      classId,
      date: normalizedDate,
      studentId: { in: studentIds },
    },
  });

  const existingMap = new Map(existingList.map((item) => [item.studentId, item]));

  const result = await withRetry(() => prisma.$transaction(
    records.map((r) => {
      const recDate = new Date(new Date(r.date).toISOString().split('T')[0] + 'T00:00:00.000Z');
      const existing = existingMap.get(r.studentId);

      let existingComment = "";
      let existingSubjects: Record<string, any> = {};

      if (existing?.note) {
        if (existing.note.trim().startsWith("{")) {
          try {
            const parsed = JSON.parse(existing.note);
            existingComment = parsed.comment ?? "";
            existingSubjects = parsed.subjects ?? {};
          } catch {
            existingComment = existing.note;
          }
        } else {
          existingComment = existing.note;
        }
      }

      let finalStatus = r.status;
      let finalNote = r.note || "";

      if (options?.subjectId) {
        // Taking attendance for a specific subject
        existingSubjects[options.subjectId] = {
          subjectId: options.subjectId,
          subjectName: options.subjectName || "",
          status: r.status,
          recordedAt: new Date().toISOString(),
          recordedByName: r.recordedByName,
          recordedByRole: r.recordedByRole,
        };

        if (r.note) {
          existingComment = r.note;
        }

        // If the student is present for a subject period, ensure overall school attendance reflects presence
        if (r.status === "present") {
          finalStatus = "present";
        } else if (existing?.status) {
          finalStatus = existing.status;
        } else {
          finalStatus = r.status;
        }

        finalNote = JSON.stringify({
          comment: existingComment,
          subjects: existingSubjects,
        });
      } else if (r.subjects && typeof r.subjects === "object") {
        // Direct subjects map passed per student
        Object.assign(existingSubjects, r.subjects);
        const commentToSave = r.note !== undefined ? r.note : existingComment;
        finalNote = JSON.stringify({
          comment: commentToSave,
          subjects: existingSubjects,
        });
      } else {
        // Taking general daily attendance
        const commentToSave = r.note !== undefined ? r.note : existingComment;
        if (Object.keys(existingSubjects).length > 0) {
          finalNote = JSON.stringify({
            comment: commentToSave,
            subjects: existingSubjects,
          });
        } else {
          finalNote = commentToSave;
        }
      }

      return prisma.attendance.upsert({
        where: {
          classId_studentId_date: {
            classId,
            studentId: r.studentId,
            date: recDate,
          },
        },
        update: { 
          status: finalStatus, 
          note: finalNote,
          recordedById: r.recordedById,
          recordedByName: r.recordedByName,
          recordedByRole: r.recordedByRole
        },
        create: {
          classId,
          studentId: r.studentId,
          date: recDate,
          status: finalStatus,
          note: finalNote,
          recordedById: r.recordedById,
          recordedByName: r.recordedByName,
          recordedByRole: r.recordedByRole
        },
      });
    })
  ), "submitAttendanceService_transaction");

  // Fire-and-forget parent notifications so the HTTP response is not blocked.
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
