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
import { enforceExamLimit } from "../subscription/quota.helpers";
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
        schoolId: teacher.activeSchoolId || teacher.primarySchoolId || undefined,
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

export const attachSubjectToDepartmentsService = async ({
  subjectId,
  departmentIds,
}: {
  subjectId: string;
  departmentIds: string[];
}) => {
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
  });

  if (!subject) {
    throw new Error("Subject not found");
  }

  const departments = await prisma.department.findMany({
    where: {
      id: { in: departmentIds },
    },
  });

  if (departments.length !== departmentIds.length) {
    throw new Error("Some departments were not found");
  }

  // Validate scope compatibility
  if (subject.scope === "SCHOOL") {
      const invalidDepts = departments.filter(d => d.scope !== "SCHOOL" || d.schoolId !== subject.schoolId);
      if (invalidDepts.length) {
          throw new Error("School subjects can only be attached to departments in the same school.");
      }
  }

  await prisma.departmentSubject.createMany({
    data: departmentIds.map((departmentId) => ({
      subjectId,
      departmentId,
    })),
    skipDuplicates: true,
  });

  return prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      departments: {
        include: {
          department: true,
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

  if (schoolId) await enforceExamLimit(schoolId);

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
  classId,
  subjectId,
  selectedSubjectIds = [],
  durationMinutes,
  status,
  aiPrompt,
  instructions,
  departmentIds = [],
}: {
  title: string;
  description?: string;
  scope: AssessmentScope;
  creationMode: AssessmentCreationMode;
  schoolId?: string;
  departmentIds?: string[];
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
    departmentId: departmentIds[0], // Shortcut for included subjects logic
    classId,
    selectedSubjectIds,
  });

  if (schoolId) await enforceExamLimit(schoolId);

  return prisma.exam.create({
    data: {
      title,
      description: description || null,
      scope,
      creationMode,
      schoolId: schoolId || null,
      classId: classId || null,
      subjectId: subjectId || null,
      durationMinutes: durationMinutes || null,
      status: status || AssessmentStatus.DRAFT,
      aiPrompt: aiPrompt || null,
      instructions: instructions || null,
      departments: departmentIds.length > 0 ? {
        create: departmentIds.map(id => ({ departmentId: id }))
      } : undefined,
      subjectExamPapers: {
        create: includedSubjectIds.map((id) => ({
          subjectPaperId: id,
        })),
      },
    },
    include: {
      school: true,
      departments: { include: { department: true } },
      class: true,
      subject: true,
      subjectExamPapers: { include: { subjectPaper: { include: { subject: true } } } },
    },
  });
};

export const getDepartmentsService = async ({
  currentUserId,
  currentUserType,
  schoolId,
  classId,
}: {
  currentUserId: string;
  currentUserType: UserRole;
  schoolId?: string;
  classId?: string;
}) => {
  const where: any = {};
  
  if (currentUserType === UserRole.ADMIN) {
    if (schoolId) where.schoolId = schoolId;
    where.scope = "SCHOOL";
  } else if (currentUserType === UserRole.TEACHER) {
    where.OR = [
      { scope: "PERSONAL", teacherId: currentUserId },
      ...(schoolId ? [{ scope: "SCHOOL", schoolId }] : []),
    ];
  } else {
    if (schoolId) where.schoolId = schoolId;
    where.scope = "SCHOOL";
  }

  if (classId) {
    where.classes = {
      some: { classId }
    };
  }

  return prisma.department.findMany({
    where,
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
      questions: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getExamsService = async ({
  schoolId,
  departmentIds,
  classId,
  availableForTeacherId,
  availableForStudentId,
}: {
  schoolId?: string;
  departmentIds?: string[];
  classId?: string;
  availableForTeacherId?: string;
  availableForStudentId?: string;
}) => {
  const where: any = {
    ...(schoolId ? { schoolId } : { id: "none" }),
    ...(departmentIds && departmentIds.length > 0
      ? {
          departments: {
            some: { departmentId: { in: departmentIds } },
          },
        }
      : {}),
    ...(classId ? { classId } : {}),
  };

  // If a teacher ID is provided, show exams they own or are associated with via class assignments
  if (availableForTeacherId) {
    where.OR = [
      { teacherId: availableForTeacherId }, // Exams they created/own
      {
        class: {
          OR: [
            { teacherId: availableForTeacherId }, // Form Teacher of the class
            {
              subjects: {
                some: { teacherId: availableForTeacherId }, // Teaching any subject to this class
              },
            },
          ],
        },
      },
    ];
  }

  // If a student ID is provided, filter exams by their class enrolment
  if (availableForStudentId) {
    where.class = {
      students: {
        some: { id: availableForStudentId },
      },
    };
  }

  return prisma.exam.findMany({
    where,
    include: {
      school: true,
      departments: { include: { department: true } },
      class: true,
      subject: true,
      subjectExamPapers: { include: { subjectPaper: { include: { subject: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
};
