import prisma from "../../config/database";
import {
  AcademicOwnershipScope,
  LinkEntityType,
  UserRole,
} from "@prisma/client";
import { hasActiveSchoolLink } from "./academic.permissions";

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
  scope: AcademicOwnershipScope;
}) => {
  if (currentUserType === UserRole.ADMIN) {
    if (scope !== AcademicOwnershipScope.SCHOOL) {
      throw new Error("Admins can only create school subjects");
    }

    if (!schoolId) {
      throw new Error("schoolId is required for school subject");
    }

    const allowed = await hasActiveSchoolLink({
      userId: currentUserId,
      userType: LinkEntityType.ADMIN,
      schoolId,
    });

    if (!allowed) {
      throw new Error("You are not linked to this school");
    }

    const duplicate = await prisma.subject.findFirst({
      where: {
        schoolId,
        code,
        scope: AcademicOwnershipScope.SCHOOL,
        isArchived: false,
      },
    });

    if (duplicate) {
      throw new Error("A school subject with this code already exists");
    }

    return prisma.subject.create({
      data: {
        name,
        code,
        description: description || null,
        schoolId,
        teacherId: null,
        scope: AcademicOwnershipScope.SCHOOL,
      },
    });
  }

  if (currentUserType === UserRole.TEACHER) {
    if (scope === AcademicOwnershipScope.PERSONAL) {
      const duplicate = await prisma.subject.findFirst({
        where: {
          teacherId: currentUserId,
          code,
          scope: AcademicOwnershipScope.PERSONAL,
          isArchived: false,
        },
      });

      if (duplicate) {
        throw new Error("You already have a personal subject with this code");
      }

      return prisma.subject.create({
        data: {
          name,
          code,
          description: description || null,
          schoolId: null,
          teacherId: currentUserId,
          scope: AcademicOwnershipScope.PERSONAL,
        },
      });
    }

    if (!schoolId) {
      throw new Error("schoolId is required for school subject");
    }

    const allowed = await hasActiveSchoolLink({
      userId: currentUserId,
      userType: LinkEntityType.TEACHER,
      schoolId,
    });

    if (!allowed) {
      throw new Error("You are not linked to this school");
    }

    const duplicate = await prisma.subject.findFirst({
      where: {
        schoolId,
        code,
        scope: AcademicOwnershipScope.SCHOOL,
        isArchived: false,
      },
    });

    if (duplicate) {
      throw new Error("A school subject with this code already exists");
    }

    return prisma.subject.create({
      data: {
        name,
        code,
        description: description || null,
        schoolId,
        teacherId: null,
        scope: AcademicOwnershipScope.SCHOOL,
      },
    });
  }

  throw new Error("Only admins and teachers can create subjects");
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
    if (!schoolId) return [];
    return prisma.subject.findMany({
      where: {
        isArchived: false,
        schoolId, 
        scope: AcademicOwnershipScope.SCHOOL
      },
      include: {
        departments: { include: { department: true } },
        classes: { include: { class: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  if (currentUserType === UserRole.TEACHER) {
    const where: any = {
      isArchived: false,
      OR: [
        {
          scope: AcademicOwnershipScope.PERSONAL,
          teacherId: currentUserId,
        },
      ],
    };

    if (schoolId) {
      where.OR.push({
        scope: AcademicOwnershipScope.SCHOOL,
        schoolId,
      });
    }

    return prisma.subject.findMany({
      where,
      include: {
        departments: { include: { department: true } },
        classes: { include: { class: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }
  if (currentUserType === UserRole.STUDENT) {
    return prisma.subject.findMany({
      where: {
        isArchived: false,
        classes: {
          some: {
            class: {
              enrollments: {
                some: {
                  studentId: currentUserId,
                },
              },
            },
          },
        },
      },
      include: {
        departments: { include: { department: true } },
        classes: { include: { class: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return prisma.subject.findMany({
    where: {
      isArchived: false,
      ...(schoolId
        ? { schoolId, scope: AcademicOwnershipScope.SCHOOL }
        : { id: 'none' }), // Fail closed if no schoolId
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getSingleSubjectService = async (subjectId: string) => {
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      departments: { include: { department: true } },
      classes: { include: { class: true } },
      quizzes: true,
      exams: true,
    },
  });

  if (!subject || subject.isArchived) {
    throw new Error("Subject not found");
  }

  return subject;
};

export const updateSubjectService = async ({
  subjectId,
  name,
  code,
  description,
}: {
  subjectId: string;
  name?: string;
  code?: string;
  description?: string;
}) => {
  const existing = await prisma.subject.findUnique({
    where: { id: subjectId },
  });

  if (!existing || existing.isArchived) {
    throw new Error("Subject not found");
  }

  if (code && code !== existing.code) {
    const duplicate = await prisma.subject.findFirst({
      where: {
        id: { not: subjectId },
        isArchived: false,
        scope: existing.scope,
        ...(existing.scope === AcademicOwnershipScope.SCHOOL
          ? { schoolId: existing.schoolId, code }
          : { teacherId: existing.teacherId, code }),
      },
    });

    if (duplicate) {
      throw new Error("Subject code already exists in this scope");
    }
  }

  return prisma.subject.update({
    where: { id: subjectId },
    data: {
      name: name ?? undefined,
      code: code ?? undefined,
      description: description ?? undefined,
    },
  });
};

export const archiveSubjectService = async (subjectId: string) => {
  return prisma.subject.update({
    where: { id: subjectId },
    data: { isArchived: true },
  });
};
