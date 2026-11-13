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

/**
 * Verify read-only access to a school's profile/settings/stats for:
 * - School admins / users already authorized via session (`validateSchoolAccess`)
 * - Connected TEACHERS (via Teacher.schoolId, active SCHOOL_TEACHER RelationshipLink, TeacherSubject, or ClassTeacher)
 * - Connected STUDENTS (via Student.schoolId, active SCHOOL_STUDENT RelationshipLink, or ClassEnrollment)
 * - PARENTS whose linked active child belongs to the requested school
 */
export const validateMemberOrParentSchoolAccess = async (
  req: Request,
  schoolId: string,
): Promise<boolean> => {
  const user = req.user;
  if (!user || !schoolId) return false;

  if (validateSchoolAccess(req, schoolId)) return true;

  const resolvedId = await resolveSchoolId(schoolId);
  if (!resolvedId) return false;

  if (validateSchoolAccess(req, resolvedId)) return true;

  if (user.userType === "TEACHER") {
    const [directTeacher, activeLink, subjectAssign, classTeacher] = await withRetry(
      () =>
        Promise.all([
          prisma.teacher.findFirst({
            where: { id: user.id, schoolId: resolvedId },
            select: { id: true },
          }),
          prisma.relationshipLink.findFirst({
            where: {
              linkType: "SCHOOL_TEACHER",
              status: "ACTIVE",
              OR: [
                { leftEntityId: resolvedId, rightEntityId: user.id },
                { leftEntityId: user.id, rightEntityId: resolvedId },
              ],
            },
            select: { id: true },
          }),
          prisma.teacherSubject.findFirst({
            where: {
              teacherId: user.id,
              schoolId: resolvedId,
            },
            select: { id: true },
          }),
          prisma.classTeacher.findFirst({
            where: {
              teacherId: user.id,
              class: { schoolId: resolvedId },
            },
            select: { id: true },
          }),
        ]),
      "school.validateTeacherProfileAccess",
    );
    return Boolean(directTeacher || activeLink || subjectAssign || classTeacher);
  }

  if (user.userType === "STUDENT") {
    const [directStudent, activeLink, enrollment] = await withRetry(
      () =>
        Promise.all([
          prisma.student.findFirst({
            where: { id: user.id, schoolId: resolvedId },
            select: { id: true },
          }),
          prisma.relationshipLink.findFirst({
            where: {
              linkType: "SCHOOL_STUDENT",
              status: "ACTIVE",
              OR: [
                { leftEntityId: resolvedId, rightEntityId: user.id },
                { leftEntityId: user.id, rightEntityId: resolvedId },
              ],
            },
            select: { id: true },
          }),
          prisma.classEnrollment.findFirst({
            where: {
              studentId: user.id,
              class: { schoolId: resolvedId },
            },
            select: { id: true },
          }),
        ]),
      "school.validateStudentProfileAccess",
    );
    return Boolean(directStudent || activeLink || enrollment);
  }

  if (user.userType === "PARENT") {
    const [legacyLinks, relationshipLinks] = await withRetry(
      () =>
        Promise.all([
          prisma.parentChildLink.findMany({
            where: {
              parentId: user.id,
              status: { in: ["active", "ACCEPTED", "Active"] },
            },
            select: { studentId: true },
          }),
          prisma.relationshipLink.findMany({
            where: {
              linkType: "PARENT_STUDENT",
              status: "ACTIVE",
              OR: [{ leftEntityId: user.id }, { rightEntityId: user.id }],
            },
            select: {
              leftEntityId: true,
              leftEntityType: true,
              rightEntityId: true,
              rightEntityType: true,
            },
          }),
        ]),
      "school.validateParentChildrenLinks",
    );

    const childIds = new Set<string>();
    for (const l of legacyLinks) {
      if (l.studentId) childIds.add(l.studentId);
    }
    for (const r of relationshipLinks) {
      if (r.leftEntityType === "STUDENT" && r.leftEntityId) childIds.add(r.leftEntityId);
      if (r.rightEntityType === "STUDENT" && r.rightEntityId) childIds.add(r.rightEntityId);
    }

    if (childIds.size === 0) return false;
    const studentIdList = Array.from(childIds);

    const [childInSchool, childSchoolLink, childEnrollment] = await withRetry(
      () =>
        Promise.all([
          prisma.student.findFirst({
            where: { id: { in: studentIdList }, schoolId: resolvedId },
            select: { id: true },
          }),
          prisma.relationshipLink.findFirst({
            where: {
              linkType: "SCHOOL_STUDENT",
              status: "ACTIVE",
              OR: [
                { leftEntityId: resolvedId, rightEntityId: { in: studentIdList } },
                { rightEntityId: resolvedId, leftEntityId: { in: studentIdList } },
              ],
            },
            select: { id: true },
          }),
          prisma.classEnrollment.findFirst({
            where: {
              studentId: { in: studentIdList },
              class: { schoolId: resolvedId },
            },
            select: { id: true },
          }),
        ]),
      "school.validateParentChildSchoolMatch",
    );

    return Boolean(childInSchool || childSchoolLink || childEnrollment);
  }

  return false;
};

