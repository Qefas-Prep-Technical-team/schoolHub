import prisma from "../../config/database";
import {
  AssessmentCreationMode,
  AssessmentScope,
  AssessmentStatus,
  QuestionType,
} from "@prisma/client";
import { AcademicOwnershipScope, UserRole } from "@prisma/client";
import { hasActiveSchoolAccess } from "utils/school-access";
import { updateCurrentSchoolContext } from "utils/update-current-school";
export const createDepartmentService = async ({
  currentUserId,
  currentUserType,
  name,
  code,
  description,
  schoolId,
  scope,
}: {
  currentUserId: string;
  currentUserType: UserRole;
  name: string;
  code: string;
  description?: string;
  schoolId?: string;
  scope: "PERSONAL" | "SCHOOL";
}) => {
  if (currentUserType === UserRole.ADMIN) {
    if (scope !== "SCHOOL") {
      throw new Error("Admins can only create school departments");
    }

    if (!schoolId) {
      throw new Error("schoolId is required for school department");
    }

    const schoolAdmin = await prisma.schoolAdmin.findFirst({
      where: {
        adminId: currentUserId,
        schoolId,
        active: true,
      },
    });

    if (!schoolAdmin) {
      throw new Error(
        "You are not allowed to create department for this school",
      );
    }

    return prisma.department.create({
      data: {
        name,
        code,
        description: description || null,
        schoolId,
        teacherId: null,
        scope: "SCHOOL",
      },
    });
  }

  if (currentUserType === UserRole.TEACHER) {
    const teacher = await prisma.teacher.findUnique({
      where: { id: currentUserId },
    });

    if (!teacher) {
      throw new Error("Teacher not found");
    }

    if (scope === "PERSONAL") {
      return prisma.department.create({
        data: {
          name,
          code,
          description: description || null,
          schoolId: null,
          teacherId: teacher.id,
          scope: "PERSONAL",
        },
      });
    }

    if (scope === "SCHOOL") {
      if (!schoolId) {
        throw new Error("schoolId is required for school department");
      }

      const allowed = await hasActiveSchoolAccess({
        userId: currentUserId,
        userType: currentUserType,
        schoolId,
      });

      if (!allowed) {
        throw new Error("You are not linked to this school");
      }
      await updateCurrentSchoolContext({
        userId: currentUserId,
        userType: currentUserType,
        schoolId,
      });
    }

    return prisma.department.create({
      data: {
        name,
        code,
        description: description || null,
        schoolId: teacher.schoolId,
        teacherId: null,
        scope: "SCHOOL",
      },
    });
  }

  throw new Error("Only admins and teachers can create departments");
};

export const createSubjectService = async ({
  currentUserId,
  currentUserType,
  name,
  code,
  description,
  schoolId,
  scope,
}: {
  currentUserId: string;
  currentUserType: UserRole;
  name: string;
  code: string;
  description?: string;
  schoolId?: string;
  scope: "PERSONAL" | "SCHOOL";
}) => {
  // Use a transaction to prevent race conditions
  return await prisma.$transaction(async (tx) => {
    // 1. UNIVERSAL UNIQUENESS CHECK (Inside Transaction)
    const uniquenessQuery: any = { code };
    if (scope === "SCHOOL") {
      if (!schoolId)
        throw new Error("schoolId is required for school subjects");
      uniquenessQuery.schoolId = schoolId;
      uniquenessQuery.scope = "SCHOOL";
    } else {
      uniquenessQuery.teacherId = currentUserId;
      uniquenessQuery.scope = "PERSONAL";
    }

    const existingSubject = await tx.subject.findFirst({
      where: uniquenessQuery,
    });

    if (existingSubject) {
      throw new Error(
        `Subject code '${code}' is already in use in this ${scope.toLowerCase()} context.`,
      );
    }

    // 2. ADMIN LOGIC
    if (currentUserType === UserRole.ADMIN) {
      if (scope !== "SCHOOL" || !schoolId) {
        throw new Error(
          "Admins can only create school subjects and require a schoolId",
        );
      }

      const schoolAdmin = await tx.schoolAdmin.findFirst({
        where: { adminId: currentUserId, schoolId, active: true },
      });

      if (!schoolAdmin) throw new Error("Unauthorized for this school");

      return tx.subject.create({
        data: {
          name,
          code,
          description: description || null,
          schoolId,
          scope: "SCHOOL",
        },
      });
    }

    // 3. TEACHER LOGIC
    if (currentUserType === UserRole.TEACHER) {
      if (scope === "PERSONAL") {
        return tx.subject.create({
          data: {
            name,
            code,
            description: description || null,
            teacherId: currentUserId,
            scope: "PERSONAL",
          },
        });
      }

      if (!schoolId)
        throw new Error("schoolId is required for school subjects");

      // Note: If hasActiveSchoolAccess doesn't support the transaction client (tx),
      // it will use the standard prisma client, which is usually fine for a read-only check.
      const allowed = await hasActiveSchoolAccess({
        userId: currentUserId,
        userType: currentUserType,
        schoolId,
      });

      if (allowed === false) {
        throw new Error("You are not linked to this school");
      }

      return tx.subject.create({
        data: {
          name,
          code,
          description: description || null,
          schoolId,
          scope: "SCHOOL",
        },
      });
    }

    throw new Error("Only admins and teachers can create subjects");
  });
};
export const attachSubjectToDepartmentService = async ({
  departmentId,
  subjectIds,
  currentUserId,
}: {
  departmentId: string;
  subjectIds: string[];
  currentUserId: string;
}) => {
  const department = await prisma.department.findUnique({
    where: { id: departmentId },
  });

  if (!department) {
    throw new Error("Department not found");
  }

  const subjects = await prisma.subject.findMany({
    where: {
      id: { in: subjectIds },
    },
  });

  if (subjects.length !== subjectIds.length) {
    throw new Error("Some subjects were not found");
  }

  if (department.scope === "PERSONAL") {
    const invalidSubjects = subjects.filter(
      (subject) =>
        subject.scope !== "PERSONAL" || subject.teacherId !== currentUserId,
    );

    if (invalidSubjects.length) {
      throw new Error(
        "Personal departments can only use your personal subjects",
      );
    }
  }

  if (department.scope === "SCHOOL") {
    const invalidSubjects = subjects.filter(
      (subject) =>
        subject.scope !== "SCHOOL" || subject.schoolId !== department.schoolId,
    );

    if (invalidSubjects.length) {
      throw new Error(
        "School departments can only use subjects from the same school",
      );
    }
  }

  await prisma.departmentSubject.createMany({
    data: subjectIds.map((subjectId) => ({
      departmentId,
      subjectId,
    })),
    skipDuplicates: true,
  });

  return prisma.department.findUnique({
    where: { id: departmentId },
    include: {
      subjects: {
        include: {
          subject: true,
        },
      },
    },
  });
};

