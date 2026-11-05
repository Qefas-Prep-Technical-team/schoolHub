import { AdminRole } from "@prisma/client";
import prisma, { withRetry } from "../../../config/database";
import { AppError } from "../../../utils/app-error";

/**
 * Get all active school admins for `schoolId`.
 */
export const getSchoolAdminsService = async (schoolId: string) => {
  if (!schoolId) {
    throw new AppError("Active school association is required", 403);
  }

  const members = await withRetry(() =>
    prisma.schoolAdmin.findMany({
      where: {
        schoolId,
        active: true,
        role: { not: AdminRole.PENDING },
        admin: { status: { not: "PENDING" } },
      },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
  );

  return members.map((m) => ({
    id: m.admin.id,
    name: m.admin.name,
    email: m.admin.email,
    profileImage: m.admin.profileImage,
    status: m.admin.status,
    adminRole: m.role,
    joinedAt: m.createdAt,
  }));
};

/**
 * Update an admin's role within `schoolId` (SCHOOL_OWNER only).
 */
export const updateAdminRoleService = async (params: {
  schoolId: string;
  currentAdminId: string;
  targetAdminId: string;
  role: AdminRole;
}) => {
  const { schoolId, currentAdminId, targetAdminId, role } = params;
  if (!schoolId) {
    throw new AppError("Active school association is required", 403);
  }

  if (targetAdminId === currentAdminId) {
    throw new AppError("You cannot change your own role", 400);
  }

  const schoolAdmin = await withRetry(() =>
    prisma.schoolAdmin.findFirst({
      where: { adminId: targetAdminId, schoolId, active: true },
    }),
  );

  if (!schoolAdmin) {
    throw new AppError("Admin not found in your school", 404);
  }

  if (schoolAdmin.role === AdminRole.SCHOOL_OWNER) {
    throw new AppError(
      "Cannot change the role of the school owner. Use Transfer Ownership instead.",
      400,
    );
  }

  await withRetry(() =>
    prisma.schoolAdmin.update({
      where: { adminId_schoolId: { adminId: targetAdminId, schoolId } },
      data: { role },
    }),
  );

  return { role };
};

/**
 * Transfer school ownership from `currentAdminId` to `targetAdminId` (SCHOOL_OWNER only).
 */
export const transferOwnershipService = async (params: {
  schoolId: string;
  currentAdminId: string;
  targetAdminId: string;
}) => {
  const { schoolId, currentAdminId, targetAdminId } = params;
  if (!schoolId) {
    throw new AppError("Active school association is required", 403);
  }

  if (targetAdminId === currentAdminId) {
    throw new AppError("You are already the school owner", 400);
  }

  const targetSchoolAdmin = await withRetry(() =>
    prisma.schoolAdmin.findFirst({
      where: { adminId: targetAdminId, schoolId, active: true },
      include: { admin: { select: { name: true, email: true } } },
    }),
  );

  if (!targetSchoolAdmin) {
    throw new AppError("Admin not found in your school", 404);
  }

  if (targetSchoolAdmin.role === AdminRole.PENDING) {
    throw new AppError("Cannot transfer ownership to a pending admin", 400);
  }

  await withRetry(() =>
    prisma.$transaction([
      prisma.schoolAdmin.update({
        where: { adminId_schoolId: { adminId: currentAdminId, schoolId } },
        data: { role: AdminRole.PRINCIPAL },
      }),
      prisma.schoolAdmin.update({
        where: { adminId_schoolId: { adminId: targetAdminId, schoolId } },
        data: { role: AdminRole.SCHOOL_OWNER },
      }),
    ]),
  );

  return {
    newOwnerName: targetSchoolAdmin.admin.name,
  };
};

/**
 * Remove an admin from `schoolId` and revoke their refresh tokens (SCHOOL_OWNER only).
 */
export const removeAdminService = async (params: {
  schoolId: string;
  currentAdminId: string;
  targetAdminId: string;
}) => {
  const { schoolId, currentAdminId, targetAdminId } = params;
  if (!schoolId) {
    throw new AppError("Active school association is required", 403);
  }

  if (targetAdminId === currentAdminId) {
    throw new AppError("You cannot remove yourself", 400);
  }

  const schoolAdmin = await withRetry(() =>
    prisma.schoolAdmin.findFirst({
      where: { adminId: targetAdminId, schoolId, active: true },
    }),
  );

  if (!schoolAdmin) {
    throw new AppError("Admin not found in your school", 404);
  }

  if (schoolAdmin.role === AdminRole.SCHOOL_OWNER) {
    throw new AppError("Cannot remove the school owner", 400);
  }

  await withRetry(() =>
    prisma.$transaction([
      prisma.schoolAdmin.update({
        where: { adminId_schoolId: { adminId: targetAdminId, schoolId } },
        data: { active: false },
      }),
      prisma.refreshToken.updateMany({
        where: { userId: targetAdminId, isValid: true },
        data: { isValid: false },
      }),
    ]),
  );
};

