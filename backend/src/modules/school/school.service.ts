import { LinkEntityType, LinkStatus, LinkType } from "@prisma/client";
import prisma from "../../config/database";

/**
 * Fetch all teachers linked to a school via active RelationshipLinks
 * @param schoolId The ID of the school
 */
export const getSchoolTeachersService = async (schoolId: string) => {
  // Find active school-teacher links from RelationshipLink
  const links = await prisma.relationshipLink.findMany({
    where: {
      linkType: LinkType.SCHOOL_TEACHER,
      status: LinkStatus.ACTIVE,
      OR: [
        {
          leftEntityType: LinkEntityType.SCHOOL,
          leftEntityId: schoolId,
          rightEntityType: LinkEntityType.TEACHER,
        },
        {
          rightEntityType: LinkEntityType.SCHOOL,
          rightEntityId: schoolId,
          leftEntityType: LinkEntityType.TEACHER,
        },
      ],
    },
  });

  const linkedTeacherIds = links.map((link) => 
    link.leftEntityType === LinkEntityType.TEACHER ? link.leftEntityId : link.rightEntityId
  );

  // We also check for teachers who have a direct schoolId record
  return prisma.teacher.findMany({
    where: {
      OR: [
        { id: { in: linkedTeacherIds } },
        { schoolId: schoolId },
        { currentSchoolId: schoolId }
      ]
    },
    select: {
      id: true,
      name: true,
      email: true,
      teacherCode: true,
      authProvider: true,
      verified: true,
      role: true,
      gender: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

/**
 * Fetch all students linked to a school via active RelationshipLinks or direct schoolId
 * @param schoolId The ID of the school
 */
export const getSchoolStudentsService = async (
  schoolId: string,
  filters: { classId?: string; gender?: any; verified?: boolean; search?: string } = {}
) => {
  // Find active school-student links from RelationshipLink
  const links = await prisma.relationshipLink.findMany({
    where: {
      linkType: LinkType.SCHOOL_STUDENT,
      status: LinkStatus.ACTIVE,
      OR: [
        {
          leftEntityType: LinkEntityType.SCHOOL,
          leftEntityId: schoolId,
          rightEntityType: LinkEntityType.STUDENT,
        },
        {
          rightEntityType: LinkEntityType.SCHOOL,
          rightEntityId: schoolId,
          leftEntityType: LinkEntityType.STUDENT,
        },
      ],
    },
  });

  const linkedStudentIds = links.map((link) => 
    link.leftEntityType === LinkEntityType.STUDENT ? link.leftEntityId : link.rightEntityId
  );

  const where: any = {
    AND: [
      {
        OR: [
          { id: { in: linkedStudentIds } },
          { schoolId: schoolId },
          { originalSchoolId: schoolId }
        ]
      }
    ]
  };

  if (filters.classId) {
    where.AND.push({
      classes: {
        some: {
          classId: filters.classId
        }
      }
    });
  }

  if (filters.gender) {
    where.AND.push({ gender: filters.gender });
  }

  if (filters.verified !== undefined) {
    where.AND.push({ verified: filters.verified });
  }

  if (filters.search) {
    where.AND.push({
      OR: [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { studentCode: { contains: filters.search, mode: 'insensitive' } },
      ]
    });
  }

  // Also include students with direct schoolId or originalSchoolId
  return prisma.student.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      studentCode: true,
      authProvider: true,
      verified: true,
      role: true,
      gender: true,
      classes: {
        include: {
          class: true,
        },
      },
      department: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};