export const buildQuizIncludedSubjects = async ({
  scope,
  departmentId,
  classId,
  selectedSubjectIds = [],
}: {
  scope: AssessmentScope;
  departmentId?: string;
  classId?: string;
  selectedSubjectIds?: string[];
}) => {
  if (scope === AssessmentScope.DEPARTMENT) {
    if (!departmentId) throw new Error("departmentId is required");

    const deptSubjects = await prisma.departmentSubject.findMany({
      where: { departmentId },
      select: { subjectId: true },
    });

    const deptSubjectIds = deptSubjects.map((s) => s.subjectId);

    if (!deptSubjectIds.length) {
      throw new Error("This department has no subjects");
    }

    if (!selectedSubjectIds.length) return deptSubjectIds;

    const invalid = selectedSubjectIds.filter(
      (id) => !deptSubjectIds.includes(id),
    );
    if (invalid.length) {
      throw new Error(
        "Some selected subjects do not belong to this department",
      );
    }

    return selectedSubjectIds;
  }

  if (scope === AssessmentScope.CLASS) {
    if (!classId) throw new Error("classId is required");

    const classSubjects = await prisma.classSubject.findMany({
      where: { classId },
      select: { subjectId: true },
    });

    const classSubjectIds = classSubjects.map((s) => s.subjectId);

    if (!classSubjectIds.length) {
      throw new Error("This class has no subjects");
    }

    if (!selectedSubjectIds.length) return classSubjectIds;

    const invalid = selectedSubjectIds.filter(
      (id) => !classSubjectIds.includes(id),
    );
    if (invalid.length) {
      throw new Error("Some selected subjects do not belong to this class");
    }

    return selectedSubjectIds;
  }

  return selectedSubjectIds;
};

export const createQuizService = async ({
  title,
  description,
  scope,
  creationMode,
  schoolId,
  departmentId,
  classId,
  subjectId,
  selectedSubjectIds = [],
  durationMinutes,
  status,
  aiPrompt,
  instructions,
  questions = [],
}: {
  title: string;
  description?: string;
  scope: AssessmentScope;
  creationMode: AssessmentCreationMode;
  schoolId?: string;
  departmentId?: string;
  classId?: string;
  subjectId?: string;
  selectedSubjectIds?: string[];
  durationMinutes?: number;
  status?: AssessmentStatus;
  aiPrompt?: string;
  instructions?: string;
  questions?: Array<{
    type: QuestionType;
    question: string;
    optionA?: string;
    optionB?: string;
    optionC?: string;
    optionD?: string;
    correctAnswer: string;
    marks?: number;
  }>;
}) => {
  const includedSubjectIds = await buildQuizIncludedSubjects({
    scope,
    departmentId,
    classId,
    selectedSubjectIds,
  });

  return prisma.quiz.create({
    data: {
      title,
      description: description || null,
      scope,
      creationMode,
      schoolId: schoolId || null,
      departmentId: departmentId || null,
      classId: classId || null,
      subjectId: subjectId || null,
      durationMinutes: durationMinutes || null,
      status: status || AssessmentStatus.DRAFT,
      aiPrompt: aiPrompt || null,
      instructions: instructions || null,
      includedSubjects: {
        create: includedSubjectIds.map((id) => ({
          subjectId: id,
        })),
      },
      questions: {
        create: questions.map((q) => ({
          type: q.type,
          question: q.question,
          optionA: q.optionA || null,
          optionB: q.optionB || null,
          optionC: q.optionC || null,
          optionD: q.optionD || null,
          correctAnswer: q.correctAnswer,
          marks: q.marks || 1,
        })),
      },
    },
    include: {
      school: true,
      department: true,
      class: true,
      subject: true,
      includedSubjects: { include: { subject: true } },
      questions: true,
    },
  });
};

