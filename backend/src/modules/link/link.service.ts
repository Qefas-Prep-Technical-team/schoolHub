// src/modules/link/link.service.ts
import prisma from "../../config/database";
import { LinkEntityType, LinkType, LinkRequestStatus } from "@prisma/client";

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
  SCHOOL_TEACHER: ["SCHOOL:TEACHER", "TEACHER:SCHOOL"],
  SCHOOL_STUDENT: ["SCHOOL:STUDENT", "STUDENT:SCHOOL"],
  TEACHER_STUDENT: ["TEACHER:STUDENT", "STUDENT:TEACHER"],
  PARENT_STUDENT: ["PARENT:STUDENT", "STUDENT:PARENT"],
  TEACHER_CLASS: ["TEACHER:CLASS", "CLASS:TEACHER"],
  STUDENT_CLASS: ["STUDENT:CLASS", "CLASS:STUDENT"],
};

export const findEntityByCode = async (code: string): Promise<FindEntityResult | null> => {
  const school = await prisma.school.findUnique({
    where: { schoolCode: code },
  });
  if (school) {
    return {
      type: LinkEntityType.SCHOOL,
      id: school.id,
      code: school.schoolCode,
      data: school,
    };
  }

  const admin = await prisma.admin.findUnique({
    where: { adminCode: code },
  });
  if (admin) {
    return {
      type: LinkEntityType.ADMIN,
      id: admin.id,
      code: admin.adminCode,
      data: admin,
    };
  }

  const teacher = await prisma.teacher.findUnique({
    where: { teacherCode: code },
  });
  if (teacher) {
    return {
      type: LinkEntityType.TEACHER,
      id: teacher.id,
      code: teacher.teacherCode,
      schoolId: teacher.schoolId,
      data: teacher,
    };
  }

  const student = await prisma.student.findUnique({
    where: { studentCode: code },
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

  const parent = await prisma.parent.findUnique({
    where: { parentCode: code },
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
        { classCode: code },
        { id: code }
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

  // Also support school lookup by ID
  const schoolById = await prisma.school.findUnique({
    where: { id: code },
  });
  if (schoolById) {
    return {
      type: LinkEntityType.SCHOOL,
      id: schoolById.id,
      code: schoolById.schoolCode,
      data: schoolById,
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
        schoolId: teacher.schoolId,
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

  const target = await findEntityByCode(targetCode);

  if (!target) {
    throw new Error("Target code is invalid");
  }

  if (requester.id === target.id && requester.type === target.type) {
    throw new Error("You cannot send a request to yourself");
  }

  if (!isAllowedLink(requester.type, target.type, linkType)) {
    throw new Error(
      `Invalid link combination: ${requester.type} cannot create ${linkType} request for ${target.type}`
    );
  }

  const existingActiveLink = await prisma.relationshipLink.findFirst({
    where: {
      linkType,
      status: "ACTIVE",
      OR: [
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

      requesterType: requester.type,
      requesterId: requester.id,
      requesterCode: requester.code,

      targetType: target.type,
      targetId: target.id,
      targetCode: target.code,

      note: note || null,
      schoolId: schoolId || requester.schoolId || target.schoolId || null,
      classId: classId || null,

      requesterSchoolId: requester.type === LinkEntityType.SCHOOL ? requester.id : null,
      targetSchoolId: target.type === LinkEntityType.SCHOOL ? target.id : null,

      requesterTeacherId: requester.type === LinkEntityType.TEACHER ? requester.id : null,
      targetTeacherId: target.type === LinkEntityType.TEACHER ? target.id : null,

      requesterStudentId: requester.type === LinkEntityType.STUDENT ? requester.id : null,
      targetStudentId: target.type === LinkEntityType.STUDENT ? target.id : null,

      requesterParentId: requester.type === LinkEntityType.PARENT ? requester.id : null,
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
    requester,
    target,
  };
};