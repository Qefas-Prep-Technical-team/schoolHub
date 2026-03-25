import prisma from "../../config/database";
import { AcademicOwnershipScope } from "@prisma/client";

export const canTeacherManageSubject = async ({
  teacherId,
  subjectId,
  schoolId,
}: {
  teacherId: string;
  subjectId: string;
  schoolId?: string;
}) => {
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
  });

  if (!subject || subject.isArchived) return false;

  if (
    subject.scope === AcademicOwnershipScope.PERSONAL &&
    subject.teacherId === teacherId
  ) {
    return true;
  }

  const assignment = await prisma.teacherSubject.findFirst({
    where: {
      teacherId,
      subjectId,
      ...(schoolId ? { schoolId } : {}),
    },
  });

  return !!assignment;
};
