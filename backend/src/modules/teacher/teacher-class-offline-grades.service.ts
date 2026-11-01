import prisma from "../../config/database";

/**
 * Service to fetch offline grades for a specific class for an assigned teacher.
 * Returns only offline grades (manual/physical marksheet records) within this class.
 */
export const getTeacherClassOfflineGradesService = async (
  teacherId: string,
  classId: string,
  schoolId?: string,
  filters: any = {}
) => {
  // 1. Verify that teacher is assigned to this class across any of the assignment vectors
  const [assignedClassTeacher, assignedPeriod, createdClass, link] = await Promise.all([
    prisma.classTeacher.findFirst({
      where: { classId, teacherId }
    }),
    prisma.timetablePeriod.findFirst({
      where: { classId, teacherId }
    }),
    prisma.class.findFirst({
      where: { id: classId, createdById: teacherId }
    }),
    prisma.relationshipLink.findFirst({
      where: {
        classId,
        status: 'ACTIVE',
        OR: [
          { leftEntityId: teacherId, leftEntityType: 'TEACHER' },
          { rightEntityId: teacherId, rightEntityType: 'TEACHER' },
        ]
      }
    })
  ]);

  if (!assignedClassTeacher && !assignedPeriod && !createdClass && !link) {
    throw new Error("You are not assigned to this class");
  }

  // 2. Fetch class info
  const targetClass = await prisma.class.findUnique({
    where: { id: classId },
    select: { id: true, name: true, section: true, schoolId: true }
  });

  const effectiveSchoolId = schoolId || targetClass?.schoolId;

  // 3. Query offline grades specifically for this class
  const where: any = {
    classId,
    examAttemptId: null,
    subjectExamAttemptId: null,
    examId: null,
    subjectPaperId: null,
  };

  if (effectiveSchoolId) {
    where.schoolId = effectiveSchoolId;
  }

  // 3b. Resolve subjects explicitly assigned to this teacher (no class-level inheritance)
  const teacherProfile = await prisma.teacher.findUnique({
    where: { id: teacherId },
    select: { subject: true }
  });
  const focusSubjectNames = teacherProfile?.subject
    ? teacherProfile.subject.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  const assignedSubjects = await prisma.subject.findMany({
    where: {
      isArchived: false,
      ...(effectiveSchoolId ? { schoolId: effectiveSchoolId } : {}),
      OR: [
        { teacherId },
        { teacherSubjects: { some: { teacherId } } },
        { timetablePeriods: { some: { teacherId, classId } } },
        ...(focusSubjectNames.length > 0
          ? [{ name: { in: focusSubjectNames, mode: 'insensitive' as const } }]
          : [])
      ]
    },
    select: { id: true, name: true }
  });

  const assignedSubjectNames = assignedSubjects.map(s => s.name);

  // Only grades for the teacher's subjects, or grades the teacher recorded personally
  where.OR = [
    ...(assignedSubjectNames.length > 0
      ? [{ subject: { in: assignedSubjectNames, mode: 'insensitive' } }]
      : []),
    { teacherId }
  ];

  if (filters.subject && filters.subject !== 'all' && filters.subject !== 'undefined') {
    where.subject = { equals: filters.subject, mode: 'insensitive' };
  }
  if (filters.category && filters.category !== 'all') where.category = filters.category;
  if (filters.status && filters.status !== 'all') where.status = filters.status;
  if (filters.term && filters.term !== 'all') where.term = filters.term;
  if (filters.sessionId && filters.sessionId !== 'all') where.sessionId = filters.sessionId;

  const grades = await prisma.grade.findMany({
    where,
    include: {
      student: {
        select: { id: true, name: true, gradeLevel: true, studentCode: true, profileImage: true }
      },
      class: {
        select: { id: true, name: true, section: true }
      },
      session: {
        select: { id: true, name: true }
      },
      teacher: {
        select: { id: true, name: true, teacherCode: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Resolve creator names if teacherId exists but teacher relation is not populated
  const unresolvedTeacherIds = Array.from(
    new Set(
      grades
        .filter(g => g.teacherId && !g.teacher)
        .map(g => g.teacherId as string)
    )
  );

  let adminNameMap = new Map<string, string>();
  let teacherNameMap = new Map<string, string>();

  if (unresolvedTeacherIds.length > 0) {
    const [admins, teachers] = await Promise.all([
      prisma.admin.findMany({
        where: { id: { in: unresolvedTeacherIds } },
        select: { id: true, name: true }
      }),
      prisma.teacher.findMany({
        where: { id: { in: unresolvedTeacherIds } },
        select: { id: true, name: true }
      })
    ]);
    admins.forEach(a => adminNameMap.set(a.id, a.name));
    teachers.forEach(t => teacherNameMap.set(t.id, t.name));
  }

  const enhancedGrades = grades.map(g => {
    let resolvedName: string | undefined = g.teacher?.name;
    if (!resolvedName && g.teacherId) {
      resolvedName = teacherNameMap.get(g.teacherId) || adminNameMap.get(g.teacherId);
    }
    return {
      ...g,
      creatorName: resolvedName || (g.teacherId ? 'Faculty Member' : 'System Generated')
    };
  });

  return {
    classInfo: targetClass,
    grades: enhancedGrades,
    total: enhancedGrades.length
  };
};
