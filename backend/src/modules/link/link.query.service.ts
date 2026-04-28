// src/modules/link/link.query.service.ts
import prisma from "../../config/database";
import { LinkEntityType, LinkRequestStatus, LinkStatus, LinkType } from "@prisma/client";

type CurrentUserInput = {
  currentUserId: string;
  currentUserType: LinkEntityType;
};

type QueryOptions = {
  page?: number;
  limit?: number;
  status?: string;
  linkType?: string;
  category?: "network" | "classroom";
};

const getPagination = (page = 1, limit = 10) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
};

const buildIncomingWhere = async ({
  currentUserId,
  currentUserType,
}: CurrentUserInput) => {
  if (currentUserType === LinkEntityType.ADMIN) {
    const schoolAdminLinks = await prisma.schoolAdmin.findMany({
      where: { adminId: currentUserId, active: true },
      select: { schoolId: true },
    });
    const schoolIds = schoolAdminLinks.map((s) => s.schoolId);

    return {
      status: LinkRequestStatus.PENDING,
      OR: [
        { targetType: LinkEntityType.ADMIN, targetId: currentUserId },
        { targetSchoolId: { in: schoolIds } },
        {
          targetType: { in: [LinkEntityType.SCHOOL, LinkEntityType.CLASS] },
          schoolId: { in: schoolIds }
        },
        {
          targetType: LinkEntityType.SCHOOL,
          targetSchool: {
            admins: { some: { adminId: currentUserId, active: true } },
          },
        },
      ],
    };
  }

  return {
    status: LinkRequestStatus.PENDING,
    targetType: currentUserType,
    targetId: currentUserId,
  };
};

