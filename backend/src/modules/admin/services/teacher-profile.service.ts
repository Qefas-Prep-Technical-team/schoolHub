import prisma, { withRetry } from "../../../config/database";
import { Prisma } from "@prisma/client";
import { resolveSchoolId } from "../../school/services/school-access.service";
import { getActiveSchoolTeacherFilter } from "../../school/services/school-member-filters.service";

export interface TeacherProfileResult {
  status: number;
  body: {
    success: boolean;
    message?: string;
    data?: Record<string, unknown>;
  };
}

export interface AdminTeacherAccessParams {
  adminId?: string;
  userType?: string;
  role?: string;
  explicitSchoolIds?: string[];
  targetSchoolId?: string;
}

export const resolveAuthorizedAdminSchoolIds = async (
  adminId?: string,
  explicitSchoolIds: string[] = [],
): Promise<string[]> => {
  const candidateIds = new Set<string>();

  for (const rawId of explicitSchoolIds) {
    if (!rawId) continue;
    const resolved = await resolveSchoolId(rawId);
    if (resolved) candidateIds.add(resolved);
  }

  if (adminId) {
    const memberships = await withRetry(
      () =>
        prisma.schoolAdmin.findMany({
          where: { adminId, active: true },
          select: { schoolId: true },
        }),
      "admin.teacherProfile.resolveAuthorizedAdminSchoolIds",
    );
    for (const m of memberships) {
      if (m.schoolId) candidateIds.add(m.schoolId);
    }
  }

  return Array.from(candidateIds);
};

export const verifyAdminHasAccessToTeacher = async (
  adminId: string | undefined,
  userType: string | undefined,
  teacherIdOrCode: string,
  explicitSchoolIds: string[] = [],
  role?: string,
): Promise<{
  allowed: boolean;
  exists: boolean;
  teacherId?: string;
  authorizedSchoolIds: string[];
}> => {
  const teacher = await withRetry(
    () =>
      prisma.teacher.findFirst({
        where: {
          OR: [{ id: teacherIdOrCode }, { teacherCode: teacherIdOrCode }],
        },
        select: { id: true },
      }),
    "admin.teacherProfile.findTeacherId",
  );

  if (!teacher) {
    return { allowed: false, exists: false, authorizedSchoolIds: [] };
  }

  const isSuperAdmin = userType === "SUPER_ADMIN" || role === "SUPER_ADMIN";
  const authorizedSchoolIds = await resolveAuthorizedAdminSchoolIds(
    adminId,
    explicitSchoolIds,
  );

  if (isSuperAdmin) {
    return {
      allowed: true,
      exists: true,
      teacherId: teacher.id,
      authorizedSchoolIds,
    };
  }

  if (authorizedSchoolIds.length === 0) {
    return {
      allowed: false,
      exists: true,
      teacherId: teacher.id,
      authorizedSchoolIds: [],
    };
  }

  const schoolFilters: Prisma.TeacherWhereInput[] = await Promise.all(
    authorizedSchoolIds.map((sid) => getActiveSchoolTeacherFilter(sid)),
  );

  const matched = await withRetry(
    () =>
      prisma.teacher.findFirst({
        where: {
          AND: [{ id: teacher.id }, { OR: schoolFilters }],
        },
        select: { id: true },
      }),
    "admin.teacherProfile.verifyTeacherMembership",
  );

  return {
    allowed: Boolean(matched),
    exists: true,
    teacherId: teacher.id,
    authorizedSchoolIds,
  };
};

