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

export interface SchoolAttendanceOverviewOptions {
  range?: "week" | "month" | "term";
  subjectId?: string;
  classId?: string;
}

export const getSchoolAttendanceOverviewService = async (
  schoolId: string,
  options?: SchoolAttendanceOverviewOptions,
) => {
  const resolvedId = await resolveSchoolId(schoolId);
  if (!resolvedId) {
    return {
      range: options?.range || "week",
      selectedSubjectId: options?.subjectId || "overall",
      selectedClassId: options?.classId || "all",
      totalStudents: 0,
      summary: {
        totalRecords: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        attendanceRate: 0,
      },
      chartData: [],
      subjectBreakdown: [],
      classBreakdown: [],
      availableSubjects: [],
      availableClasses: [],
    };
  }

  const range = (options?.range || "week").toLowerCase() as
    | "week"
    | "month"
    | "term";
  const selectedSubjectId = options?.subjectId || "overall";
  const selectedClassId = options?.classId || "all";

  const now = new Date();
  const todayUtc = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
  );

  // Determine date window for the requested range
  let startDate: Date;
  if (range === "week") {
    // Current week Monday..Friday (or last 7 days including today)
    const dayOfWeek = todayUtc.getUTCDay(); // 0=Sun, 1=Mon
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate = new Date(todayUtc);
    startDate.setUTCDate(todayUtc.getUTCDate() - diffToMonday);
  } else if (range === "month") {
    // Last 28 days (4 weeks)
    startDate = new Date(todayUtc);
    startDate.setUTCDate(todayUtc.getUTCDate() - 27);
  } else {
    // Term: last 120 days (approx 4 months)
    startDate = new Date(todayUtc);
    startDate.setUTCDate(todayUtc.getUTCDate() - 119);
  }

  const endDateExclusive = new Date(todayUtc);
  endDateExclusive.setUTCDate(todayUtc.getUTCDate() + 1);

  const [studentWhere, classes, subjects, records] = await Promise.all([
    getActiveSchoolStudentFilter(resolvedId),
    withRetry(
      () =>
        prisma.class.findMany({
          where: { schoolId: resolvedId },
          select: {
            id: true,
            name: true,
            section: true,
            _count: { select: { enrollments: true } },
          },
          orderBy: { name: "asc" },
        }),
      "school.getSchoolAttendanceOverviewService.classes",
    ),
    withRetry(
      () =>
        prisma.subject.findMany({
          where: { schoolId: resolvedId, isArchived: false },
          select: { id: true, name: true, code: true },
          orderBy: { name: "asc" },
        }),
      "school.getSchoolAttendanceOverviewService.subjects",
    ),
    withRetry(
      () =>
        prisma.attendance.findMany({
          where: {
            class: { schoolId: resolvedId },
            ...(selectedClassId && selectedClassId !== "all"
              ? { classId: selectedClassId }
              : {}),
            date: {
              gte: startDate,
              lt: endDateExclusive,
            },
          },
          select: {
            id: true,
            classId: true,
            studentId: true,
            date: true,
            status: true,
            note: true,
            class: {
              select: { id: true, name: true, section: true },
            },
          },
          orderBy: { date: "asc" },
        }),
      "school.getSchoolAttendanceOverviewService.records",
    ),
  ]);

  const totalStudents = await withRetry(
    () => prisma.student.count({ where: studentWhere }),
    "school.getSchoolAttendanceOverviewService.totalStudents",
  );

  const subjectNameById = new Map(subjects.map((s) => [s.id, s.name]));
  const classNameById = new Map(
    classes.map((c) => [
      c.id,
      c.section ? `${c.name} (${c.section})` : c.name,
    ]),
  );

  // Parse each record's note to extract subject-level attendance entries
  interface ParsedAttendanceItem {
    classId: string;
    studentId: string;
    date: Date;
    overallStatus: string;
    subjectsMap: Record<
      string,
      { subjectId?: string; subjectName?: string; status?: string }
    >;
  }

  const parsedRecords: ParsedAttendanceItem[] = records.map((r) => {
    let subjectsMap: Record<
      string,
      { subjectId?: string; subjectName?: string; status?: string }
    > = {};
    if (r.note && r.note.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(r.note);
        if (parsed && typeof parsed.subjects === "object" && parsed.subjects) {
          subjectsMap = parsed.subjects;
        }
      } catch {
        // Ignore malformed JSON notes
      }
    }
    return {
      classId: r.classId,
      studentId: r.studentId,
      date: new Date(r.date),
      overallStatus: (r.status || "").toLowerCase(),
      subjectsMap,
    };
  });

  // Helper to resolve effective status for a record under the selected scope ('overall' or specific subjectId)
  const getEffectiveStatus = (
    rec: ParsedAttendanceItem,
    scopeSubjectId: string,
  ): "present" | "absent" | "late" | "excused" | null => {
    if (!scopeSubjectId || scopeSubjectId === "overall") {
      const s = rec.overallStatus;
      if (s === "present" || s === "absent" || s === "late" || s === "excused") {
        return s;
      }
      return null;
    }

    // Check direct subjectId key or matching subject entry inside subjectsMap
    const direct = rec.subjectsMap[scopeSubjectId];
    if (direct?.status) {
      const st = direct.status.toLowerCase();
      if (
        st === "present" ||
        st === "absent" ||
        st === "late" ||
        st === "excused"
      ) {
        return st;
      }
    }

    const targetSubName = subjectNameById.get(scopeSubjectId)?.toLowerCase();
    for (const [key, val] of Object.entries(rec.subjectsMap)) {
      if (
        key === scopeSubjectId ||
        val?.subjectId === scopeSubjectId ||
        (targetSubName && val?.subjectName?.toLowerCase() === targetSubName)
      ) {
        const st = (val?.status || "").toLowerCase();
        if (
          st === "present" ||
          st === "absent" ||
          st === "late" ||
          st === "excused"
        ) {
          return st;
        }
      }
    }

    return null;
  };

  // 1. Overall & Subject-by-Subject Breakdown across the selected range
  const subjectStatsMap = new Map<
    string,
    {
      subjectId: string;
      subjectName: string;
      present: number;
      absent: number;
      late: number;
      excused: number;
      total: number;
    }
  >();

  // Seed with school subjects so admins can see all subjects + any dynamically recorded subjects
  subjects.forEach((sub) => {
    subjectStatsMap.set(sub.id, {
      subjectId: sub.id,
      subjectName: sub.name,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      total: 0,
    });
  });

  let overallPresent = 0;
  let overallAbsent = 0;
  let overallLate = 0;
  let overallExcused = 0;
  let overallTotal = 0;

  for (const rec of parsedRecords) {
    // Overall daily attendance tally
    if (rec.overallStatus === "present") {
      overallPresent++;
      overallTotal++;
    } else if (rec.overallStatus === "absent") {
      overallAbsent++;
      overallTotal++;
    } else if (rec.overallStatus === "late") {
      overallLate++;
      overallTotal++;
    } else if (rec.overallStatus === "excused") {
      overallExcused++;
      overallTotal++;
    }

    // Subject-level tallies from rec.subjectsMap
    for (const [subKey, subVal] of Object.entries(rec.subjectsMap)) {
      const resolvedSubId = subVal?.subjectId || subKey;
      const resolvedSubName =
        subjectNameById.get(resolvedSubId) ||
        subVal?.subjectName ||
        "Subject";
      const st = (subVal?.status || "").toLowerCase();
      if (
        st !== "present" &&
        st !== "absent" &&
        st !== "late" &&
        st !== "excused"
      ) {
        continue;
      }

      if (!subjectStatsMap.has(resolvedSubId)) {
        subjectStatsMap.set(resolvedSubId, {
          subjectId: resolvedSubId,
          subjectName: resolvedSubName,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          total: 0,
        });
      }
      const entry = subjectStatsMap.get(resolvedSubId)!;
      entry.total++;
      if (st === "present") entry.present++;
      else if (st === "absent") entry.absent++;
      else if (st === "late") entry.late++;
      else if (st === "excused") entry.excused++;
    }
  }

  const subjectBreakdown = [
    {
      subjectId: "overall",
      subjectName: "Overall (Daily Arrival)",
      present: overallPresent,
      absent: overallAbsent,
      late: overallLate,
      excused: overallExcused,
      total: overallTotal,
      rate:
        overallTotal > 0
          ? Math.round(((overallPresent + overallLate) / overallTotal) * 100)
          : 0,
    },
    ...Array.from(subjectStatsMap.values()).map((s) => ({
      ...s,
      rate:
        s.total > 0 ? Math.round(((s.present + s.late) / s.total) * 100) : 0,
    })),
  ];

  // 2. Class-by-Class Breakdown for the active scope (overall or selected subject)
  const classStatsMap = new Map<
    string,
    {
      classId: string;
      className: string;
      enrolledStudents: number;
      present: number;
      absent: number;
      late: number;
      excused: number;
      total: number;
    }
  >();

  classes.forEach((c) => {
    classStatsMap.set(c.id, {
      classId: c.id,
      className: classNameById.get(c.id) || c.name,
      enrolledStudents: c._count.enrollments,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      total: 0,
    });
  });

  // 3. Summary & Chart Buckets for the active scope
  let scopedPresent = 0;
  let scopedAbsent = 0;
  let scopedLate = 0;
  let scopedExcused = 0;
  let scopedTotal = 0;

  interface BucketCounter {
    label: string;
    fullDate?: string;
    present: number;
    absent: number;
    late: number;
    excused: number;
    total: number;
  }

  const buckets: BucketCounter[] = [];

  if (range === "week") {
    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setUTCDate(startDate.getUTCDate() + i);
      // Only include Sat/Sun if there are records or if today is Sat/Sun
      const dateIso = d.toISOString().split("T")[0];
      buckets.push({
        label: dayLabels[i],
        fullDate: dateIso,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        total: 0,
      });
    }
  } else if (range === "month") {
    for (let w = 0; w < 4; w++) {
      const wStart = new Date(startDate);
      wStart.setUTCDate(startDate.getUTCDate() + w * 7);
      const wEnd = new Date(wStart);
      wEnd.setUTCDate(wStart.getUTCDate() + 6);
      const fmt = (dt: Date) =>
        dt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        });
      buckets.push({
        label: `Week ${w + 1}`,
        fullDate: `${fmt(wStart)} - ${fmt(wEnd)}`,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        total: 0,
      });
    }
  } else {
    // Term: 4 monthly buckets over the last 4 months
    for (let m = 3; m >= 0; m--) {
      const mDate = new Date(
        Date.UTC(todayUtc.getUTCFullYear(), todayUtc.getUTCMonth() - m, 1),
      );
      const label = mDate.toLocaleDateString("en-US", {
        month: "short",
        timeZone: "UTC",
      });
      const fullDate = mDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      });
      buckets.push({
        label,
        fullDate,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        total: 0,
      });
    }
  }

  for (const rec of parsedRecords) {
    const status = getEffectiveStatus(rec, selectedSubjectId);
    if (!status) continue;

    scopedTotal++;
    if (status === "present") scopedPresent++;
    else if (status === "absent") scopedAbsent++;
    else if (status === "late") scopedLate++;
    else if (status === "excused") scopedExcused++;

    // Update class breakdown
    if (!classStatsMap.has(rec.classId)) {
      classStatsMap.set(rec.classId, {
        classId: rec.classId,
        className: classNameById.get(rec.classId) || "Class",
        enrolledStudents: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        total: 0,
      });
    }
    const clsEntry = classStatsMap.get(rec.classId)!;
    clsEntry.total++;
    if (status === "present") clsEntry.present++;
    else if (status === "absent") clsEntry.absent++;
    else if (status === "late") clsEntry.late++;
    else if (status === "excused") clsEntry.excused++;

    // Assign to time bucket
    if (range === "week") {
      const recIso = rec.date.toISOString().split("T")[0];
      const bucket = buckets.find((b) => b.fullDate === recIso);
      if (bucket) {
        bucket.total++;
        if (status === "present") bucket.present++;
        else if (status === "absent") bucket.absent++;
        else if (status === "late") bucket.late++;
        else if (status === "excused") bucket.excused++;
      }
    } else if (range === "month") {
      const diffDays = Math.floor(
        (rec.date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      const weekIdx = Math.min(3, Math.max(0, Math.floor(diffDays / 7)));
      const bucket = buckets[weekIdx];
      if (bucket) {
        bucket.total++;
        if (status === "present") bucket.present++;
        else if (status === "absent") bucket.absent++;
        else if (status === "late") bucket.late++;
        else if (status === "excused") bucket.excused++;
      }
    } else {
      const recMonthLabel = rec.date.toLocaleDateString("en-US", {
        month: "short",
        timeZone: "UTC",
      });
      const bucket = buckets.find((b) => b.label === recMonthLabel);
      if (bucket) {
        bucket.total++;
        if (status === "present") bucket.present++;
        else if (status === "absent") bucket.absent++;
        else if (status === "late") bucket.late++;
        else if (status === "excused") bucket.excused++;
      }
    }
  }

  // Filter out empty Sat/Sun in week view unless they have records
  const finalBuckets =
    range === "week"
      ? buckets.filter(
          (b, idx) => idx < 5 || b.total > 0 || todayUtc.getUTCDay() === 0 || todayUtc.getUTCDay() === 6,
        )
      : buckets;

  const chartData = finalBuckets.map((b) => ({
    day: b.label,
    fullDate: b.fullDate,
    present: b.present,
    absent: b.absent,
    late: b.late,
    excused: b.excused,
    total: b.total,
    rate:
      b.total > 0 ? Math.round(((b.present + b.late) / b.total) * 100) : 0,
  }));

  const classBreakdown = Array.from(classStatsMap.values()).map((c) => ({
    ...c,
    rate: c.total > 0 ? Math.round(((c.present + c.late) / c.total) * 100) : 0,
  }));

  return {
    range,
    selectedSubjectId,
    selectedClassId,
    totalStudents,
    summary: {
      totalRecords: scopedTotal,
      present: scopedPresent,
      absent: scopedAbsent,
      late: scopedLate,
      excused: scopedExcused,
      attendanceRate:
        scopedTotal > 0
          ? Math.round(((scopedPresent + scopedLate) / scopedTotal) * 100)
          : 0,
    },
    chartData,
    subjectBreakdown,
    classBreakdown,
    availableSubjects: subjects.map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code,
    })),
    availableClasses: classes.map((c) => ({
      id: c.id,
      name: classNameById.get(c.id) || c.name,
      studentCount: c._count.enrollments,
    })),
  };
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