export const getOutgoingLinkRequestsService = async (
  { currentUserId, currentUserType }: CurrentUserInput,
  options: QueryOptions = {}
) => {
  const { page, limit, skip } = getPagination(options.page, options.limit);

  const where: any = {
    requesterType: currentUserType,
    requesterId: currentUserId,
  };

  if (options.status && Object.values(LinkRequestStatus).includes(options.status as any)) {
    where.status = options.status;
  }

  if (options.linkType && Object.values(LinkType).includes(options.linkType as any)) {
    where.linkType = options.linkType;
  } else if (options.category) {
    const classroomTypes: LinkType[] = [LinkType.TEACHER_CLASS, LinkType.STUDENT_CLASS];
    if (options.category === 'classroom') {
      where.linkType = { in: classroomTypes };
    } else {
      where.linkType = { notIn: classroomTypes };
    }
  }

  const [items, total] = await Promise.all([
    prisma.linkRequest.findMany({
      where,
      include: {
        requesterAdmin: true,
        approverAdmin: true,
        requesterSchool: true,
        targetSchool: true,
        requesterTeacher: true,
        targetTeacher: true,
        requesterStudent: true,
        targetStudent: true,
        requesterParent: true,
        targetParent: true,
        relationshipLink: true,
        class: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.linkRequest.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getIncomingPendingLinkRequestsService = async (
  { currentUserId, currentUserType }: CurrentUserInput,
  options: QueryOptions = {}
) => {
  const { page, limit, skip } = getPagination(options.page, options.limit);

  const where: any = await buildIncomingWhere({ currentUserId, currentUserType });

  if (options.linkType && Object.values(LinkType).includes(options.linkType as any)) {
    where.linkType = options.linkType;
  } else if (options.category) {
    const classroomTypes: LinkType[] = [LinkType.TEACHER_CLASS, LinkType.STUDENT_CLASS];
    if (options.category === 'classroom') {
      where.linkType = { in: classroomTypes };
    } else {
      where.linkType = { notIn: classroomTypes };
    }
  }

  const [items, total] = await Promise.all([
    prisma.linkRequest.findMany({
      where,
      include: {
        requesterAdmin: true,
        approverAdmin: true,
        requesterSchool: true,
        targetSchool: true,
        requesterTeacher: true,
        targetTeacher: true,
        requesterStudent: true,
        targetStudent: true,
        requesterParent: true,
        targetParent: true,
        relationshipLink: true,
        class: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.linkRequest.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getAllLinkRequestsService = async (
  { currentUserId, currentUserType }: CurrentUserInput,
  options: QueryOptions = {}
) => {
  const { page, limit, skip } = getPagination(options.page, options.limit);

  // Incoming logic (based on buildIncomingWhere but removing the PENDING restriction if needed)
  // Actually, let's keep it flexible. If a status is passed, use it. 
  // If no status is passed, we show everything relevant to the user.

  const incomingWhere: any = {};
  if (currentUserType === LinkEntityType.ADMIN) {
    const schoolAdminLinks = await prisma.schoolAdmin.findMany({
      where: { adminId: currentUserId, active: true },
      select: { schoolId: true },
    });
    const schoolIds = schoolAdminLinks.map((s) => s.schoolId);

    incomingWhere.OR = [
      { targetType: LinkEntityType.ADMIN, targetId: currentUserId },
      { targetSchoolId: { in: schoolIds } },
      { schoolId: { in: schoolIds } },
      {
        targetType: LinkEntityType.SCHOOL,
        targetSchool: {
          admins: { some: { adminId: currentUserId, active: true } },
        },
      },
    ];
  } else {
    incomingWhere.targetType = currentUserType;
    incomingWhere.targetId = currentUserId;
  }

  const outgoingWhere = {
    requesterType: currentUserType,
    requesterId: currentUserId,
  };

  const where: any = {
    OR: [incomingWhere, outgoingWhere],
  };

  if (options.status && Object.values(LinkRequestStatus).includes(options.status as any)) {
    where.status = options.status;
  }

  if (options.linkType && Object.values(LinkType).includes(options.linkType as any)) {
    where.linkType = options.linkType;
  } else if (options.category) {
    // Grouped by classroom vs network
    const classroomTypes: LinkType[] = [LinkType.TEACHER_CLASS, LinkType.STUDENT_CLASS];
    if (options.category === 'classroom') {
      where.linkType = { in: classroomTypes };
    } else {
      where.linkType = { notIn: classroomTypes };
    }
  }

  const [items, total] = await Promise.all([
    prisma.linkRequest.findMany({
      where,
      include: {
        requesterAdmin: true,
        approverAdmin: true,
        requesterSchool: true,
        targetSchool: true,
        requesterTeacher: true,
        targetTeacher: true,
        requesterStudent: true,
        targetStudent: true,
        requesterParent: true,
        targetParent: true,
        relationshipLink: true,
        class: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.linkRequest.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getActiveLinksService = async (
  { currentUserId, currentUserType }: CurrentUserInput,
  options: QueryOptions = {}
) => {
  const { page, limit, skip } = getPagination(options.page, options.limit);

  let where: any = {
    status: LinkStatus.ACTIVE,
    OR: [
      { leftEntityType: currentUserType, leftEntityId: currentUserId },
      { rightEntityType: currentUserType, rightEntityId: currentUserId },
    ],
  };

  if (currentUserType === LinkEntityType.ADMIN) {
    const schoolAdminLinks = await prisma.schoolAdmin.findMany({
      where: { adminId: currentUserId, active: true },
      select: { schoolId: true },
    });

    const schoolIds = schoolAdminLinks.map((s) => s.schoolId);

    where = {
      status: LinkStatus.ACTIVE,
      OR: [
        { leftEntityType: currentUserType, leftEntityId: currentUserId },
        { rightEntityType: currentUserType, rightEntityId: currentUserId },
        { schoolId: { in: schoolIds } },
        ...(schoolIds.length
          ? [
              { leftEntityType: LinkEntityType.SCHOOL, leftEntityId: { in: schoolIds } },
              { rightEntityType: LinkEntityType.SCHOOL, rightEntityId: { in: schoolIds } },
            ]
          : []),
      ],
    };
  }

  if (options.linkType && Object.values(LinkType).includes(options.linkType as any)) {
    where.linkType = options.linkType;
  } else if (options.category) {
    const classroomTypes: LinkType[] = [LinkType.TEACHER_CLASS, LinkType.STUDENT_CLASS];
    if (options.category === 'classroom') {
      where.linkType = { in: classroomTypes };
    } else {
      where.linkType = { notIn: classroomTypes };
    }
  }

  const [items, total] = await Promise.all([
    prisma.relationshipLink.findMany({
      where,
      include: {
        school: true,
        class: true,
        approvedFromRequest: {
          include: {
            requesterTeacher: true,
            targetTeacher: true,
            requesterStudent: true,
            targetStudent: true,
            requesterParent: true,
            targetParent: true,
            requesterAdmin: true,
            approverAdmin: true,
            class: true,
          }
        },
        audits: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.relationshipLink.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};