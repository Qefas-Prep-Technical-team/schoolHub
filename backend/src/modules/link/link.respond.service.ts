// src/modules/link/link.respond.service.ts
import prisma from "../../config/database";
import {
  LinkEntityType,
  LinkRequestStatus,
  LinkStatus,
  Prisma,
} from "@prisma/client";
import { createNotification } from "../notification/notification.service";

type RespondToLinkRequestInput = {
  requestId: string;
  action: "ACCEPT" | "REJECT";
  currentUserId: string;
  currentUserType: LinkEntityType;
  rejectionReason?: string;
};
const resolveSchoolIdForRequest = async ({
  requester,
  target,
  explicitSchoolId,
  classId,
}: {
  requester: any;
  target: any;
  explicitSchoolId?: string;
  classId?: string;
}) => {
  if (explicitSchoolId) return explicitSchoolId;

  if (requester.type === "SCHOOL") return requester.id;
  if (target.type === "SCHOOL") return target.id;

  if (requester.schoolId) return requester.schoolId;
  if (target.schoolId) return target.schoolId;

  if (classId) {
    const foundClass = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (foundClass?.schoolId) return foundClass.schoolId;
  }

  if (target.type === "CLASS") {
    const foundClass = await prisma.class.findUnique({
      where: { id: target.id },
    });

    if (foundClass?.schoolId) return foundClass.schoolId;
  }

  if (requester.type === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({
      where: { id: requester.id },
    });
    if (teacher?.schoolId) return teacher.schoolId;
  }

  if (target.type === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({
      where: { id: target.id },
    });
    if (teacher?.schoolId) return teacher.schoolId;
  }

  if (requester.type === "STUDENT") {
    const student = await prisma.student.findUnique({
      where: { id: requester.id },
    });
    if (student?.schoolId) return student.schoolId;
  }

  if (target.type === "STUDENT") {
    const student = await prisma.student.findUnique({
      where: { id: target.id },
    });
    if (student?.schoolId) return student.schoolId;
  }

  return null;
};

const canRespondToRequest = async ({
  request,
  currentUserId,
  currentUserType,
}: {
  request: any;
  currentUserId: string;
  currentUserType: LinkEntityType;
}) => {
  if (request.targetType === LinkEntityType.SCHOOL) {
    if (currentUserType !== LinkEntityType.ADMIN) return false;

    const schoolAdmin = await prisma.schoolAdmin.findFirst({
      where: {
        adminId: currentUserId,
        schoolId: request.targetSchoolId,
        active: true,
      },
    });

    return !!schoolAdmin;
  }
  if (request.targetType === LinkEntityType.CLASS) {
    const classId = request.targetId || request.classId;
    if (!classId) return false;

    const foundClass = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!foundClass) return false;

    if (currentUserType === LinkEntityType.TEACHER) {
      const classTeacher = await prisma.classTeacher.findUnique({
        where: {
          classId_teacherId: {
            classId,
            teacherId: currentUserId,
          },
        },
      });
      return !!classTeacher;
    }

    if (currentUserType === LinkEntityType.ADMIN && foundClass.schoolId) {
      const schoolAdmin = await prisma.schoolAdmin.findFirst({
        where: {
          adminId: currentUserId,
          schoolId: foundClass.schoolId,
          active: true,
        },
      });

      return !!schoolAdmin;
    }

    return false;
  }
  return (
    request.targetType === currentUserType && request.targetId === currentUserId
  );
};

const applyDomainSideEffects = async (
  tx: Prisma.TransactionClient,
  request: any,
) => {
  switch (request.linkType) {
    case "PARENT_STUDENT": {
      const parentId =
        request.requesterType === "PARENT"
          ? request.requesterId
          : request.targetId;
      const studentId =
        request.requesterType === "STUDENT"
          ? request.requesterId
          : request.targetId;
      const studentCode =
        request.requesterType === "STUDENT"
          ? request.requesterCode
          : request.targetCode;

      if (!parentId || !studentId) break;

      await tx.parentChildLink.upsert({
        where: {
          parentId_studentId: {
            parentId,
            studentId,
          },
        },
        update: {
          status: "active",
        },
        create: {
          parentId,
          studentId,
          studentCode,
          relationship: "parent",
          status: "active",
        },
      });
      break;
    }

    case "SCHOOL_TEACHER": {
      if (
        request.requesterType === "SCHOOL" &&
        request.targetType === "TEACHER" &&
        request.targetId
      ) {
        await tx.teacher.update({
          where: { id: request.targetId },
          data: { schoolId: request.requesterId },
        });
      }

      if (
        request.requesterType === "TEACHER" &&
        request.targetType === "SCHOOL"
      ) {
        await tx.teacher.update({
          where: { id: request.requesterId },
          data: { schoolId: request.targetId },
        });
      }
      break;
    }

    case "SCHOOL_STUDENT": {
      if (
        request.requesterType === "SCHOOL" &&
        request.targetType === "STUDENT" &&
        request.targetId
      ) {
        await tx.student.update({
          where: { id: request.targetId },
          data: { schoolId: request.requesterId },
        });
      }

      if (
        request.requesterType === "STUDENT" &&
        request.targetType === "SCHOOL"
      ) {
        await tx.student.update({
          where: { id: request.requesterId },
          data: { schoolId: request.targetId },
        });
      }
      break;
    }

    case "TEACHER_CLASS": {
      if (!request.classId) break;

      const teacherId =
        request.requesterType === "TEACHER"
          ? request.requesterId
          : request.targetId;

      if (!teacherId) break;

      await tx.classTeacher.upsert({
        where: {
          classId_teacherId: {
            classId: request.classId,
            teacherId,
          },
        },
        update: { isLead: true },
        create: {
          classId: request.classId,
          teacherId,
          isLead: true,
        },
      });
      break;
    }

    case "STUDENT_CLASS": {
      if (!request.classId) break;

      const studentId =
        request.requesterType === "STUDENT"
          ? request.requesterId
          : request.targetId;

      if (!studentId) break;

      await tx.classEnrollment.upsert({
        where: {
          classId_studentId: {
            classId: request.classId,
            studentId,
          },
        },
        update: {},
        create: {
          classId: request.classId,
          studentId,
        },
      });

      // Also link student to the school if not already linked
      const foundClass = await tx.class.findUnique({
        where: { id: request.classId },
      });
      if (foundClass?.schoolId) {
        await tx.student.update({
          where: { id: studentId },
          data: { schoolId: foundClass.schoolId },
        });
      }
      break;
    }

    default:
      break;
  }
};

