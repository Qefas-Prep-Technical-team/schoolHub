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
    include: { 
      exams: {
        include: { exam: true }
      } 
    },
  });

  if (!paper) return false;

  if (userType === UserRole.ADMIN) {
    // Check paper's own schoolId or if any linked exam belongs to admin's school
    const schoolId = paper.schoolId || paper.exams?.[0]?.exam?.schoolId;
    if (!schoolId) return false;
    
    const schoolAdmin = await prisma.schoolAdmin.findFirst({
      where: {
        adminId: userId,
        schoolId,
        active: true,
      },
    });
    return !!schoolAdmin;
  }

  if (userType === UserRole.TEACHER) {
    if (paper.teacherId === userId) return true;

    // Check if teacher can manage any of the exams this paper is linked to
    for (const link of paper.exams) {
      const allowed = await canManageExam({
        userId,
        userType,
        examId: link.examId,
      });
      if (allowed) return true;
    }

    return canTeacherManageSubject({
      teacherId: userId,
      subjectId: paper.subjectId as string,
      schoolId: paper.schoolId || paper.exams?.[0]?.exam?.schoolId || undefined,
    });
  }

  return false;
};
