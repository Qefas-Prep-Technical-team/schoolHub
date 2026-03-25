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

const buildIncomingWhere = ({
  currentUserId,
  currentUserType,
}: CurrentUserInput) => {
  if (currentUserType === LinkEntityType.ADMIN) {
    return {
      status: LinkRequestStatus.PENDING,
      OR: [
        {
          targetType: LinkEntityType.ADMIN,
          targetId: currentUserId,
        },
        {
          targetType: LinkEntityType.SCHOOL,
          targetSchool: {
            admins: {
              some: {
                adminId: currentUserId,
                active: true,
              },
            },
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

  const where: any = buildIncomingWhere({ currentUserId, currentUserType });

  if (options.linkType && Object.values(LinkType).includes(options.linkType as any)) {
    where.linkType = options.linkType;
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
  }

  const [items, total] = await Promise.all([
    prisma.relationshipLink.findMany({
      where,
      include: {
        school: true,
        class: true,
        approvedFromRequest: true,
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