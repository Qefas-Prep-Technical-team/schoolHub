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

    // Handle archived department with the same [schoolId, code] constraint
    let finalCode = code;
    const archivedCollision = await prisma.department.findFirst({
      where: { schoolId, code: finalCode },
    });
    if (archivedCollision) {
      finalCode = `${code}-${Date.now().toString(36).slice(-3).toUpperCase()}`;
    }

    return prisma.department.create({
      data: {
        name,
        code: finalCode,
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

    // Handle archived department with the same [schoolId, code] constraint
    let finalCode = code;
    const archivedCollision = await prisma.department.findFirst({
      where: { schoolId, code: finalCode },
    });
    if (archivedCollision) {
      finalCode = `${code}-${Date.now().toString(36).slice(-3).toUpperCase()}`;
    }

    return prisma.department.create({
      data: {
        name,
        code: finalCode,
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
  classId,
}: {
  currentUserId: string;
  currentUserType: UserRole;
  schoolId?: string;
  classId?: string;
}) => {
  if (currentUserType === UserRole.ADMIN) {
    if (!schoolId) return [];

    const where: any = {
      isArchived: false,
      schoolId,
      scope: AcademicOwnershipScope.SCHOOL,
    };

    if (classId) {
      // Check if this class has specific departments attached
      const classDeptsCount = await prisma.classDepartment.count({
        where: { classId },
      });
      if (classDeptsCount > 0) {
        where.classes = {
          some: { classId },
        };
      }
    }

    return prisma.department.findMany({
      where,
      include: {
        subjects: { include: { subject: true } },
        _count: {
          select: {
            students: true,
            classes: true,
            exams: true,
            quizzes: true,
          }
        }
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
        _count: {
          select: {
            students: true,
            classes: true,
            exams: true,
            quizzes: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });
  }

  if (currentUserType === UserRole.STUDENT) {
    if (!schoolId) {
      // If no schoolId provided, return departments based on classes (fallback)
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
          _count: {
            select: {
              students: true,
              classes: true,
              exams: true,
              quizzes: true,
            }
          }
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // If schoolId provided, return all school departments (consistent with user request)
    return prisma.department.findMany({
      where: {
        isArchived: false,
        schoolId,
        scope: AcademicOwnershipScope.SCHOOL,
      },
      include: {
        subjects: { include: { subject: true } },
        _count: {
          select: {
            students: true,
            classes: true,
            exams: true,
            quizzes: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return prisma.department.findMany({
    where: {
      isArchived: false,
      ...(schoolId
        ? { schoolId, scope: AcademicOwnershipScope.SCHOOL }
        : { id: 'none' }), // Fail closed
    },
    include: {
      subjects: { include: { subject: true } },
      _count: {
        select: {
          students: true,
          classes: true,
          exams: true,
          quizzes: true,
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });
};

const resolveDepartmentForUser = async ({
  departmentId,
  userId,
  userType,
  schoolId,
}: {
  departmentId: string;
  userId?: string;
  userType?: UserRole;
  schoolId?: string;
}) => {
  // 1. Direct UUID match first
  const byId = await prisma.department.findFirst({
    where: {
      id: departmentId,
      isArchived: false,
    },
  });
  if (byId) return byId;

  // 2. If schoolId is explicitly provided, look up by (schoolId, code)
  if (schoolId) {
    const bySchoolCode = await prisma.department.findFirst({
      where: {
        schoolId,
        code: departmentId,
        isArchived: false,
      },
    });
    if (bySchoolCode) return bySchoolCode;
  }

  // 3. Otherwise, find all matching code candidates and pick the one linked to the current user
  const candidates = await prisma.department.findMany({
    where: {
      code: departmentId,
      isArchived: false,
    },
  });

  if (userId && userType && candidates.length > 0) {
    for (const dept of candidates) {
      if (dept.scope === AcademicOwnershipScope.PERSONAL && dept.teacherId === userId) {
        return dept;
      }
      if (dept.scope === AcademicOwnershipScope.SCHOOL && dept.schoolId) {
        const entityType =
          userType === UserRole.ADMIN
            ? LinkEntityType.ADMIN
            : userType === UserRole.TEACHER
              ? LinkEntityType.TEACHER
              : LinkEntityType.STUDENT;
        const allowed = await hasActiveSchoolLink({
          userId,
          userType: entityType,
          schoolId: dept.schoolId,
        });
        if (allowed) return dept;
      }
    }
  }

  return candidates[0] || null;
};

export const getSingleDepartmentService = async (
  departmentId: string,
  context?: { userId?: string; userType?: UserRole; schoolId?: string }
) => {
  const resolved = await resolveDepartmentForUser({
    departmentId,
    userId: context?.userId,
    userType: context?.userType,
    schoolId: context?.schoolId,
  });

  if (!resolved) {
    throw new Error("Department not found");
  }

  const department = await prisma.department.findUnique({
    where: { id: resolved.id },
    include: {
      subjects: { include: { subject: true } },
      quizzes: true,
      exams: true,
      _count: {
        select: {
          students: true,
          classes: true,
          exams: true,
          quizzes: true,
        }
      }
    },
  });

  if (!department) {
    throw new Error("Department not found");
  }

  return department;
};

export const updateDepartmentService = async ({
  departmentId,
  name,
  code,
  description,
  currentUserId,
  currentUserType,
  schoolId,
}: {
  departmentId: string;
  name?: string;
  code?: string;
  description?: string;
  currentUserId?: string;
  currentUserType?: UserRole;
  schoolId?: string;
}) => {
  const existing = await resolveDepartmentForUser({
    departmentId,
    userId: currentUserId,
    userType: currentUserType,
    schoolId,
  });

  if (!existing) {
    throw new Error("Department not found");
  }

  if (code && code !== existing.code) {
    const duplicate = await prisma.department.findFirst({
      where: {
        id: { not: existing.id },
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
    where: { id: existing.id },
    data: {
      name: name ?? undefined,
      code: code ?? undefined,
      description: description ?? undefined,
    },
  });
};

export const archiveDepartmentService = async (
  departmentId: string,
  context?: { userId?: string; userType?: UserRole; schoolId?: string }
) => {
  const existing = await resolveDepartmentForUser({
    departmentId,
    userId: context?.userId,
    userType: context?.userType,
    schoolId: context?.schoolId,
  });

  if (!existing) {
    throw new Error("Department not found");
  }

  return prisma.department.update({
    where: { id: existing.id },
    data: { isArchived: true },
  });
};

export const attachSubjectsToDepartmentService = async ({
  departmentId,
  subjectIds,
  currentUserId,
  currentUserType,
  schoolId,
}: {
  departmentId: string;
  subjectIds: string[];
  currentUserId: string;
  currentUserType?: UserRole;
  schoolId?: string;
}) => {
  const department = await resolveDepartmentForUser({
    departmentId,
    userId: currentUserId,
    userType: currentUserType,
    schoolId,
  });

  if (!department) {
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
      departmentId: department.id,
      subjectId,
    })),
    skipDuplicates: true,
  });

  return prisma.department.findUnique({
    where: { id: department.id },
    include: {
      subjects: { include: { subject: true } },
    },
  });
};

export const removeSubjectFromDepartmentService = async ({
  departmentId,
  subjectId,
  currentUserId,
  currentUserType,
  schoolId,
}: {
  departmentId: string;
  subjectId: string;
  currentUserId?: string;
  currentUserType?: UserRole;
  schoolId?: string;
}) => {
  const department = await resolveDepartmentForUser({
    departmentId,
    userId: currentUserId,
    userType: currentUserType,
    schoolId,
  });

  if (!department) {
    throw new Error("Department not found");
  }

  await prisma.departmentSubject.deleteMany({
    where: {
      departmentId: department.id,
      subjectId,
    },
  });

  return true;
};
