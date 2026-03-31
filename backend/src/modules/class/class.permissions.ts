import prisma from "../../config/database";
import { UserRole } from "@prisma/client";

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

    const schoolAdmin = await prisma.schoolAdmin.findFirst({
      where: {
        adminId: userId,
        schoolId: foundClass.schoolId,
        active: true,
      },
    });

    return !!schoolAdmin;
  }

  if (userType === UserRole.TEACHER) {
    // Check if user is one of the teachers for this class
    const classTeacher = await prisma.classTeacher.findUnique({
      where: {
        classId_teacherId: {
          classId,
          teacherId: userId
        }
      }
    });
    return !!classTeacher;
  }

  return false;
};
