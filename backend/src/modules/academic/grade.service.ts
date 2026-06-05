import prisma from "../../config/database";

export const getStudentGradesService = async (studentId: string, page: number = 1, limit: number = 10, assessmentType?: string | string[]) => {
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

  if (assessmentType) {
    if (Array.isArray(assessmentType)) {
      where.assessmentType = { in: assessmentType };
    } else {
      where.assessmentType = assessmentType;
    }
  }

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
          subjectExamAttempts: {
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

export const getClassLeaderboardService = async (classId: string) => {
  const grades = await prisma.grade.groupBy({
    by: ['studentId'],
    where: { classId },
    _sum: {
      score: true,
      maxMarks: true,
    },
  });

  const leaderboard = grades
    .map(g => {
      const score = g._sum.score || 0;
      const maxMarks = g._sum.maxMarks || 1;
      return (score / maxMarks) * 100;
    })
    .sort((a, b) => b - a)
    .slice(0, 5)
    .map(percent => percent.toFixed(1));

  return leaderboard;
};
