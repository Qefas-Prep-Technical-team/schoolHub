import prisma from "../../config/database";
import { LinkEntityType } from "@prisma/client";
import { hasActiveSchoolLink } from "./academic.permissions";

export const assignTeacherToSubjectService = async ({
  adminId,
  teacherId,
  subjectId,
  schoolId,
}: {
  adminId: string;
  teacherId: string;
  subjectId: string;
  schoolId: string;
}) => {
  const allowed = await hasActiveSchoolLink({
    userId: adminId,
    userType: LinkEntityType.ADMIN,
    schoolId,
  });

  if (!allowed) {
    throw new Error("You are not linked to this school");
  }

  const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });

  if (!teacher) throw new Error("Teacher not found");
  if (!subject || subject.isArchived) throw new Error("Subject not found");

  if (subject.schoolId !== schoolId) {
    throw new Error("Subject does not belong to this school");
  }

  return prisma.teacherSubject.upsert({
    where: {
      teacherId_subjectId_schoolId: {
        teacherId,
        subjectId,
        schoolId,
      },
    },
    update: {},
    create: {
      teacherId,
      subjectId,
      schoolId,
    },
  });
};

export const getTeacherSubjectsService = async ({
  teacherId,
  schoolId,
}: {
  teacherId: string;
  schoolId?: string;
}) => {
  return prisma.teacherSubject.findMany({
    where: {
      teacherId,
      ...(schoolId ? { schoolId } : {}),
    },
    include: {
      subject: true,
      school: true,
      teacher: true,
    },
    orderBy: { createdAt: "desc" },
  });
};