export const getTeacherByIdAdminService = async (
  id: string,
  access: AdminTeacherAccessParams = {},
): Promise<TeacherProfileResult> => {
  const isSuperAdmin =
    access.userType === "SUPER_ADMIN" || access.role === "SUPER_ADMIN";

  const authCheck = await verifyAdminHasAccessToTeacher(
    access.adminId,
    access.userType,
    id,
    access.explicitSchoolIds || [],
    access.role,
  );

  if (!authCheck.exists || !authCheck.teacherId) {
    return {
      status: 404,
      body: {
        success: false,
        message: "Teacher not found",
      },
    };
  }

  if (!authCheck.allowed) {
    return {
      status: 403,
      body: {
        success: false,
        message: "Access denied: This teacher is not linked to your school.",
      },
    };
  }

  const authorizedSchoolIds = authCheck.authorizedSchoolIds;

  const teacher = await withRetry(
    () =>
      prisma.teacher.findUnique({
        where: { id: authCheck.teacherId },
        include: {
          school: true,
          currentSchool: true,
          teacherSubjects: {
            where:
              !isSuperAdmin && authorizedSchoolIds.length > 0
                ? {
                    OR: [
                      { schoolId: { in: authorizedSchoolIds } },
                      { subject: { schoolId: { in: authorizedSchoolIds } } },
                    ],
                  }
                : undefined,
            include: {
              subject: {
                include: {
                  departments: {
                    include: {
                      department: true,
                    },
                  },
                },
              },
            },
          },
          classTeachers: {
            where:
              !isSuperAdmin && authorizedSchoolIds.length > 0
                ? { class: { schoolId: { in: authorizedSchoolIds } } }
                : undefined,
            include: {
              class: true,
            },
          },
        },
      }),
    "admin.teacherProfile.getTeacherById",
  );

  if (!teacher) {
    return {
      status: 404,
      body: {
        success: false,
        message: "Teacher not found",
      },
    };
  }

  let resolvedSchoolId =
    teacher.activeSchoolId && authorizedSchoolIds.includes(teacher.activeSchoolId)
      ? teacher.activeSchoolId
      : teacher.primarySchoolId && authorizedSchoolIds.includes(teacher.primarySchoolId)
        ? teacher.primarySchoolId
        : authorizedSchoolIds[0] ||
          teacher.activeSchoolId ||
          teacher.primarySchoolId ||
          teacher.schoolId;
  if (!resolvedSchoolId && teacher.teacherSubjects.length > 0) {
    resolvedSchoolId = teacher.teacherSubjects[0].subject.schoolId;
  }

  const formattedData = {
    ...teacher,
    activeSchoolId: teacher.activeSchoolId,
    primarySchoolId: teacher.primarySchoolId,
    schoolId: resolvedSchoolId || teacher.schoolId,
    resolvedSchoolId,
    name: teacher.name,
    email: teacher.email,
    teacherCode: teacher.teacherCode,
    avatar: teacher.profileImage,
    status: teacher.verified ? "active" : "inactive",
    verified: teacher.verified,
    isClaimed: teacher.isClaimed,
    personalInfo: {
      fullName: teacher.name,
      gender: teacher.gender,
      email: teacher.email,
      phone: teacher.phone || "Not provided",
      address: teacher.address || "Not provided",
      highestQualification: teacher.highestQualification || "Not provided",
      yearsOfExperience: teacher.yearsOfExperience
        ? `${teacher.yearsOfExperience}`
        : "Not provided",
    },
    professionalInfo: {
      department: teacher.department || "General",
      subjects: teacher.teacherSubjects.map((ts) => ({
        id: ts.subject.id,
        name: ts.subject.name,
        departments:
          ts.subject.departments
            ?.map((ds) => ds.department?.name)
            .filter(Boolean) || [],
      })),
      assignedClasses: teacher.classTeachers.map((ct) => ({
        id: ct.class.id,
        name: ct.class.name,
      })),
    },
    statistics: {
      classPerformance: "85%", // Placeholder
      attendanceRate: "95%", // Placeholder
      upcomingClasses: teacher.classTeachers.length.toString(),
      studentsTaught: "0", // Placeholder
    },
  };

  return {
    status: 200,
    body: {
      success: true,
      data: formattedData,
    },
  };
};