export const createExamService = async ({
  title,
  description,
  scope,
  creationMode,
  schoolId,
  departmentId,
  classId,
  subjectId,
  selectedSubjectIds = [],
  durationMinutes,
  status,
  aiPrompt,
  instructions,
}: {
  title: string;
  description?: string;
  scope: AssessmentScope;
  creationMode: AssessmentCreationMode;
  schoolId?: string;
  departmentId?: string;
  classId?: string;
  subjectId?: string;
  selectedSubjectIds?: string[];
  durationMinutes?: number;
  status?: AssessmentStatus;
  aiPrompt?: string;
  instructions?: string;
}) => {
  const includedSubjectIds = await buildQuizIncludedSubjects({
    scope,
    departmentId,
    classId,
    selectedSubjectIds,
  });

  return prisma.exam.create({
    data: {
      title,
      description: description || null,
      scope,
      creationMode,
      schoolId: schoolId || null,
      departmentId: departmentId || null,
      classId: classId || null,
      subjectId: subjectId || null,
      durationMinutes: durationMinutes || null,
      status: status || AssessmentStatus.DRAFT,
      aiPrompt: aiPrompt || null,
      instructions: instructions || null,
      includedSubjects: {
        create: includedSubjectIds.map((id) => ({
          subjectId: id,
        })),
      },
    },
    include: {
      school: true,
      department: true,
      class: true,
      subject: true,
      includedSubjects: { include: { subject: true } },
    },
  });
};

export const getDepartmentsService = async ({
  currentUserId,
  currentUserType,
  schoolId,
}: {
  currentUserId: string;
  currentUserType: UserRole;
  schoolId?: string;
}) => {
  if (currentUserType === UserRole.ADMIN) {
    return prisma.department.findMany({
      where: schoolId ? { schoolId, scope: "SCHOOL" } : { scope: "SCHOOL" },
      include: {
        subjects: { include: { subject: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  if (currentUserType === UserRole.TEACHER) {
    return prisma.department.findMany({
      where: {
        OR: [
          { scope: "PERSONAL", teacherId: currentUserId },
          ...(schoolId
            ? [{ scope: AcademicOwnershipScope.SCHOOL, schoolId }]
            : []),
        ],
      },
      include: {
        subjects: { include: { subject: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return prisma.department.findMany({
    where: schoolId ? { scope: "SCHOOL", schoolId } : { scope: "SCHOOL" },
    include: {
      subjects: { include: { subject: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getSubjectsService = async ({
  currentUserId,
  currentUserType,
  schoolId,
}: {
  currentUserId: string;
  currentUserType: UserRole;
  schoolId?: string;
}) => {
  if (currentUserType === UserRole.ADMIN) {
    return prisma.subject.findMany({
      where: schoolId ? { schoolId, scope: "SCHOOL" } : { scope: "SCHOOL" },
      include: {
        departments: { include: { department: true } },
        classes: { include: { class: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  if (currentUserType === UserRole.TEACHER) {
    return prisma.subject.findMany({
      where: {
        OR: [
          { scope: AcademicOwnershipScope.PERSONAL, teacherId: currentUserId },
          ...(schoolId
            ? [{ scope: AcademicOwnershipScope.SCHOOL, schoolId }]
            : []),
        ],
      },
      include: {
        departments: { include: { department: true } },
        classes: { include: { class: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return prisma.subject.findMany({
    where: schoolId ? { scope: "SCHOOL", schoolId } : { scope: "SCHOOL" },
    orderBy: { createdAt: "desc" },
  });
};

export const getQuizzesService = async ({
  schoolId,
  departmentId,
  classId,
}: {
  schoolId?: string;
  departmentId?: string;
  classId?: string;
}) => {
  return prisma.quiz.findMany({
    where: {
      ...(schoolId ? { schoolId } : { id: 'none' }),
      ...(departmentId ? { departmentId } : {}),
      ...(classId ? { classId } : {}),
    },
    include: {
      school: true,
      department: true,
      class: true,
      subject: true,
      includedSubjects: { include: { subject: true } },
      questions: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getExamsService = async ({
  schoolId,
  departmentId,
  classId,
}: {
  schoolId?: string;
  departmentId?: string;
  classId?: string;
}) => {
  return prisma.exam.findMany({
    where: {
      ...(schoolId ? { schoolId } : { id: 'none' }),
      ...(departmentId ? { departmentId } : {}),
      ...(classId ? { classId } : {}),
    },
    include: {
      school: true,
      department: true,
      class: true,
      subject: true,
      includedSubjects: { include: { subject: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};
