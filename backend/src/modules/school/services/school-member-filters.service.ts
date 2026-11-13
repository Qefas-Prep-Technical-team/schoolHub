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
              { schoolId: resolvedSchoolId },
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
            rightEntityType: true,
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
              { schoolId: resolvedSchoolId },
              { requesterSchoolId: resolvedSchoolId },
              { targetSchoolId: resolvedSchoolId },
              { requesterType: LinkEntityType.SCHOOL, requesterId: resolvedSchoolId },
              { targetType: LinkEntityType.SCHOOL, targetId: resolvedSchoolId },
            ],
          },
          select: {
            requesterType: true,
            requesterId: true,
            targetType: true,
            targetId: true,
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
        : link.rightEntityType === LinkEntityType.TEACHER
          ? link.rightEntityId
          : null;
    if (!teacherId) continue;
    if (link.status === LinkStatus.ACTIVE) {
      activeTeacherIds.add(teacherId);
    } else {
      inactiveTeacherIds.add(teacherId);
    }
  }

  for (const req of pendingRequests) {
    const tId =
      req.requesterTeacherId ||
      req.targetTeacherId ||
      (req.requesterType === LinkEntityType.TEACHER
        ? req.requesterId
        : req.targetType === LinkEntityType.TEACHER
          ? req.targetId
          : null);
    if (tId && !activeTeacherIds.has(tId)) {
      inactiveTeacherIds.add(tId);
    }
  }

  const activeIdList = Array.from(activeTeacherIds);
  const excludedIds = Array.from(inactiveTeacherIds).filter(
    (id) => !activeTeacherIds.has(id),
  );

  // Fire-and-forget cleanup of stale school pointers on claimed teachers who lack an ACTIVE SCHOOL_TEACHER link
  const staleFilterBase: Prisma.TeacherWhereInput =
    activeIdList.length > 0 ? { id: { notIn: activeIdList } } : {};
  Promise.all([
    prisma.teacher.updateMany({
      where: { isClaimed: true, ...staleFilterBase, activeSchoolId: resolvedSchoolId },
      data: { activeSchoolId: null },
    }),
    prisma.teacher.updateMany({
      where: { isClaimed: true, ...staleFilterBase, primarySchoolId: resolvedSchoolId },
      data: { primarySchoolId: null },
    }),
    prisma.teacher.updateMany({
      where: { isClaimed: true, ...staleFilterBase, currentSchoolId: resolvedSchoolId },
      data: { currentSchoolId: null },
    }),
    prisma.teacher.updateMany({
      where: { isClaimed: true, ...staleFilterBase, schoolId: resolvedSchoolId },
      data: { schoolId: null },
    }),
  ]).catch((err) => {
    console.error("[school.getActiveSchoolTeacherFilter] Failed to heal stale teacher school pointers:", err);
  });

  return {
    AND: [
      {
        OR: [
          { id: { in: activeIdList } },
          {
            isClaimed: false,
            OR: [
              { primarySchoolId: resolvedSchoolId },
              { schoolId: resolvedSchoolId },
            ],
          },
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

