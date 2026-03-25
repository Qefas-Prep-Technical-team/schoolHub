import prisma from "../config/database";
import { LinkEntityType, LinkType, LinkStatus, UserRole } from "@prisma/client";

export const hasActiveSchoolAccess = async ({
  userId,
  userType,
  schoolId,
}: {
  userId: string;
  userType: UserRole;
  schoolId: string;
}) => {
  if (userType === UserRole.ADMIN) {
    const schoolAdmin = await prisma.schoolAdmin.findFirst({
      where: {
        adminId: userId,
        schoolId,
        active: true,
      },
    });

    if (schoolAdmin) return true;
  }

  if (userType === UserRole.TEACHER) {
    const activeTeacherLink = await prisma.relationshipLink.findFirst({
      where: {
        linkType: LinkType.SCHOOL_TEACHER,
        status: LinkStatus.ACTIVE,
        schoolId,
        OR: [
          {
            leftEntityType: LinkEntityType.TEACHER,
            leftEntityId: userId,
          },
          {
            rightEntityType: LinkEntityType.TEACHER,
            rightEntityId: userId,
          },
        ],
      },
    });
    // console.log("Active teacher link found:", activeTeacherLink);

    if (activeTeacherLink) return true;
  }

  if (userType === UserRole.STUDENT) {
    const activeStudentLink = await prisma.relationshipLink.findFirst({
      where: {
        linkType: LinkType.SCHOOL_STUDENT,
        status: LinkStatus.ACTIVE,
        schoolId,
        OR: [
          {
            leftEntityType: LinkEntityType.STUDENT,
            leftEntityId: userId,
          },
          {
            rightEntityType: LinkEntityType.STUDENT,
            rightEntityId: userId,
          },
        ],
      },
    });

    if (activeStudentLink) return true;
  }

  return false;
};
