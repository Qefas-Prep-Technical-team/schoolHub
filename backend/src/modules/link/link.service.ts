// src/modules/link/link.service.ts
import prisma from "../../config/database";
import { LinkEntityType, LinkType, LinkRequestStatus } from "@prisma/client";
import { checkLinkCapacity, isTeacherHubEnabled, canSchoolAcceptTeacher } from "../payment/subscription.utils";

type FindEntityResult = {
  type: LinkEntityType;
  id: string;
  code: string;
  schoolId?: string | null;
  classId?: string | null;
  data: any;
};

type CreateLinkRequestInput = {
  requesterType: LinkEntityType;
  requesterId: string;
  targetCode: string;
  linkType: LinkType;
  note?: string;
  schoolId?: string;
  classId?: string;
};

const allowedPairs: Record<LinkType, string[]> = {
  SCHOOL_ADMIN: ["SCHOOL:ADMIN", "ADMIN:SCHOOL"],
  SCHOOL_TEACHER: ["SCHOOL:TEACHER", "TEACHER:SCHOOL", "ADMIN:TEACHER", "TEACHER:ADMIN"],
  SCHOOL_STUDENT: ["SCHOOL:STUDENT", "STUDENT:SCHOOL", "ADMIN:STUDENT", "STUDENT:ADMIN", "TEACHER:STUDENT", "STUDENT:TEACHER"],
  TEACHER_STUDENT: ["TEACHER:STUDENT", "STUDENT:TEACHER"],
  PARENT_STUDENT: ["PARENT:STUDENT", "STUDENT:PARENT"],
  TEACHER_CLASS: ["TEACHER:CLASS", "CLASS:TEACHER"],
  STUDENT_CLASS: ["STUDENT:CLASS", "CLASS:STUDENT", "TEACHER:STUDENT", "STUDENT:TEACHER"],
};

export const findEntityByCode = async (code: string): Promise<FindEntityResult | null> => {
  const trimmed = code.trim();
  const variants = Array.from(new Set([trimmed, trimmed.toLowerCase(), trimmed.toUpperCase()]));

  const school = await prisma.school.findFirst({
    where: {
      OR: [
        { schoolCode: { in: variants } },
        { id: trimmed },
      ],
    },
  });
  if (school) {
    return {
      type: LinkEntityType.SCHOOL,
      id: school.id,
      code: school.schoolCode,
      data: school,
    };
  }

  const admin = await prisma.admin.findFirst({
    where: {
      OR: [
        { adminCode: { in: variants } },
        { id: trimmed },
      ],
    },
  });
  if (admin) {
    return {
      type: LinkEntityType.ADMIN,
      id: admin.id,
      code: admin.adminCode,
      data: admin,
    };
  }

  const teacher = await prisma.teacher.findFirst({
    where: {
      OR: [
        { teacherCode: { in: variants } },
        { id: trimmed },
        { email: { in: variants } },
      ],
    },
  });
  if (teacher) {
    return {
      type: LinkEntityType.TEACHER,
      id: teacher.id,
      code: teacher.teacherCode,
      schoolId: teacher.activeSchoolId,
      data: teacher,
    };
  }

  const student = await prisma.student.findFirst({
    where: {
      OR: [
        { studentCode: { in: variants } },
        { id: trimmed },
        { email: { in: variants } },
      ],
    },
  });
  if (student) {
    return {
      type: LinkEntityType.STUDENT,
      id: student.id,
      code: student.studentCode,
      schoolId: student.schoolId,
      data: student,
    };
  }

  const parent = await prisma.parent.findFirst({
    where: {
      OR: [
        { parentCode: { in: variants } },
        { id: trimmed },
      ],
    },
  });
  if (parent) {
    return {
      type: LinkEntityType.PARENT,
      id: parent.id,
      code: parent.parentCode,
      data: parent,
    };
  }

  const foundClass = await prisma.class.findFirst({
    where: { 
      OR: [
        { classCode: { in: variants } },
        { id: trimmed }
      ]
    },
  });
  if (foundClass) {
    return {
      type: LinkEntityType.CLASS,
      id: foundClass.id,
      code: foundClass.classCode,
      schoolId: foundClass.schoolId,
      classId: foundClass.id,
      data: foundClass,
    };
  }

  return null;
};

