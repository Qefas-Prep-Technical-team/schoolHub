import prisma from "../../config/database";
import {
  AcademicOwnershipScope,
  LinkEntityType,
  LinkType,
  UserRole,
} from "@prisma/client";

export const hasActiveSchoolLink = async ({
  userId,
  userType,
  schoolId,
}: {
  userId: string;
  userType: LinkEntityType;
  schoolId: string;
}) => {
  const allowedLinkTypes: LinkType[] = [];

  if (userType === LinkEntityType.TEACHER) {
    allowedLinkTypes.push(LinkType.SCHOOL_TEACHER);
  }

  if (userType === LinkEntityType.STUDENT) {
    allowedLinkTypes.push(LinkType.SCHOOL_STUDENT);
  }

  if (userType === LinkEntityType.ADMIN) {
    const schoolAdmin = await prisma.schoolAdmin.findFirst({
      where: { adminId: userId, schoolId, active: true },
    });
    if (schoolAdmin) return true;

    allowedLinkTypes.push(LinkType.SCHOOL_ADMIN);
  }

  if (!allowedLinkTypes.length) return false;

  const link = await prisma.relationshipLink.findFirst({
    where: {
      status: "ACTIVE",
      schoolId,
      linkType: { in: allowedLinkTypes },
      OR: [
        {
          leftEntityType: userType,
          leftEntityId: userId,
          rightEntityType: LinkEntityType.SCHOOL,
          rightEntityId: schoolId,
        },
        {
          rightEntityType: userType,
          rightEntityId: userId,
          leftEntityType: LinkEntityType.SCHOOL,
          leftEntityId: schoolId,
        },
      ],
    },
  });

  return !!link;
};

export const canManageSubject = async ({
  userId,
  userType,
  subjectId,
}: {
  userId: string;
  userType: UserRole;
  subjectId: string;
}) => {
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
  });

  if (!subject || subject.isArchived) return false;

  if (userType === UserRole.ADMIN) {
    if (
      subject.scope !== AcademicOwnershipScope.SCHOOL ||
      !subject.schoolId
    ) {
      return false;
    }

    return hasActiveSchoolLink({
      userId,
      userType: LinkEntityType.ADMIN,
      schoolId: subject.schoolId,
    });
  }

  if (userType === UserRole.TEACHER) {
    if (
      subject.scope === AcademicOwnershipScope.PERSONAL &&
      subject.teacherId === userId
    ) {
      return true;
    }

    if (
      subject.scope === AcademicOwnershipScope.SCHOOL &&
      subject.schoolId
    ) {
      return hasActiveSchoolLink({
        userId,
        userType: LinkEntityType.TEACHER,
        schoolId: subject.schoolId,
      });
    }
  }

  return false;
};

export const canManageDepartment = async ({
  userId,
  userType,
  departmentId,
}: {
  userId: string;
  userType: UserRole;
  departmentId: string;
}) => {
  const department = await prisma.department.findUnique({
    where: { id: departmentId },
  });

  if (!department || department.isArchived) return false;

  if (userType === UserRole.ADMIN) {
    if (
      department.scope !== AcademicOwnershipScope.SCHOOL ||
      !department.schoolId
    ) {
      return false;
    }

    return hasActiveSchoolLink({
      userId,
      userType: LinkEntityType.ADMIN,
      schoolId: department.schoolId,
    });
  }

  if (userType === UserRole.TEACHER) {
    if (
      department.scope === AcademicOwnershipScope.PERSONAL &&
      department.teacherId === userId
    ) {
      return true;
    }

    if (
      department.scope === AcademicOwnershipScope.SCHOOL &&
      department.schoolId
    ) {
      return hasActiveSchoolLink({
        userId,
        userType: LinkEntityType.TEACHER,
        schoolId: department.schoolId,
      });
    }
  }

  return false;
};

export const canManageClass = async ({
  userId,
  userType,
  classId,
}: {
  userId: string;
  userType: UserRole;
  classId: string;
}) => {
  const foundClass = await prisma.class.findUnique({
    where: { id: classId },
  });

  if (!foundClass) return false;

  if (userType === UserRole.ADMIN) {
    if (!foundClass.schoolId) return false;

    return hasActiveSchoolLink({
      userId,
      userType: LinkEntityType.ADMIN,
      schoolId: foundClass.schoolId,
    });
  }

  if (userType === UserRole.TEACHER) {
    return foundClass.teacherId === userId;
  }

  return false;
};
