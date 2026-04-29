import prisma from "../config/database";
import { UserRole } from "@prisma/client";

export const updateCurrentSchoolContext = async ({
  userId,
  userType,
  schoolId,
}: {
  userId: string;
  userType: UserRole;
  schoolId: string;
}) => {
  if (userType === UserRole.TEACHER) {
    await prisma.teacher.update({
      where: { id: userId },
      data: {
<<<<<<< HEAD
        activeSchoolId: schoolId,
=======
        activeSchoolId: schoolId, // temporary: use as current/default school context
>>>>>>> be22764e1e3563322c0acc4c834adbfe0d64c76e
      },
    });
  }

  if (userType === UserRole.STUDENT) {
    await prisma.student.update({
      where: { id: userId },
      data: {
        schoolId,
      },
    });
  }

  if (userType === UserRole.ADMIN) {
    // optional if admins also need current school context
  }
};
