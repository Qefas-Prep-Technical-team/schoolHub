import prisma from "../../config/database";

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
  return prisma.$transaction(
    records.map((r) =>
      prisma.attendance.upsert({
        where: {
          classId_studentId_date: {
            classId,
            studentId: r.studentId,
            date: new Date(r.date).toISOString().split('T')[0] + 'T00:00:00.000Z',
          },
        },
        update: { status: r.status, note: r.note },
        create: {
          classId,
          studentId: r.studentId,
          date: new Date(r.date),
          status: r.status,
          note: r.note,
        },
      })
    )
  );
};

export const getClassAttendanceSummaryService = async (classId: string) => {
  const attendances = await prisma.attendance.findMany({
    where: { classId },
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
