import prisma, { withRetry } from "../../../config/database";
import { createNotification } from "../../notification/notification.service";
import { resolveInitiatorIdentity } from "../../notification/services/notification-sender.util";

export interface TeacherAssignmentResult {
  status: number;
  body: {
    success: boolean;
    message: string;
    data?: unknown;
  };
}

export const assignTeacherToClassService = async (params: {
  inputId?: string;
  classId?: string;
  isLead?: boolean;
  initiatorUserId?: string;
  initiatorUserType?: string;
}): Promise<TeacherAssignmentResult> => {
  const { inputId, classId, isLead = false, initiatorUserId, initiatorUserType } = params;

  if (!classId) {
    return {
      status: 400,
      body: {
        success: false,
        message: "classId is required",
      },
    };
  }

  // Resolve real teacher ID if inputId is a teacherCode
  const teacher = await withRetry(
    () =>
      prisma.teacher.findFirst({
        where: {
          OR: [{ id: inputId }, { teacherCode: inputId }],
        },
        select: { id: true },
      }),
    "admin.teacherAssignment.findTeacherForClass",
  );

  if (!teacher) {
    return {
      status: 404,
      body: {
        success: false,
        message: "Teacher not found",
      },
    };
  }

  const teacherId = teacher.id;

  // Create the assignment
  const assignment = await withRetry(
    () =>
      prisma.classTeacher.upsert({
        where: {
          classId_teacherId: {
            classId,
            teacherId,
          },
        },
        update: { isLead },
        create: {
          classId,
          teacherId,
          isLead,
        },
      }),
    "admin.teacherAssignment.upsertClassTeacher",
  );

  const classRecord = await withRetry(
    () => prisma.class.findUnique({ where: { id: classId } }),
    "admin.teacherAssignment.findClass",
  );
  if (classRecord) {
    const initiator = await resolveInitiatorIdentity({
      userId: initiatorUserId,
      userType: initiatorUserType,
      schoolId: classRecord.schoolId,
    });
    const byLine = initiator
      ? ` by ${initiator.senderName} (${initiator.senderRole})`
      : "";

    await createNotification({
      recipientType: "TEACHER",
      recipientId: teacherId,
      senderType: initiator?.senderType || "ADMIN",
      senderId: initiator?.senderId,
      type: "ACADEMIC",
      title: "Class Assignment",
      message: `You have been assigned to class ${classRecord.name}${byLine}.`,
      link: `/dashboard/teacher/my-classes/${classRecord.id}`,
      meta: {
        classId: classRecord.id,
        className: classRecord.name,
        schoolId: classRecord.schoolId,
        ...(initiator
          ? {
              senderName: initiator.senderName,
              senderRole: initiator.senderRole,
              adminName: initiator.senderName,
            }
          : {}),
      },
    });
  }

  return {
    status: 200,
    body: {
      success: true,
      message: "Teacher assigned to class successfully",
      data: assignment,
    },
  };
};

export const assignTeacherToSubjectAdminService = async (params: {
  inputId?: string;
  subjectId?: string;
  initiatorUserId?: string;
  initiatorUserType?: string;
}): Promise<TeacherAssignmentResult> => {
  const { inputId, subjectId, initiatorUserId, initiatorUserType } = params;

  if (!subjectId) {
    return {
      status: 400,
      body: {
        success: false,
        message: "subjectId is required",
      },
    };
  }

  // Resolve real teacher ID if inputId is a teacherCode
  const teacher = await withRetry(
    () =>
      prisma.teacher.findFirst({
        where: {
          OR: [{ id: inputId }, { teacherCode: inputId }],
        },
        select: { id: true },
      }),
    "admin.teacherAssignment.findTeacherForSubject",
  );

  if (!teacher) {
    return {
      status: 404,
      body: {
        success: false,
        message: "Teacher not found",
      },
    };
  }
  const teacherId = teacher.id;

  // Verify subject exists
  const subject = await withRetry(
    () =>
      prisma.subject.findUnique({
        where: { id: subjectId },
      }),
    "admin.teacherAssignment.findSubject",
  );

  if (!subject || !subject.schoolId) {
    return {
      status: 404,
      body: {
        success: false,
        message: "Subject not found or has no school associated",
      },
    };
  }

  // Create the assignment
  const assignment = await withRetry(
    () =>
      prisma.teacherSubject.upsert({
        where: {
          teacherId_subjectId_schoolId: {
            teacherId,
            subjectId,
            schoolId: subject.schoolId!,
          },
        },
        update: {}, // If it already exists, do nothing
        create: {
          teacherId,
          subjectId,
          schoolId: subject.schoolId!,
        },
      }),
    "admin.teacherAssignment.upsertTeacherSubject",
  );

  const initiator = await resolveInitiatorIdentity({
    userId: initiatorUserId,
    userType: initiatorUserType,
    schoolId: subject.schoolId,
  });
  const byLine = initiator
    ? ` by ${initiator.senderName} (${initiator.senderRole})`
    : "";

  await createNotification({
    recipientType: "TEACHER",
    recipientId: teacherId,
    senderType: initiator?.senderType || "ADMIN",
    senderId: initiator?.senderId,
    type: "ACADEMIC",
    title: "Subject Assignment",
    message: `You have been assigned to teach ${subject.name}${byLine}.`,
    link: `/dashboard/teacher/subjects/${subject.id}`,
    meta: {
      subjectId: subject.id,
      subjectName: subject.name,
      schoolId: subject.schoolId,
      ...(initiator
        ? {
            senderName: initiator.senderName,
            senderRole: initiator.senderRole,
            adminName: initiator.senderName,
          }
        : {}),
    },
  });

  return {
    status: 200,
    body: {
      success: true,
      message: "Teacher assigned to subject successfully",
      data: assignment,
    },
  };
};

