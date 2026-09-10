import prisma from "../../config/database";

/**
 * Checks if a teacher is authorized to access a specific student.
 * A teacher is authorized if the student is enrolled in ANY class
 * that the teacher is assigned to.
 */
export const canTeacherAccessStudent = async (teacherId: string, studentId: string): Promise<boolean> => {
  // Find classes the student is enrolled in
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      classes: {
        select: {
          classId: true
        }
      }
    }
  });

  if (!student || !student.classes || student.classes.length === 0) {
    return false;
  }

  const enrolledClassIds = student.classes.map(e => e.classId);

  // Check if the teacher is assigned to any of these classes
  const teacherClass = await prisma.classTeacher.findFirst({
    where: {
      teacherId,
      classId: { in: enrolledClassIds }
    }
  });

  return !!teacherClass;
};
