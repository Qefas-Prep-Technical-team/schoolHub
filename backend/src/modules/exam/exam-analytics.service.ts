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
  }));
};

export const getStudentGlobalStatsService = async ({
  studentId,
}: {
  studentId: string;
}) => {
  // 1. Get the student's primary class
  const enrollment = await prisma.classEnrollment.findFirst({
    where: { studentId },
    include: { class: true },
  });

  const classId = enrollment?.classId;

  // 2. Get all graded attempts for this student
  const studentAttempts = await prisma.examAttempt.findMany({
    where: { studentId, status: "SCORED" },
  });

  const completedCount = studentAttempts.length;
  const totalScore = studentAttempts.reduce((sum, a) => sum + Number(a.totalScore || 0), 0);
  const totalPossible = studentAttempts.reduce((sum, a) => sum + Number(a.totalMarks || 1), 0);
  const averageScore = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;

  // 3. Calculate rank in class if classId exists
  let overallRank = 0;
  let totalStudentsInClass = 0;

  if (classId) {
    const classEnrollments = await prisma.classEnrollment.findMany({
      where: { classId },
      select: { studentId: true },
    });
    totalStudentsInClass = classEnrollments.length;

    const classStudentIds = classEnrollments.map((e) => e.studentId);

    // Get total points for ALL students in this class
    const allClassAttempts = await prisma.examAttempt.findMany({
      where: {
        studentId: { in: classStudentIds },
        status: "SCORED",
      },
      select: {
        studentId: true,
        totalScore: true,
      },
    });

    const studentPointsMap: Record<string, number> = {};
    allClassAttempts.forEach((attempt) => {
      studentPointsMap[attempt.studentId] = (studentPointsMap[attempt.studentId] || 0) + Number(attempt.totalScore || 0);
    });

    const sortedStudents = Object.entries(studentPointsMap)
      .sort(([, a], [, b]) => b - a);

    const rankIndex = sortedStudents.findIndex(([id]) => id === studentId);
    overallRank = rankIndex !== -1 ? rankIndex + 1 : 0;
  }

  // 4. Calculate Upcoming count
  // (We'll count published exams that have no started attempt for this student)
  const upcomingExamsCount = classId ? await prisma.exam.count({
    where: {
      status: "PUBLISHED",
      classId,
      examAttempts: { none: { studentId } },
      startDate: { gte: new Date() },
    }
  }) : 0;

  return {
    studentId,
    classId,
    completedCount,
    upcomingCount: upcomingExamsCount,
    averageScore: Math.round(averageScore),
    overallRank,
    totalStudentsInClass,
    // Basic trend mock for now
    trend: {
        value: "+2.1%",
        color: "green"
    }
  };
};
