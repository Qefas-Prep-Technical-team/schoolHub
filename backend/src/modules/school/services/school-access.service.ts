import { Request } from "express";
import prisma, { withRetry } from "../../../config/database";

/**
 * Resolve a school ID (which might be a UUID or a tenantId) to its canonical UUID.
 */
export const resolveSchoolId = async (
  schoolId: string,
): Promise<string | null> => {
  if (!schoolId) return null;
  const school = await withRetry(
    () =>
      prisma.school.findFirst({
        where: {
          OR: [{ id: schoolId }, { tenantId: schoolId }],
        },
        select: { id: true },
      }),
    "school.resolveSchoolId",
  );
  return school ? school.id : null;
};

/**
 * Helper to verify if the authenticated user belongs to a specific school.
 * This prevents IDOR/data leakage between tenants.
 */
export const validateSchoolAccess = (req: Request, schoolId: string): boolean => {
  const user = req.user;
  if (!user || !schoolId) return false;

  // Platform SUPER_ADMIN can access any school
  if (user.userType === "SUPER_ADMIN" || user.role === "SUPER_ADMIN") return true;

  // Direct match with authorized schoolId from session
  if (user.schoolId === schoolId) return true;

  // Match with tenantId (in case the frontend uses tenantId as schoolId)
  if (user.tenantId === schoolId) return true;

  // Check user.schools array if user belongs to multiple schools
  if (
    Array.isArray(user.schools) &&
    user.schools.some(
      (s: { schoolId?: string; id?: string; tenantId?: string }) =>
        s.schoolId === schoolId || s.id === schoolId || s.tenantId === schoolId,
    )
  ) {
    return true;
  }

  return false;
};

/**
 * Helper to verify that the authenticated user is an ADMIN (or SUPER_ADMIN)
 * AND has access to the requested school.
 */
export const validateAdminSchoolAccess = (
  req: Request,
  schoolId: string,
): boolean => {
  const user = req.user;
  if (!user) return false;

  if (user.userType === "SUPER_ADMIN" || user.role === "SUPER_ADMIN") return true;

  if (user.userType !== "ADMIN") return false;

  return validateSchoolAccess(req, schoolId);
};

/**
 * Helper to verify that the authenticated user is a school admin with one of the
 * specified sub-roles (e.g. ["SCHOOL_OWNER", "PRINCIPAL"]).
 * If the admin has no sub-role assigned (legacy primary admin), SCHOOL_OWNER is assumed.
 */
export const validateAdminSubRoleAccess = (
  req: Request,
  schoolId: string,
  allowedSubRoles: string[],
): boolean => {
  if (!validateAdminSchoolAccess(req, schoolId)) return false;

  const user = req.user;
  if (user.userType === "SUPER_ADMIN" || user.role === "SUPER_ADMIN") return true;

  const subRole = (user as { adminRole?: string }).adminRole || "SCHOOL_OWNER";
  return allowedSubRoles.includes(subRole);
};

