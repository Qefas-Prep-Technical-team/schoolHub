import prisma from "../../config/database";

export const getExamRankingService = async ({
  examId,
}: {
  examId: string;
}) => {
  const attempts = await prisma.examAttempt.findMany({
    where: {
      examId,
      status: "SCORED",
    },
    include: {
      student: true,
    },
    orderBy: [
      { totalScore: "desc" },
      { submittedAt: "asc" },
    ],
  });

  return attempts.map((attempt, index) => ({
    rank: index + 1,
    studentId: attempt.studentId,
    studentName: attempt.student.name,
    score: attempt.totalScore,
    totalMarks: attempt.totalMarks,
    submittedAt: attempt.submittedAt,
  }));
};

export const getClassExamAnalyticsService = async ({
  examId,
  classId,
}: {
  examId: string;
  classId: string;
}) => {
  const enrollments = await prisma.classEnrollment.findMany({
    where: { classId },
    select: { studentId: true },
  });

  const studentIds = enrollments.map((e) => e.studentId);

  const attempts = await prisma.examAttempt.findMany({
    where: {
      examId,
      studentId: { in: studentIds },
      status: "SCORED",
    },
    include: {
      student: true,
    },
  });

  const count = attempts.length;
  const average =
    count > 0
      ? attempts.reduce((sum, a) => sum + Number(a.totalScore || 0), 0) / count
      : 0;

  const highest =
    count > 0 ? Math.max(...attempts.map((a) => Number(a.totalScore || 0))) : 0;
  const lowest =
    count > 0 ? Math.min(...attempts.map((a) => Number(a.totalScore || 0))) : 0;

  return {
    classId,
    examId,
    totalParticipants: count,
    averageScore: average,
    highestScore: highest,
    lowestScore: lowest,
    rankings: attempts
      .sort((a, b) => Number(b.totalScore) - Number(a.totalScore))
      .map((attempt, index) => ({
        rank: index + 1,
        studentId: attempt.studentId,
        studentName: attempt.student.name,
        score: attempt.totalScore,
      })),
  };
};

export const getDepartmentExamAnalyticsService = async ({
  examId,
  departmentId,
}: {
  examId: string;
  departmentId: string;
}) => {
  const attempts = await prisma.examAttempt.findMany({
    where: {
      examId,
      status: "SCORED",
    },
    include: {
      student: true,
    },
  });

  const count = attempts.length;
  const average =
    count > 0
      ? attempts.reduce((sum, a) => sum + Number(a.totalScore || 0), 0) / count
      : 0;

  return {
    departmentId,
    examId,
    totalParticipants: count,
    averageScore: average,
    rankings: attempts
      .sort((a, b) => Number(b.totalScore) - Number(a.totalScore))
      .map((attempt, index) => ({
        rank: index + 1,
        studentId: attempt.studentId,
        studentName: attempt.student.name,
        score: attempt.totalScore,
      })),
  };
};

export const getSessionExamAnalyticsService = async ({
  sessionId,
}: {
  sessionId: string;
}) => {
  const exams = await prisma.exam.findMany({
    where: { sessionId },
    include: {
      subjectPapers: true,
      _count: true,
    },
  });

  return exams.map((exam) => ({
    examId: exam.id,
    title: exam.title,
    status: exam.status,
    totalMarks: exam.totalMarks,
    totalSubjectPapers: exam.subjectPapers.length,
  }));
};
