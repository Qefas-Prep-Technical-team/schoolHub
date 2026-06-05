// src/modules/link/link.respond.service.ts
import prisma from "../../config/database";
import {
  LinkEntityType,
  LinkRequestStatus,
  LinkStatus,
  Prisma,
} from "@prisma/client";
import { createNotification } from "../notification/notification.service";
import { checkLinkCapacity, canSchoolAcceptTeacher } from "../payment/subscription.utils";
import { StudentLifecycleService } from "../student/student.lifecycle.service";

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
    if (teacher?.activeSchoolId) return teacher.activeSchoolId;
  }

  if (target.type === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({
      where: { id: target.id },
    });
    if (teacher?.activeSchoolId) return teacher.activeSchoolId;
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
        schoolId: request.targetSchoolId || request.schoolId || "",
        active: true,
      },
    });

    if (!schoolAdmin) {
        throw new Error("You are not an active admin of the target school.");
    }

    return true;
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

  // For individuals (STUDENT, TEACHER, PARENT), the ID must match the current user
  const individualTypes = [LinkEntityType.STUDENT, LinkEntityType.TEACHER, LinkEntityType.PARENT];
  if (individualTypes.includes(request.targetType)) {
    if (request.targetType !== currentUserType) {
        throw new Error(`Authorization mismatch: This request is targeting a ${request.targetType}, but you are logged in as a ${currentUserType}.`);
    }

    if (request.targetId !== currentUserId) {
        throw new Error(`Access Denied: This request was sent specifically to another user ID.`);
    }
  }

  // If it's a SCHOOL or CLASS target, the specific handlers above already verified 
  // that the user is an authorized admin/teacher.
  return true;
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
          data: { 
            primarySchoolId: request.requesterId,
            activeSchoolId: request.requesterId
          },
        });
      }

      if (
        request.requesterType === "TEACHER" &&
        request.targetType === "SCHOOL"
      ) {
        await tx.teacher.update({
          where: { id: request.requesterId },
          data: { 
            primarySchoolId: request.targetId,
            activeSchoolId: request.targetId
          },
        });
      }
      break;
    }

    case "SCHOOL_STUDENT": {
      if (
        request.requesterType === "STUDENT" &&
        request.targetType === "SCHOOL"
      ) {
        await StudentLifecycleService.enrollStudentInSchool(
          tx,
          request.requesterId,
          request.targetId,
        );
        // We still need to verify the student
        await tx.student.update({
          where: { id: request.requesterId },
          data: { verified: true },
        });
      }

      if (
        request.requesterType === "SCHOOL" &&
        request.targetType === "STUDENT" &&
        request.targetId
      ) {
        await StudentLifecycleService.enrollStudentInSchool(
          tx,
          request.targetId,
          request.requesterId,
        );
        await tx.student.update({
          where: { id: request.targetId },
          data: { verified: true },
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
        await StudentLifecycleService.enrollStudentInSchool(
          tx,
          studentId,
          foundClass.schoolId,
        );
        await tx.student.update({
          where: { id: studentId },
          data: { verified: true },
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

  // Final Capacity Check before accepting
  if (request.linkType === 'SCHOOL_STUDENT' || request.linkType === 'TEACHER_STUDENT' || request.linkType === 'PARENT_STUDENT') {
      const targetEntityId = request.targetType === 'SCHOOL' || request.targetType === 'TEACHER' || request.targetType === 'PARENT' ? request.targetId : 
                             request.requesterType === 'SCHOOL' || request.requesterType === 'TEACHER' || request.requesterType === 'PARENT' ? request.requesterId : null;
      const targetEntityType = request.targetType === 'SCHOOL' || request.targetType === 'TEACHER' || request.targetType === 'PARENT' ? request.targetType : 
                               request.requesterType === 'SCHOOL' || request.requesterType === 'TEACHER' || request.requesterType === 'PARENT' ? request.requesterType : null;
      
      if (targetEntityId && targetEntityType) {
          const hasSpace = await checkLinkCapacity(targetEntityId, targetEntityType);
          if (!hasSpace) {
              throw new Error("Cannot accept: Student capacity limit reached for the current plan.");
          }
      }
  }

  if (request.linkType === 'SCHOOL_TEACHER') {
      const schoolId = request.targetType === 'SCHOOL' ? request.targetId : 
                       request.requesterType === 'SCHOOL' ? request.requesterId : request.schoolId;
      if (schoolId) {
          const hasSpace = await canSchoolAcceptTeacher(schoolId);
          if (!hasSpace) {
              throw new Error("Cannot accept: Maximum teacher capacity reached for this school's current plan.");
          }
      }
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