export const getRequesterByType = async (
  requesterType: LinkEntityType,
  requesterId: string
): Promise<FindEntityResult | null> => {
  switch (requesterType) {
    case LinkEntityType.ADMIN: {
      const admin = await prisma.admin.findUnique({
        where: { id: requesterId },
      });
      if (!admin) return null;
      return {
        type: LinkEntityType.ADMIN,
        id: admin.id,
        code: admin.adminCode,
        data: admin,
      };
    }

    case LinkEntityType.TEACHER: {
      const teacher = await prisma.teacher.findUnique({
        where: { id: requesterId },
      });
      if (!teacher) return null;
      return {
        type: LinkEntityType.TEACHER,
        id: teacher.id,
        code: teacher.teacherCode,
        schoolId: teacher.activeSchoolId,
        data: teacher,
      };
    }

    case LinkEntityType.STUDENT: {
      const student = await prisma.student.findUnique({
        where: { id: requesterId },
      });
      if (!student) return null;
      return {
        type: LinkEntityType.STUDENT,
        id: student.id,
        code: student.studentCode,
        schoolId: student.schoolId,
        data: student,
      };
    }

    case LinkEntityType.PARENT: {
      const parent = await prisma.parent.findUnique({
        where: { id: requesterId },
      });
      if (!parent) return null;
      return {
        type: LinkEntityType.PARENT,
        id: parent.id,
        code: parent.parentCode,
        data: parent,
      };
    }

    default:
      return null;
  }
};

export const isAllowedLink = (
  requesterType: LinkEntityType,
  targetType: LinkEntityType,
  linkType: LinkType
) => {
  const pair = `${requesterType}:${targetType}`;
  return allowedPairs[linkType]?.includes(pair) ?? false;
};

