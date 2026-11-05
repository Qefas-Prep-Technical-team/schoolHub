import prisma, { withRetry } from "../../../config/database";
import { resolveSchoolId } from "./school-access.service";
import {
  getActiveSchoolStudentFilter,
  getActiveSchoolTeacherFilter,
} from "./school-members.service";
export { getSchoolPerformanceAnalysisService } from "./school-performance.service";

export const getSchoolStatsService = async (schoolId: string) => {
  const resolvedId = await resolveSchoolId(schoolId);
  if (!resolvedId) {
    return { students: 0, teachers: 0, classes: 0, exams: 0, subjects: 0 };
  }

  const [studentWhere, teacherWhere, classes, exams, subjects] =
    await Promise.all([
      getActiveSchoolStudentFilter(resolvedId),
      getActiveSchoolTeacherFilter(resolvedId),
      withRetry(
        () => prisma.class.count({ where: { schoolId: resolvedId } }),
        "school.getSchoolStatsService.classes",
      ),
      withRetry(
        () => prisma.exam.count({ where: { schoolId: resolvedId } }),
        "school.getSchoolStatsService.exams",
      ),
      withRetry(
        () => prisma.subject.count({ where: { schoolId: resolvedId } }),
        "school.getSchoolStatsService.subjects",
      ),
    ]);

  const [studentCount, teacherCount] = await Promise.all([
    withRetry(
      () => prisma.student.count({ where: studentWhere }),
      "school.getSchoolStatsService.students",
    ),
    withRetry(
      () => prisma.teacher.count({ where: teacherWhere }),
      "school.getSchoolStatsService.teachers",
    ),
  ]);

  return {
    students: studentCount,
    teachers: teacherCount,
    classes,
    exams,
    subjects,
  };
};

/**
 * Fetch attendance summary across all classes for a school for a specific date (defaults to today).
 */
export const getSchoolTodayAttendanceService = async (
  schoolId: string,
  dateString?: string,
) => {
  const resolvedId = await resolveSchoolId(schoolId);
  if (!resolvedId) return [];

  let now = new Date();
  if (dateString) {
    now = new Date(dateString);
  }
  const targetDate = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
  );
  const nextDate = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + 1),
  );

  const records = await withRetry(
    () =>
      prisma.attendance.findMany({
        where: {
          class: { schoolId: resolvedId },
          date: {
            gte: targetDate,
            lt: nextDate,
          },
        },
        select: {
          classId: true,
          status: true,
          class: {
            select: { name: true, section: true },
          },
        },
      }),
    "school.getSchoolTodayAttendanceService",
  );

  if (records.length === 0) return [];

  const grouped = new Map<
    string,
    {
      className: string;
      present: number;
      absent: number;
      late: number;
      total: number;
    }
  >();

  for (const r of records) {
    if (!grouped.has(r.classId)) {
      grouped.set(r.classId, {
        className: r.class.section
          ? `${r.class.name} (${r.class.section})`
          : r.class.name,
        present: 0,
        absent: 0,
        late: 0,
        total: 0,
      });
    }
    const entry = grouped.get(r.classId)!;
    entry.total++;
    const s = r.status.toLowerCase();
    if (s === "present") entry.present++;
    else if (s === "absent") entry.absent++;
    else if (s === "late") entry.late++;
  }

  return Array.from(grouped.entries()).map(([classId, d]) => ({
    classId,
    className: d.className,
    present: d.present,
    absent: d.absent,
    late: d.late,
    total: d.total,
    rate: d.total > 0 ? Math.round((d.present / d.total) * 100) : 0,
  }));
};

/**
 * Fetch a summary of recent institutional activity for the Admin Dashboard.
 * Strictly scopes unassignedTeachers to verified ACTIVE teachers of this school
 * who have no class assignments in this school, and sanitizes teacher fields.
 */
export const getDashboardRecentActivityService = async (schoolId: string) => {
  const resolvedId = await resolveSchoolId(schoolId);
  if (!resolvedId) {
    return {
      recentExams: [],
      unassignedCount: 0,
      unassignedTeachers: [],
      classesSummary: [],
    };
  }

  const activeTeacherWhere = await getActiveSchoolTeacherFilter(resolvedId);

  const [recentExams, unassignedTeachers, classes] = await Promise.all([
    withRetry(
      () =>
        prisma.exam.findMany({
          where: { schoolId: resolvedId },
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            class: true,
            teacher: {
              select: {
                id: true,
                name: true,
                email: true,
                teacherCode: true,
                profileImage: true,
              },
            },
          },
        }),
      "school.getDashboardRecentActivityService.recentExams",
    ),
    withRetry(
      () =>
        prisma.teacher.findMany({
          where: {
            AND: [
              activeTeacherWhere,
              {
                classTeachers: {
                  none: {
                    class: { schoolId: resolvedId },
                  },
                },
              },
            ],
          },
          select: { id: true, name: true },
        }),
      "school.getDashboardRecentActivityService.unassignedTeachers",
    ),
    withRetry(
      () =>
        prisma.class.findMany({
          where: { schoolId: resolvedId },
          include: {
            _count: {
              select: { enrollments: true, teachers: true },
            },
          },
        }),
      "school.getDashboardRecentActivityService.classes",
    ),
  ]);

  return {
    recentExams,
    unassignedCount: unassignedTeachers.length,
    unassignedTeachers: unassignedTeachers.slice(0, 3),
    classesSummary: classes.map((c) => ({
      id: c.id,
      name: c.name,
      studentCount: c._count.enrollments,
      teacherCount: c._count.teachers,
    })),
  };
};
