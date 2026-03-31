import prisma from "../../config/database";
import { UserRole } from "@prisma/client";
import { canTeacherManageSubject } from "../academic/teacher-subject.permissions";
import { canManageClass, canManageDepartment } from "../academic/academic.permissions";

export const canManageExam = async ({
  userId,
  userType,
  examId,
}: {
  userId: string;
  userType: UserRole;
  examId: string;
}) => {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
  });

  if (!exam) return false;

  if (userType === UserRole.ADMIN) {
    if (!exam.schoolId) return false;
    const schoolAdmin = await prisma.schoolAdmin.findFirst({
      where: {
        adminId: userId,
        schoolId: exam.schoolId,
        active: true,
      },
    });
    return !!schoolAdmin;
  }

  if (userType === UserRole.TEACHER) {
    if (exam.classId) {
      if (await canManageClass({ userId, userType, classId: exam.classId })) {
        return true;
      }
    }

    // Check if user can manage any of the departments this exam belongs to
    const examDepartments = await prisma.examDepartment.findMany({
      where: { examId }
    });

    for (const ed of examDepartments) {
      if (await canManageDepartment({ userId, userType, departmentId: ed.departmentId })) {
        return true;
      }
    }

    return false;
  }

  return false;
};

export const canManageSubjectPaper = async ({
  userId,
  userType,
  subjectPaperId,
}: {
  userId: string;
  userType: UserRole;
  subjectPaperId: string;
}) => {
  const paper = await prisma.subjectExamPaper.findUnique({
    where: { id: subjectPaperId },
    include: { exam: true },
  });

  if (!paper) return false;

  if (userType === UserRole.ADMIN) {
    if (!paper.exam || !paper.exam.schoolId) return false;
    const schoolAdmin = await prisma.schoolAdmin.findFirst({
      where: {
        adminId: userId,
        schoolId: paper.exam.schoolId,
        active: true,
      },
    });
    return !!schoolAdmin;
  }

  if (userType === UserRole.TEACHER) {
    if (paper.teacherId === userId) return true;

    return canTeacherManageSubject({
      teacherId: userId,
      subjectId: paper.subjectId as string,
      schoolId: paper.exam?.schoolId || undefined,
    });
  }

  return false;
};
