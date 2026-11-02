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
        examId: null,
        status: "PUBLISHED"
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
        class: true,
        subjectPaper: true,
        examAttempt: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.grade.count({ where })
  ]);

  // Enrich assignment titles if remarks is empty
  const enrichedGrades = await Promise.all(
    data.map(async (grade) => {
      if (
        (grade.assessmentType?.toUpperCase() === "ASSIGNMENT" || grade.id.startsWith("grade-assignment-")) &&
        (!grade.remarks || !grade.remarks.trim())
      ) {
        const submissionId = grade.id.replace("grade-assignment-", "");
        try {
          const sub = await prisma.assignmentSubmission.findUnique({
            where: { id: submissionId },
            include: { assignment: { select: { title: true } } },
          });
          if (sub?.assignment?.title) {
            return { ...grade, remarks: sub.assignment.title };
          }
        } catch {
          // ignore error
        }
      }
      // If grade has a future release date or is unpublished draft, mask the score until that release timestamp
      if ((grade.releaseDate && new Date(grade.releaseDate) > now) || grade.status === "DRAFT") {
        return {
          ...grade,
          score: null,
          remarks: "Assessment recorded. Scores are scheduled to unlock on the release date.",
          status: "SCHEDULED" as any
        };
      }
      return grade;
    })
  );

  return {
    grades: enrichedGrades,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getGradeByIdService = async (id: string) => {
  const grade = await prisma.grade.findUnique({
    where: { id },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          studentCode: true,
          gender: true,
          gradeLevel: true,
          profileImage: true,
        },
      },
      class: {
        select: {
          id: true,
          name: true,
          section: true,
        },
      },
      teacher: {
        select: {
          id: true,
          name: true,
        },
      },
      session: {
        select: {
          id: true,
          name: true,
        },
      },
      exam: true,
      subjectPaper: true,
      examAttempt: {
        include: {
          subjectExamAttempts: {
            include: {
              subjectPaper: {
                include: {
                  subject: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!grade) {
    // If not found and ID begins with grade-sa- or matches a subject exam attempt ID
    const saId = id.startsWith('grade-sa-') ? id.replace('grade-sa-', '') : id;
    const sa = await prisma.subjectExamAttempt.findUnique({
      where: { id: saId },
      include: {
        examAttempt: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                studentCode: true,
                gender: true,
                gradeLevel: true,
                profileImage: true,
              },
            },
            exam: {
              include: {
                class: {
                  select: {
                    id: true,
                    name: true,
                    section: true,
                  },
                },
                teacher: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                session: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        subjectPaper: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (sa) {
      const now = new Date();
      const exam = sa.examAttempt?.exam;
      const isExamLocked = exam && (!exam.allowImmediateResult && exam.resultReleaseAt && new Date(exam.resultReleaseAt) > now);

      return {
        id,
        studentId: sa.examAttempt.studentId,
        student: sa.examAttempt.student,
        schoolId: sa.examAttempt.exam.schoolId,
        teacherId: sa.subjectPaper.teacherId || sa.examAttempt.exam.teacherId,
        teacher: sa.examAttempt.exam.teacher,
        classId: sa.examAttempt.exam.classId,
        class: sa.examAttempt.exam.class,
        subject: sa.subjectPaper?.subject?.name || 'Subject Paper',
        assessmentType: sa.examAttempt.exam.category || 'EXAM',
        score: isExamLocked ? null : sa.score,
        maxMarks: sa.totalMarks || 100,
        remarks: isExamLocked ? "Scores are scheduled to unlock on the release date." : `Subject results for ${sa.examAttempt.exam.title}`,
        status: isExamLocked ? ("SCHEDULED" as any) : (sa.examAttempt.status === 'SUBMITTED' ? 'PUBLISHED' : 'DRAFT'),
        releaseDate: exam?.resultReleaseAt || null,
        examId: sa.examAttempt.examId,
        exam: sa.examAttempt.exam,
        subjectPaperId: sa.subjectPaperId,
        subjectPaper: sa.subjectPaper,
        examAttemptId: sa.examAttemptId,
        subjectExamAttemptId: sa.id,
        createdAt: sa.createdAt,
        updatedAt: sa.updatedAt,
      };
    }

    return null;
  }

  if (
    (grade.assessmentType?.toUpperCase() === "ASSIGNMENT" || grade.id.startsWith("grade-assignment-")) &&
    (!grade.remarks || !grade.remarks.trim())
  ) {
    const submissionId = grade.id.replace("grade-assignment-", "");
    try {
      const sub = await prisma.assignmentSubmission.findUnique({
        where: { id: submissionId },
        include: { assignment: { select: { title: true } } },
      });
      if (sub?.assignment?.title) {
        return { ...grade, remarks: sub.assignment.title };
      }
    } catch {
      // ignore
    }
  }

  // If grade has a future release date, is unpublished draft, or linked exam is unreleased, mask score
  const now = new Date();
  const isFutureReleaseDate = Boolean(grade.releaseDate && new Date(grade.releaseDate) > now);
  const isExamLocked = Boolean(grade.exam && (!grade.exam.allowImmediateResult && grade.exam.resultReleaseAt && new Date(grade.exam.resultReleaseAt) > now));
  const isDraft = grade.status === "DRAFT";

  if (isFutureReleaseDate || isExamLocked || isDraft) {
    return {
      ...grade,
      score: null,
      remarks: "Assessment recorded. Scores are scheduled to unlock on the release date.",
      status: "SCHEDULED" as any
    };
  }

  return grade;
};

export const getAllGradesService = async ({
  schoolId,
  classId,
  subject,
  includeExams,
}: {
  schoolId: string;
  classId?: string;
  subject?: string;
  includeExams?: boolean;
}) => {
  return prisma.grade.findMany({
    where: {
      schoolId,
      classId: classId || undefined,
      ...(subject ? { subject: { equals: subject, mode: 'insensitive' } } : {}),
      ...(includeExams ? {} : { examId: null }), // Only standalone grades if includeExams is false
    },
    include: {
      student: true,
      class: true,
      exam: includeExams ? { include: { session: true } } : false,
      subjectPaper: includeExams ? { include: { subject: true } } : false,
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
