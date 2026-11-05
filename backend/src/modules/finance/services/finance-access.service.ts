import { Request } from "express";
import prisma, { withRetry } from "../../../config/database";
import {
  resolveSchoolId,
  validateAdminSubRoleAccess,
} from "../../school/services/school-access.service";

export const FINANCE_ADMIN_ROLES = [
  "SCHOOL_OWNER",
  "ACCOUNTANT",
  "ADMIN",
  "SUPER_ADMIN",
];

/**
 * Resolves a schoolId (UUID or tenantId) and verifies that the authenticated user
 * is an authorized finance administrator (SCHOOL_OWNER, ACCOUNTANT, ADMIN, or SUPER_ADMIN)
 * for that school.
 */
export async function resolveAndAuthorizeFinanceSchool(
  req: Request,
  rawSchoolId: string,
): Promise<{ authorized: boolean; schoolId: string | null }> {
  const resolvedId = await resolveSchoolId(rawSchoolId);
  const targetSchoolId = resolvedId || rawSchoolId;

  if (
    validateAdminSubRoleAccess(req, rawSchoolId, FINANCE_ADMIN_ROLES) ||
    (resolvedId &&
      validateAdminSubRoleAccess(req, resolvedId, FINANCE_ADMIN_ROLES))
  ) {
    return { authorized: true, schoolId: targetSchoolId };
  }

  const user = req.user;
  if (!user?.id || user.userType !== "ADMIN" || !resolvedId) {
    return { authorized: false, schoolId: resolvedId };
  }

  const schoolAdmin = await withRetry(
    () =>
      prisma.schoolAdmin.findFirst({
        where: {
          adminId: user.id,
          schoolId: resolvedId,
          active: true,
        },
        select: { role: true },
      }),
    "finance.resolveAndAuthorizeFinanceSchool",
  );

  if (
    schoolAdmin &&
    FINANCE_ADMIN_ROLES.includes(String(schoolAdmin.role || "SCHOOL_OWNER"))
  ) {
    return { authorized: true, schoolId: resolvedId };
  }

  return { authorized: false, schoolId: resolvedId };
}

/**
 * Verifies whether the authenticated user (Student, Parent, or School Admin)
 * is authorized to access or initiate transcript operations for `studentId`.
 */
export async function canUserAccessStudentTranscript(
  req: Request,
  studentId: string,
  schoolId?: string,
): Promise<boolean> {
  const user = req.user;
  if (!user?.id || !studentId) return false;

  if (user.userType === "SUPER_ADMIN" || user.role === "SUPER_ADMIN") {
    return true;
  }

  if (user.userType === "STUDENT") {
    return user.id === studentId;
  }

  if (user.userType === "PARENT") {
    const link = await withRetry(
      () =>
        prisma.parentChildLink.findFirst({
          where: {
            parentId: user.id,
            studentId,
            status: { in: ["active", "ACCEPTED", "Active"] },
          },
          select: { id: true },
        }),
      "finance.canUserAccessStudentTranscript.parentLink",
    );
    return Boolean(link);
  }

  if (user.userType === "ADMIN" && schoolId) {
    const { authorized } = await resolveAndAuthorizeFinanceSchool(
      req,
      schoolId,
    );
    return authorized;
  }

  return false;
}

/**
 * Resolves the actor metadata (userId, userName, userEmail, userRole) for bank audit trails.
 */
export async function resolveFinanceActorContext(
  req: Request,
  schoolId: string,
  overrides?: {
    addedByName?: string;
    addedByEmail?: string;
    addedByRole?: string;
  },
): Promise<{
  userId?: string;
  userName: string;
  userEmail?: string;
  userRole: string;
}> {
  const user = req.user as
    | {
        id?: string;
        name?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        adminRole?: string;
        role?: string;
        userType?: string;
      }
    | undefined;

  let userName =
    overrides?.addedByName ||
    user?.name ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    user?.email;
  let userEmail = overrides?.addedByEmail || user?.email;
  let userRole =
    overrides?.addedByRole ||
    user?.adminRole ||
    user?.role ||
    user?.userType ||
    "ADMIN";

  if (
    (!userName || userName === "School Administrator" || !userEmail) &&
    user?.id
  ) {
    const admin = await withRetry(
      () =>
        prisma.admin.findUnique({
          where: { id: user.id },
          select: { name: true, email: true, role: true },
        }),
      "finance.resolveFinanceActorContext.admin",
    );
    if (admin) {
      userName = admin.name || userName || "School Administrator";
      userEmail = admin.email || userEmail;
      userRole = admin.role || userRole;
    }
  }

  if (!userName || userName === "School Administrator") {
    const sa = await withRetry(
      () =>
        prisma.schoolAdmin.findFirst({
          where: { schoolId },
          include: {
            admin: { select: { name: true, email: true, role: true } },
          },
        }),
      "finance.resolveFinanceActorContext.schoolAdmin",
    );
    if (sa?.admin) {
      userName = sa.admin.name || userName || "School Administrator";
      userEmail = sa.admin.email || userEmail;
      userRole = sa.admin.role || userRole;
    }
  }

  return {
    userId: user?.id,
    userName: userName || "School Administrator",
    userEmail: userEmail || undefined,
    userRole: userRole || "ADMIN",
  };
}