export const removeTeacherFromSubjectAdminService = async (params: {
  teacherId?: string;
  subjectId?: string;
  initiatorUserId?: string;
  initiatorUserType?: string;
}): Promise<TeacherAssignmentResult> => {
  const { teacherId, subjectId, initiatorUserId, initiatorUserType } = params;

  if (!teacherId || !subjectId) {
    return {
      status: 400,
      body: {
        success: false,
        message: "Teacher ID and Subject ID are required",
      },
    };
  }

  const subject = await withRetry(
    () =>
      prisma.subject.findUnique({
        where: { id: subjectId },
      }),
    "admin.teacherAssignment.findSubjectForRemove",
  );

  if (!subject) {
    return {
      status: 404,
      body: {
        success: false,
        message: "Subject not found",
      },
    };
  }

  // Try deleting from teacherSubject join table
  let deletedCount = 0;
  try {
    await withRetry(
      () =>
        prisma.teacherSubject.delete({
          where: {
            teacherId_subjectId_schoolId: {
              teacherId,
              subjectId,
              schoolId: subject.schoolId || "",
            },
          },
        }),
      "admin.teacherAssignment.deleteTeacherSubject",
    );
    deletedCount++;
  } catch {
    // Ignore if not found
  }

  // Also check if they are the primary teacher on the Subject model
  if (subject.teacherId === teacherId) {
    await withRetry(
      () =>
        prisma.subject.update({
          where: { id: subjectId },
          data: { teacherId: null },
        }),
      "admin.teacherAssignment.clearPrimarySubjectTeacher",
    );
    deletedCount++;
  }

  if (deletedCount === 0) {
    return {
      status: 404,
      body: {
        success: false,
        message: "Teacher was not assigned to this subject",
      },
    };
  }

  const initiator = await resolveInitiatorIdentity({
    userId: initiatorUserId,
    userType: initiatorUserType,
    schoolId: subject.schoolId,
  });
  const byLine = initiator
    ? ` by ${initiator.senderName} (${initiator.senderRole})`
    : "";

  await createNotification({
    recipientType: "TEACHER",
    recipientId: teacherId,
    senderType: initiator?.senderType || "ADMIN",
    senderId: initiator?.senderId,
    type: "ACADEMIC",
    title: "Subject Unassigned",
    message: `You have been unassigned from teaching ${subject.name}${byLine}.`,
    meta: {
      subjectId: subject.id,
      subjectName: subject.name,
      schoolId: subject.schoolId,
      ...(initiator
        ? {
            senderName: initiator.senderName,
            senderRole: initiator.senderRole,
            adminName: initiator.senderName,
          }
        : {}),
    },
  });

  return {
    status: 200,
    body: {
      success: true,
      message: "Teacher removed from subject successfully",
    },
  };
};

export const removeTeacherFromClassAdminService = async (params: {
  teacherId?: string;
  classId?: string;
  initiatorUserId?: string;
  initiatorUserType?: string;
}): Promise<TeacherAssignmentResult> => {
  const { teacherId, classId, initiatorUserId, initiatorUserType } = params;

  if (!teacherId || !classId) {
    return {
      status: 400,
      body: {
        success: false,
        message: "Teacher ID and Class ID are required",
      },
    };
  }

  const classRecord = await withRetry(
    () =>
      prisma.class.findUnique({
        where: { id: classId },
      }),
    "admin.teacherAssignment.findClassForRemove",
  );

  if (!classRecord) {
    return {
      status: 404,
      body: {
        success: false,
        message: "Class not found",
      },
    };
  }

  try {
    await withRetry(
      () =>
        prisma.classTeacher.delete({
          where: {
            classId_teacherId: {
              classId,
              teacherId,
            },
          },
        }),
      "admin.teacherAssignment.deleteClassTeacher",
    );
  } catch {
    return {
      status: 404,
      body: {
        success: false,
        message: "Teacher was not assigned to this class",
      },
    };
  }

  const initiator = await resolveInitiatorIdentity({
    userId: initiatorUserId,
    userType: initiatorUserType,
    schoolId: classRecord.schoolId,
  });
  const byLine = initiator
    ? ` by ${initiator.senderName} (${initiator.senderRole})`
    : "";

  await createNotification({
    recipientType: "TEACHER",
    recipientId: teacherId,
    senderType: initiator?.senderType || "ADMIN",
    senderId: initiator?.senderId,
    type: "ACADEMIC",
    title: "Class Unassigned",
    message: `You have been unassigned from class ${classRecord.name}${byLine}.`,
    meta: {
      classId: classRecord.id,
      className: classRecord.name,
      schoolId: classRecord.schoolId,
      ...(initiator
        ? {
            senderName: initiator.senderName,
            senderRole: initiator.senderRole,
            adminName: initiator.senderName,
          }
        : {}),
    },
  });

  return {
    status: 200,
    body: {
      success: true,
      message: "Teacher removed from class successfully",
    },
  };
};
