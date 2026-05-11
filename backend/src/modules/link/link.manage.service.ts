// src/modules/link/link.manage.service.ts
import prisma from "../../config/database";
import {
  LinkEntityType,
  LinkRequestStatus,
  LinkStatus,
  Prisma,
} from "@prisma/client";
import { createNotification } from "../notification/notification.service";

type CurrentUserInput = {
  currentUserId: string;
  currentUserType: LinkEntityType;
};

export const getSingleLinkRequestService = async ({
  requestId,
  currentUserId,
  currentUserType,
}: CurrentUserInput & { requestId: string }) => {
  const request = await prisma.linkRequest.findUnique({
    where: { id: requestId },
    include: {
      requestedByAdmin: true,
      approvedByAdmin: true,
      requesterSchool: true,
      targetSchool: true,
      requesterTeacher: true,
      targetTeacher: true,
      requesterStudent: true,
      targetStudent: true,
      requesterParent: true,
      targetParent: true,
      relationshipLink: true,
      notifications: true,
    },
  });

  if (!request) {
    throw new Error("Link request not found");
  }

  let canAccess =
    (request.requesterType === currentUserType &&
      request.requesterId === currentUserId) ||
    (request.targetType === currentUserType &&
      request.targetId === currentUserId);

  // If still no access, check if user is an Admin for one of the schools involved
  if (!canAccess && currentUserType === "ADMIN") {
    const schoolIds = [
      request.schoolId,
      request.targetSchoolId,
      request.requesterSchoolId,
    ].filter(Boolean) as string[];

    if (schoolIds.length > 0) {
      const adminOfSchool = await prisma.schoolAdmin.findFirst({
        where: {
          adminId: currentUserId,
          schoolId: { in: schoolIds },
          active: true,
        },
      });
      if (adminOfSchool) {
        canAccess = true;
      }
    }
  }

  if (!canAccess) {
    throw new Error("You are not allowed to view this request");
  }

  return request;
};

export const cancelLinkRequestService = async ({
  requestId,
  currentUserId,
  currentUserType,
}: CurrentUserInput & { requestId: string }) => {
  const request = await prisma.linkRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new Error("Link request not found");
  }

  if (
    request.requesterType !== currentUserType ||
    request.requesterId !== currentUserId
  ) {
    throw new Error("You can only cancel your own request");
  }

  if (request.status !== LinkRequestStatus.PENDING) {
    throw new Error("Only pending requests can be cancelled");
  }

  const cancelled = await prisma.linkRequest.update({
    where: { id: requestId },
    data: {
      status: LinkRequestStatus.CANCELLED,
      respondedAt: new Date(),
    },
  });

  if (request.targetId) {
    await createNotification({
      recipientType: request.targetType as any,
      recipientId: request.targetId,
      senderType: request.requesterType as any,
      senderId: request.requesterId,
      type: "GENERAL",
      title: "Link Request Cancelled",
      message: "A link request sent to you was cancelled",
      linkRequestId: request.id,
      meta: {
        linkType: request.linkType,
      },
    });
  }

  return cancelled;
};

const removeDomainSideEffects = async (
  tx: Prisma.TransactionClient,
  link: any
) => {
  switch (link.linkType) {
    case "PARENT_STUDENT": {
      const parentId =
        link.leftEntityType === "PARENT" ? link.leftEntityId : link.rightEntityId;
      const studentId =
        link.leftEntityType === "STUDENT" ? link.leftEntityId : link.rightEntityId;

      await tx.parentChildLink.deleteMany({
        where: {
          parentId,
          studentId,
        },
      });
      break;
    }

    case "TEACHER_CLASS": {
      if (link.classId) {
        const teacherId =
          link.leftEntityType === "TEACHER"
            ? link.leftEntityId
            : link.rightEntityId;

        await tx.classTeacher.deleteMany({
          where: {
            classId: link.classId,
            teacherId,
          },
        });
      }
      break;
    }

    case "STUDENT_CLASS": {
      if (link.classId) {
        const studentId =
          link.leftEntityType === "STUDENT"
            ? link.leftEntityId
            : link.rightEntityId;

        await tx.classEnrollment.deleteMany({
          where: {
            classId: link.classId,
            studentId,
          },
        });
      }
      break;
    }

    default:
      break;
  }
};

export const revokeActiveLinkService = async ({
  linkId,
  currentUserId,
  currentUserType,
}: CurrentUserInput & { linkId: string }) => {
  const link = await prisma.relationshipLink.findUnique({
    where: { id: linkId },
    include: {
      approvedFromRequest: true,
    },
  });

  if (!link) {
    throw new Error("Relationship link not found");
  }

  if (link.status !== LinkStatus.ACTIVE) {
    throw new Error("Only active links can be revoked");
  }

  const isDirectParty =
    (link.leftEntityType === currentUserType &&
      link.leftEntityId === currentUserId) ||
    (link.rightEntityType === currentUserType &&
      link.rightEntityId === currentUserId);

  if (!isDirectParty) {
    throw new Error("You are not allowed to revoke this link");
  }

  const revoked = await prisma.$transaction(async (tx) => {
    const updated = await tx.relationshipLink.update({
      where: { id: linkId },
      data: {
        status: LinkStatus.REVOKED,
        endedAt: new Date(),
      },
    });

    await removeDomainSideEffects(tx, link);

    await tx.relationshipAudit.create({
      data: {
        relationshipLinkId: link.id,
        action: "REVOKED",
        actorAdminId: currentUserType === "ADMIN" ? currentUserId : null,
        note: "Relationship revoked by user",
      },
    });

    return updated;
  });

  const requesterType = link.leftEntityType;
  const requesterId = link.leftEntityId;
  const otherType = link.rightEntityType;
  const otherId = link.rightEntityId;

  await createNotification({
    recipientType: requesterType as any,
    recipientId: requesterId,
    senderType: otherType as any,
    senderId: otherId,
    type: "GENERAL",
    title: "Link Revoked",
    message: "One of your active links has been revoked",
    meta: {
      relationshipLinkId: link.id,
      linkType: link.linkType,
    },
  });

  if (otherId !== requesterId) {
    await createNotification({
      recipientType: otherType as any,
      recipientId: otherId,
      senderType: requesterType as any,
      senderId: requesterId,
      type: "GENERAL",
      title: "Link Revoked",
      message: "One of your active links has been revoked",
      meta: {
        relationshipLinkId: link.id,
        linkType: link.linkType,
      },
    });
  }

  return revoked;
};