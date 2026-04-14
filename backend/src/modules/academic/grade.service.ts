import prisma from "../../config/database";

export const getStudentGradesService = async (studentId: string, page: number = 1, limit: number = 10) => {
  const now = new Date();
  const skip = (page - 1) * limit;
  
  const where: any = { 
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
      {
        examId: null
      }
    ]
  };

  const [data, total] = await Promise.all([
    prisma.grade.findMany({
      where,
      include: {
        exam: {
          include: {
            session: true,
          }
        },
        examAttempt: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.grade.count({ where })
  ]);

  return {
    grades: data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
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