export const respondToLinkRequestService = async ({
  requestId,
  action,
  currentUserId,
  currentUserType,
  rejectionReason,
}: RespondToLinkRequestInput) => {
  const request = await prisma.linkRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new Error("Link request not found");
  }

  if (request.status !== LinkRequestStatus.PENDING) {
    throw new Error("This request has already been responded to");
  }

  const allowed = await canRespondToRequest({
    request,
    currentUserId,
    currentUserType,
  });

  if (!allowed) {
    throw new Error("You are not allowed to respond to this request");
  }

  if (action === "REJECT") {
    const rejectedRequest = await prisma.linkRequest.update({
      where: { id: requestId },
      data: {
        status: LinkRequestStatus.REJECTED,
        rejectionReason: rejectionReason || null,
        respondedAt: new Date(),
        approvedByAdminId:
          currentUserType === LinkEntityType.ADMIN ? currentUserId : null,
      },
    });

    await createNotification({
      recipientType: request.requesterType as any,
      recipientId: request.requesterId,
      senderType: request.targetType as any,
      senderId: request.targetId || undefined,
      type: "LINK_REJECTED",
      title: "Link Request Rejected",
      message: "Your link request was rejected",
      linkRequestId: request.id,
      meta: {
        linkType: request.linkType,
        rejectionReason: rejectionReason || null,
      },
    });

    return {
      request: rejectedRequest,
      relationship: null,
    };
  }

  const result = await prisma.$transaction(async (tx) => {
    // console.log("REQUEST BEFORE ACCEPT:", {
    //   id: request.id,
    //   linkType: request.linkType,
    //   requesterType: request.requesterType,
    //   requesterId: request.requesterId,
    //   targetType: request.targetType,
    //   targetId: request.targetId,
    //   schoolId: request.schoolId,
    //   requesterSchoolId: request.requesterSchoolId,
    //   targetSchoolId: request.targetSchoolId,
    //   classId: request.classId,
    // });

    const resolvedSchoolId = await resolveSchoolIdForRequest({
      requester: {
        type: request.requesterType,
        id: request.requesterId,
        schoolId: request.requesterSchoolId,
      },
      target: {
        type: request.targetType,
        id: request.targetId,
        schoolId: request.targetSchoolId,
      },
      classId: request.classId || undefined,
    });
    // console.log("RESOLVED SCHOOL ID:", resolvedSchoolId);
    const relationship = await tx.relationshipLink.create({
      data: {
        linkType: request.linkType,
        status: LinkStatus.ACTIVE,
        leftEntityType: request.requesterType,
        leftEntityId: request.requesterId,
        leftCode: request.requesterCode,
        rightEntityType: request.targetType,
        rightEntityId: request.targetId || request.classId || "",
        rightCode: request.targetCode,
        schoolId: resolvedSchoolId,
        classId: request.classId || undefined,
      },
    });

    const acceptedRequest = await tx.linkRequest.update({
      where: { id: requestId },
      data: {
        status: LinkRequestStatus.ACCEPTED,
        respondedAt: new Date(),
        approvedByAdminId:
          currentUserType === LinkEntityType.ADMIN ? currentUserId : null,
        relationshipLinkId: relationship.id,
        schoolId: resolvedSchoolId,
      },
    });

    await applyDomainSideEffects(tx, request);

    return {
      request: acceptedRequest,
      relationship,
    };
  });

  await createNotification({
    recipientType: request.requesterType as any,
    recipientId: request.requesterId,
    senderType: request.targetType as any,
    senderId: request.targetId || undefined,
    type: "LINK_ACCEPTED",
    title: "Link Request Accepted",
    message: "Your link request was accepted",
    linkRequestId: request.id,
    meta: {
      linkType: request.linkType,
      relationshipLinkId: result.relationship.id,
    },
  });

  return result;
};
