import prisma from "../../config/database";
import {
  AcademicOwnershipScope,
  LinkEntityType,
  UserRole,
} from "@prisma/client";
import { hasActiveSchoolLink } from "./academic.permissions";

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
  scope: AcademicOwnershipScope;
}) => {
  if (currentUserType === UserRole.ADMIN) {
    if (scope !== AcademicOwnershipScope.SCHOOL) {
      throw new Error("Admins can only create school departments");
    }

    if (!schoolId) {
      throw new Error("schoolId is required for school department");
    }

    const allowed = await hasActiveSchoolLink({
      userId: currentUserId,
      userType: LinkEntityType.ADMIN,
      schoolId,
    });

    if (!allowed) {
      throw new Error("You are not linked to this school");
    }

    const duplicate = await prisma.department.findFirst({
      where: {
        schoolId,
        code,
        scope: AcademicOwnershipScope.SCHOOL,
        isArchived: false,
      },
    });

    if (duplicate) {
      throw new Error("A school department with this code already exists");
    }

    return prisma.department.create({
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
      const duplicate = await prisma.department.findFirst({
        where: {
          teacherId: currentUserId,
          code,
          scope: AcademicOwnershipScope.PERSONAL,
          isArchived: false,
        },
      });

      if (duplicate) {
        throw new Error("You already have a personal department with this code");
      }

      return prisma.department.create({
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
      throw new Error("schoolId is required for school department");
    }

    const allowed = await hasActiveSchoolLink({
      userId: currentUserId,
      userType: LinkEntityType.TEACHER,
      schoolId,
    });

    if (!allowed) {
      throw new Error("You are not linked to this school");
    }

    const duplicate = await prisma.department.findFirst({
      where: {
        schoolId,
        code,
        scope: AcademicOwnershipScope.SCHOOL,
        isArchived: false,
      },
    });

    if (duplicate) {
      throw new Error("A school department with this code already exists");
    }

    return prisma.department.create({
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

  throw new Error("Only admins and teachers can create departments");
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
      where: {
        isArchived: false,
        ...(schoolId
          ? { schoolId, scope: AcademicOwnershipScope.SCHOOL }
          : { scope: AcademicOwnershipScope.SCHOOL }),
      },
      include: {
        subjects: { include: { subject: true } },
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

    return prisma.department.findMany({
      where,
      include: {
        subjects: { include: { subject: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  if (currentUserType === UserRole.STUDENT) {
    return prisma.department.findMany({
      where: {
        isArchived: false,
        subjects: {
          some: {
            subject: {
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
          },
        },
      },
      include: {
        subjects: { include: { subject: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return prisma.department.findMany({
    where: {
      isArchived: false,
      ...(schoolId
        ? { schoolId, scope: AcademicOwnershipScope.SCHOOL }
        : { scope: AcademicOwnershipScope.SCHOOL }),
    },
    include: {
      subjects: { include: { subject: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getSingleDepartmentService = async (departmentId: string) => {
  const department = await prisma.department.findUnique({
    where: { id: departmentId },
    include: {
      subjects: { include: { subject: true } },
      quizzes: true,
      exams: true,
    },
  });

  if (!department || department.isArchived) {
    throw new Error("Department not found");
  }

  return department;
};

export const updateDepartmentService = async ({
  departmentId,
  name,
  code,
  description,
}: {
  departmentId: string;
  name?: string;
  code?: string;
  description?: string;
}) => {
  const existing = await prisma.department.findUnique({
    where: { id: departmentId },
  });

  if (!existing || existing.isArchived) {
    throw new Error("Department not found");
  }

  if (code && code !== existing.code) {
    const duplicate = await prisma.department.findFirst({
      where: {
        id: { not: departmentId },
        isArchived: false,
        scope: existing.scope,
        ...(existing.scope === AcademicOwnershipScope.SCHOOL
          ? { schoolId: existing.schoolId, code }
          : { teacherId: existing.teacherId, code }),
      },
    });

    if (duplicate) {
      throw new Error("Department code already exists in this scope");
    }
  }

  return prisma.department.update({
    where: { id: departmentId },
    data: {
      name: name ?? undefined,
      code: code ?? undefined,
      description: description ?? undefined,
    },
  });
};

export const archiveDepartmentService = async (departmentId: string) => {
  return prisma.department.update({
    where: { id: departmentId },
    data: { isArchived: true },
  });
};

export const attachSubjectsToDepartmentService = async ({
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

  if (!department || department.isArchived) {
    throw new Error("Department not found");
  }

  const subjects = await prisma.subject.findMany({
    where: {
      id: { in: subjectIds },
      isArchived: false,
    },
  });

  if (subjects.length !== subjectIds.length) {
    throw new Error("Some subjects were not found");
  }

  if (department.scope === AcademicOwnershipScope.PERSONAL) {
    const invalid = subjects.filter(
      (subject) =>
        subject.scope !== AcademicOwnershipScope.PERSONAL ||
        subject.teacherId !== currentUserId
    );

    if (invalid.length) {
      throw new Error("Personal departments can only use your personal subjects");
    }
  }

  if (department.scope === AcademicOwnershipScope.SCHOOL) {
    const invalid = subjects.filter(
      (subject) =>
        subject.scope !== AcademicOwnershipScope.SCHOOL ||
        subject.schoolId !== department.schoolId
    );

    if (invalid.length) {
      throw new Error("School departments can only use subjects from the same school");
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
      subjects: { include: { subject: true } },
    },
  });
};

export const removeSubjectFromDepartmentService = async ({
  departmentId,
  subjectId,
}: {
  departmentId: string;
  subjectId: string;
}) => {
  await prisma.departmentSubject.deleteMany({
    where: {
      departmentId,
      subjectId,
    },
  });

  return true;
};
