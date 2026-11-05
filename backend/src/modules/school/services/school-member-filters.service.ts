import prisma, { withRetry } from "../../../config/database";
import { LinkEntityType, LinkStatus, LinkType, Prisma } from "@prisma/client";

/**
 * Helper to retrieve canonical active linked & disconnected teacher IDs for a school.
 * Excludes teachers whose link request is still PENDING or whose link was DISCONNECTED/REJECTED.
 */
export const getActiveSchoolTeacherFilter = async (
  resolvedSchoolId: string,
): Promise<Prisma.TeacherWhereInput> => {
  const [links, pendingRequests] = await Promise.all([
    withRetry(
      () =>
        prisma.relationshipLink.findMany({
          where: {
            linkType: LinkType.SCHOOL_TEACHER,
            OR: [
              {
                leftEntityType: LinkEntityType.SCHOOL,
                leftEntityId: resolvedSchoolId,
                rightEntityType: LinkEntityType.TEACHER,
              },
              {
                rightEntityType: LinkEntityType.SCHOOL,
                rightEntityId: resolvedSchoolId,
                leftEntityType: LinkEntityType.TEACHER,
              },
            ],
          },
          select: {
            status: true,
            leftEntityType: true,
            leftEntityId: true,
            rightEntityId: true,
          },
        }),
      "school.getActiveSchoolTeacherFilter.links",
    ),
    withRetry(
      () =>
        prisma.linkRequest.findMany({
          where: {
            linkType: LinkType.SCHOOL_TEACHER,
            status: { in: ["PENDING", "REJECTED", "CANCELLED", "EXPIRED"] },
            OR: [
              { requesterSchoolId: resolvedSchoolId },
              { targetSchoolId: resolvedSchoolId },
            ],
          },
          select: {
            requesterTeacherId: true,
            targetTeacherId: true,
          },
        }),
      "school.getActiveSchoolTeacherFilter.pendingRequests",
    ),
  ]);

  const activeTeacherIds = new Set<string>();
  const inactiveTeacherIds = new Set<string>();

  for (const link of links) {
    const teacherId =
      link.leftEntityType === LinkEntityType.TEACHER
        ? link.leftEntityId
        : link.rightEntityId;
    if (link.status === LinkStatus.ACTIVE) {
      activeTeacherIds.add(teacherId);
    } else {
      inactiveTeacherIds.add(teacherId);
    }
  }

  for (const req of pendingRequests) {
    const tId = req.requesterTeacherId || req.targetTeacherId;
    if (tId && !activeTeacherIds.has(tId)) {
      inactiveTeacherIds.add(tId);
    }
  }

  const excludedIds = Array.from(inactiveTeacherIds).filter(
    (id) => !activeTeacherIds.has(id),
  );

  return {
    AND: [
      {
        OR: [
          { id: { in: Array.from(activeTeacherIds) } },
          { schoolId: resolvedSchoolId },
          { currentSchoolId: resolvedSchoolId },
          { activeSchoolId: resolvedSchoolId },
          { primarySchoolId: resolvedSchoolId },
        ],
      },
      ...(excludedIds.length > 0 ? [{ id: { notIn: excludedIds } }] : []),
    ],
  };
};

/**
 * Helper to retrieve canonical active linked & enrolled student filter for a school.
 * Excludes students whose link was DISCONNECTED or whose link request is still PENDING.
 */
export const getActiveSchoolStudentFilter = async (
  resolvedSchoolId: string,
): Promise<Prisma.StudentWhereInput> => {
  const [links, enrollments, pendingRequests] = await Promise.all([
    withRetry(
      () =>
        prisma.relationshipLink.findMany({
          where: {
            linkType: LinkType.SCHOOL_STUDENT,
            OR: [
              { leftEntityId: resolvedSchoolId },
              { rightEntityId: resolvedSchoolId },
            ],
          },
          select: {
            status: true,
            leftEntityType: true,
            leftEntityId: true,
            rightEntityId: true,
          },
        }),
      "school.getActiveSchoolStudentFilter.links",
    ),
    withRetry(
      () =>
        prisma.classEnrollment.findMany({
          where: { class: { schoolId: resolvedSchoolId } },
          select: { studentId: true },
        }),
      "school.getActiveSchoolStudentFilter.enrollments",
    ),
    withRetry(
      () =>
        prisma.linkRequest.findMany({
          where: {
            linkType: LinkType.SCHOOL_STUDENT,
            status: { in: ["PENDING", "REJECTED", "CANCELLED", "EXPIRED"] },
            OR: [
              { requesterSchoolId: resolvedSchoolId },
              { targetSchoolId: resolvedSchoolId },
            ],
          },
          select: {
            requesterStudentId: true,
            targetStudentId: true,
          },
        }),
      "school.getActiveSchoolStudentFilter.pendingRequests",
    ),
  ]);

  const activeStudentIds = new Set<string>(
    enrollments.map((e) => e.studentId),
  );
  const inactiveStudentIds = new Set<string>();

  for (const link of links) {
    const studentId =
      link.leftEntityType === LinkEntityType.STUDENT
        ? link.leftEntityId
        : link.rightEntityId;
    if (link.status === LinkStatus.ACTIVE) {
      activeStudentIds.add(studentId);
    } else {
      inactiveStudentIds.add(studentId);
    }
  }

  for (const req of pendingRequests) {
    const sId = req.requesterStudentId || req.targetStudentId;
    if (sId && !activeStudentIds.has(sId)) {
      inactiveStudentIds.add(sId);
    }
  }

  const excludedIds = Array.from(inactiveStudentIds).filter(
    (id) => !activeStudentIds.has(id),
  );

  return {
    AND: [
      {
        OR: [
          { id: { in: Array.from(activeStudentIds) } },
          { schoolId: resolvedSchoolId },
        ],
      },
      ...(excludedIds.length > 0 ? [{ id: { notIn: excludedIds } }] : []),
    ],
  };
};