export const createLinkRequestService = async ({
  requesterType,
  requesterId,
  targetCode,
  linkType,
  note,
  schoolId,
  classId,
}: CreateLinkRequestInput) => {
  const requester = await getRequesterByType(requesterType, requesterId);

  if (!requester) {
    throw new Error("Requester not found");
  }

  let effectiveRequester = requester;
  if (
    requester.type === LinkEntityType.ADMIN &&
    (linkType === LinkType.SCHOOL_STUDENT || linkType === LinkType.SCHOOL_TEACHER || linkType === LinkType.SCHOOL_ADMIN)
  ) {
    const schoolAdmin = await prisma.schoolAdmin.findFirst({
      where: { adminId: requester.id, active: true },
      include: { school: true },
    });
    if (schoolAdmin && schoolAdmin.school) {
      effectiveRequester = {
        type: LinkEntityType.SCHOOL,
        id: schoolAdmin.school.id,
        code: schoolAdmin.school.schoolCode,
        schoolId: schoolAdmin.school.id,
        data: schoolAdmin.school,
      };
    }
  } else if (
    requester.type === LinkEntityType.TEACHER &&
    (linkType === LinkType.SCHOOL_STUDENT || linkType === LinkType.SCHOOL_TEACHER)
  ) {
    const teacherData = requester.data as { activeSchoolId?: string; primarySchoolId?: string } | undefined;
    const teacherSchoolId = schoolId || requester.schoolId || teacherData?.activeSchoolId || teacherData?.primarySchoolId;
    if (teacherSchoolId && linkType === LinkType.SCHOOL_STUDENT) {
      const school = await prisma.school.findUnique({
        where: { id: teacherSchoolId },
      });
      if (school) {
        effectiveRequester = {
          type: LinkEntityType.SCHOOL,
          id: school.id,
          code: school.schoolCode,
          schoolId: school.id,
          data: school,
        };
      }
    }
  }

  const target = await findEntityByCode(targetCode);

  if (!target) {
    throw new Error("Target code is invalid");
  }

  if (
    (requester.id === target.id && requester.type === target.type) ||
    (effectiveRequester.id === target.id && effectiveRequester.type === target.type)
  ) {
    throw new Error("You cannot send a request to yourself");
  }

  const isAllowed =
    isAllowedLink(effectiveRequester.type, target.type, linkType) ||
    isAllowedLink(requester.type, target.type, linkType);

  if (!isAllowed) {
    throw new Error(
      `Invalid link combination: ${requester.type} cannot create ${linkType} request for ${target.type}`
    );
  }

  // Capacity & Feature Checks

  // 1. Check if Teacher Hub is enabled globally
  const isTeacherRelated = linkType === 'SCHOOL_TEACHER' || linkType === 'TEACHER_CLASS' || linkType === 'TEACHER_STUDENT';
  if (isTeacherRelated) {
      const isEnabled = await isTeacherHubEnabled();
      if (!isEnabled) {
          throw new Error("The Teacher Hub and linking features are currently disabled by the platform.");
      }
  }

  // 2. Student Capacity Check
  if (linkType === 'SCHOOL_STUDENT' || linkType === 'TEACHER_STUDENT' || linkType === 'PARENT_STUDENT') {
      const capacityTargetId = (linkType === 'SCHOOL_STUDENT' && target.type === 'SCHOOL') ? target.id : 
                               (linkType === 'SCHOOL_STUDENT' && effectiveRequester.type === 'SCHOOL') ? effectiveRequester.id :
                               (linkType === 'TEACHER_STUDENT' && target.type === 'TEACHER') ? target.id :
                               (linkType === 'PARENT_STUDENT' && target.type === 'PARENT') ? target.id : null;
      
      const capacityEntityType = linkType === 'SCHOOL_STUDENT' ? 'SCHOOL' : target.type;

      if (capacityTargetId) {
          const hasSpace = await checkLinkCapacity(capacityTargetId, capacityEntityType as any);
          if (!hasSpace) {
              throw new Error(`The target ${capacityEntityType.toLowerCase()} has reached its student capacity for their current plan.`);
          }
      }
  }

  // 3. Teacher Capacity Check (for schools)
  if (linkType === 'SCHOOL_TEACHER') {
      const schoolTargetId = target.type === 'SCHOOL' ? target.id : (effectiveRequester.schoolId || requester.schoolId);
      if (schoolTargetId) {
          const hasSpace = await canSchoolAcceptTeacher(schoolTargetId);
          if (!hasSpace) {
              throw new Error("This school has reached its maximum teacher capacity for its current subscription plan.");
          }
      }

      // Check teacher's own linking capacity
      const teacherId = effectiveRequester.type === LinkEntityType.TEACHER ? effectiveRequester.id : (target.type === LinkEntityType.TEACHER ? target.id : null);
      if (teacherId) {
          const hasTeacherSpace = await (require("../payment/subscription.utils")).canTeacherLinkToSchool(teacherId);
          if (!hasTeacherSpace) {
              throw new Error("You have reached your limit for institutional connections on your current plan.");
          }
      }
  }

  const existingActiveLink = await prisma.relationshipLink.findFirst({
    where: {
      linkType,
      status: "ACTIVE",
      OR: [
        {
          leftEntityType: effectiveRequester.type,
          leftEntityId: effectiveRequester.id,
          rightEntityType: target.type,
          rightEntityId: target.id,
        },
        {
          leftEntityType: target.type,
          leftEntityId: target.id,
          rightEntityType: effectiveRequester.type,
          rightEntityId: effectiveRequester.id,
        },
        {
          leftEntityType: requester.type,
          leftEntityId: requester.id,
          rightEntityType: target.type,
          rightEntityId: target.id,
        },
        {
          leftEntityType: target.type,
          leftEntityId: target.id,
          rightEntityType: requester.type,
          rightEntityId: requester.id,
        },
      ],
    },
  });

  if (existingActiveLink) {
    throw new Error("An active relationship already exists between these users");
  }

  const existingPendingRequest = await prisma.linkRequest.findFirst({
    where: {
      linkType,
      status: LinkRequestStatus.PENDING,
      OR: [
        {
          requesterType: effectiveRequester.type,
          requesterId: effectiveRequester.id,
          targetType: target.type,
          targetId: target.id,
        },
        {
          requesterType: target.type,
          requesterId: target.id,
          targetType: effectiveRequester.type,
          targetId: effectiveRequester.id,
        },
        {
          requesterType: requester.type,
          requesterId: requester.id,
          targetType: target.type,
          targetId: target.id,
        },
        {
          requesterType: target.type,
          requesterId: target.id,
          targetType: requester.type,
          targetId: requester.id,
        },
      ],
    },
  });

  if (existingPendingRequest) {
    throw new Error("A pending request already exists between these users");
  }

  const linkRequest = await prisma.linkRequest.create({
    data: {
      linkType,
      status: LinkRequestStatus.PENDING,

      requesterType: effectiveRequester.type,
      requesterId: effectiveRequester.id,
      requesterCode: effectiveRequester.code,

      targetType: target.type,
      targetId: target.id,
      targetCode: target.code,

      note: note || null,
      schoolId: schoolId || effectiveRequester.schoolId || target.schoolId || null,
      classId: classId || target.classId || null,

      requesterSchoolId: effectiveRequester.type === LinkEntityType.SCHOOL ? effectiveRequester.id : null,
      targetSchoolId: target.type === LinkEntityType.SCHOOL ? target.id : null,

      requesterTeacherId: effectiveRequester.type === LinkEntityType.TEACHER ? effectiveRequester.id : null,
      targetTeacherId: target.type === LinkEntityType.TEACHER ? target.id : null,

      requesterStudentId: effectiveRequester.type === LinkEntityType.STUDENT ? effectiveRequester.id : null,
      targetStudentId: target.type === LinkEntityType.STUDENT ? target.id : null,

      requesterParentId: effectiveRequester.type === LinkEntityType.PARENT ? effectiveRequester.id : null,
      targetParentId: target.type === LinkEntityType.PARENT ? target.id : null,

      requestedByAdminId: requester.type === LinkEntityType.ADMIN ? requester.id : null,
    },
    include: {
      requesterTeacher: true,
      targetTeacher: true,
      requesterStudent: true,
      targetStudent: true,
      requesterParent: true,
      targetParent: true,
      requesterSchool: true,
      targetSchool: true,
    },
  });

  return {
    request: linkRequest,
    requester: effectiveRequester,
    target,
  };
};