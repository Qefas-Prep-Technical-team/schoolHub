import prisma from "../../config/database";

export const getStudentGradesService = async (studentId: string) => {
  const now = new Date();
  
  return prisma.grade.findMany({
    where: { 
      studentId,
      OR: [
        {
          exam: {
            OR: [
              { allowImmediateResult: true },
              { resultReleaseAt: null },
              { resultReleaseAt: { lte: now } }
            ]
          }
        },
        // If it's a direct grade (no tied exam), it should always be visible
        {
          examId: null
        }
      ]
    },
    include: {
      exam: {
        include: {
          session: true,
        }
      },
      examAttempt: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getGradeByIdService = async (id: string) => {
  return prisma.grade.findUnique({
    where: { id },
    include: {
      exam: true,
      examAttempt: {
        include: {
          subjectAttempts: {
            include: {
              subjectPaper: {
                include: {
                  subject: true,
                }
              }
            }
          }
        }
      },
    },
  });
};

export const getAllGradesService = async ({
  schoolId,
  classId,
  subject,
}: {
  schoolId: string;
  classId?: string;
  subject?: string;
}) => {
  return prisma.grade.findMany({
    where: {
      schoolId,
      classId,
      subject,
      examId: null, // Only standalone grades
    },
    include: {
      student: true,
      class: true,
    },
    orderBy: { createdAt: "desc" },
  });
};
