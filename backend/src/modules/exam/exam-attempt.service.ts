import prisma from "../../config/database";
import { AssessmentStatus, ExamAttemptStatus, UserRole } from "@prisma/client";
import { createNotification } from "../notification/notification.service";
import {
  computeExpiryTime,
  getRemainingSeconds,
  isAttemptExpired,
} from "./exam-timer.util";

export const startExamAttemptService = async ({
  examId,
  studentId,
}: {
  examId: string;
  studentId: string;
}) => {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      subjectPapers: {
        include: {
          questions: true,
        },
      },
    },
  });

  if (!exam) {
    throw new Error("Exam not found");
  }

  if (exam.status !== AssessmentStatus.PUBLISHED) {
    throw new Error("This exam is not available");
  }

  if (exam.startDate && new Date() < new Date(exam.startDate)) {
    throw new Error(`This exam is scheduled to start on ${new Date(exam.startDate).toLocaleString()}.`);
  }

  if (exam.endDate && new Date() > new Date(exam.endDate)) {
    throw new Error(`This exam concluded on ${new Date(exam.endDate).toLocaleString()} and is no longer available.`);
  }

  const existing = await prisma.examAttempt.findUnique({
    where: {
      examId_studentId: {
        examId,
        studentId,
      },
    },
    include: {
      subjectAttempts: {
        include: {
          answers: true,
        },
      },
    },
  });

  if (existing) {
    // If the attempt is finished or expired, allow retake by deleting the old one
    if (
      existing.status === ExamAttemptStatus.SUBMITTED || 
      existing.status === ExamAttemptStatus.SCORED || 
      existing.status === ExamAttemptStatus.EXPIRED
    ) {
      await prisma.examAttempt.delete({
        where: { id: existing.id },
      });
    } else {
      // Still in progress, return the existing attempt to allow continuation
      return existing;
    }
  }

  const totalMarks = exam.subjectPapers.reduce(
    (sum, paper) => sum + Number(paper.totalMarks || 0),
    0,
  );

  const startedAt = new Date();
  const expiresAt = computeExpiryTime({
    startedAt,
    durationMinutes: exam.durationMinutes,
  });

  return prisma.examAttempt.create({
    data: {
      examId,
      studentId,
      totalMarks,
      startedAt,
      expiresAt,
      status: ExamAttemptStatus.IN_PROGRESS,
      subjectAttempts: {
        create: exam.subjectPapers.map((paper) => ({
          subjectPaperId: paper.id,
          totalMarks: Number(paper.totalMarks || 0),
        })),
      },
    },
    include: {
      subjectAttempts: {
        include: {
          subjectPaper: {
            include: {
              subject: true,
              questions: true,
            },
          },
          answers: true,
        },
      },
    },
  });
};

const ensureAttemptStillActive = async (attemptId: string) => {
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
  });

  if (!attempt) {
    throw new Error("Exam attempt not found");
  }

  if (attempt.status === "SUBMITTED" || attempt.status === "SCORED") {
    throw new Error("This exam attempt is already submitted");
  }

  if (attempt.status === "EXPIRED") {
    throw new Error("This exam attempt has expired");
  }

  if (isAttemptExpired({ expiresAt: attempt.expiresAt })) {
    await prisma.examAttempt.update({
      where: { id: attempt.id },
      data: {
        status: "EXPIRED",
      },
    });

    throw new Error("Exam time has expired");
  }

  return attempt;
};

export const autoSubmitExpiredAttemptService = async ({
  examId,
  studentId,
}: {
  examId: string;
  studentId: string;
}) => {
  const attempt = await prisma.examAttempt.findUnique({
    where: {
      examId_studentId: {
        examId,
        studentId,
      },
    },
  });

  if (!attempt) {
    throw new Error("Exam attempt not found");
  }

  if (attempt.status === "SUBMITTED" || attempt.status === "SCORED") {
    return attempt;
  }

  if (!isAttemptExpired({ expiresAt: attempt.expiresAt })) {
    return attempt;
  }

  return submitExamAttemptService({ examId, studentId });
};

export const getExamAttemptService = async ({
  examId,
  studentId,
}: {
  examId: string;
  studentId: string;
}) => {
  let attempt = await prisma.examAttempt.findUnique({
    where: {
      examId_studentId: {
        examId,
        studentId,
      },
    },
    include: {
      exam: true,
      subjectAttempts: {
        include: {
          subjectPaper: {
            include: {
              subject: true,
              questions: true,
            },
          },
          answers: true,
        },
      },
    },
  });

  if (!attempt) {
    throw new Error("Exam attempt not found");
  }

  if (
    attempt.status === "IN_PROGRESS" &&
    isAttemptExpired({ expiresAt: attempt.expiresAt })
  ) {
    await autoSubmitExpiredAttemptService({ examId, studentId });

    attempt = await prisma.examAttempt.findUnique({
      where: {
        examId_studentId: {
          examId,
          studentId,
        },
      },
      include: {
        exam: true,
        subjectAttempts: {
          include: {
            subjectPaper: {
              include: {
                subject: true,
                questions: true,
              },
            },
            answers: true,
          },
        },
      },
    });
  }

  if (!attempt) {
    throw new Error("Exam attempt not found after auto-submit");
  }

  const result = {
    ...attempt,
    remainingSeconds: getRemainingSeconds({ expiresAt: attempt.expiresAt }),
  };

  // Scrub correct answers if exam is still in progress
  if (attempt.status === "IN_PROGRESS") {
    result.subjectAttempts.forEach(sa => {
      sa.subjectPaper.questions = sa.subjectPaper.questions.map(q => ({
        ...q,
        correctAnswer: "",
        explanation: ""
      })) as any;
    });
  }

  return result;
};

export const saveExamAnswerService = async ({
  examId,
  studentId,
  subjectPaperId,
  questionId,
  answer,
}: {
  examId: string;
  studentId: string;
  subjectPaperId: string;
  questionId: string;
  answer: string;
}) => {
  const attempt = await prisma.examAttempt.findUnique({
    where: {
      examId_studentId: {
        examId,
        studentId,
      },
    },
  });

  if (!attempt) {
    console.error("Exam attempt not found for save:", { examId, studentId });
    throw new Error("Exam attempt not found. Start the exam first.");
  }

  await ensureAttemptStillActive(attempt.id);

  const subjectAttempt = await prisma.subjectExamAttempt.findFirst({
    where: {
      examAttemptId: attempt.id,
      subjectPaperId,
    },
    include: { subjectPaper: true },
  });

  if (!subjectAttempt) {
    throw new Error("Subject exam attempt not found");
  }

  const question = await prisma.subjectExamQuestion.findUnique({
    where: { id: questionId },
  });

  if (!question) {
    throw new Error("Question not found");
  }

  if (question.subjectPaperId !== subjectPaperId) {
    throw new Error("Question does not belong to this subject paper");
  }

  return prisma.subjectExamAnswer.upsert({
    where: {
      subjectExamAttemptId_questionId: {
        subjectExamAttemptId: subjectAttempt.id,
        questionId,
      },
    },
    update: {
      answer,
    },
    create: {
      subjectExamAttemptId: subjectAttempt.id,
      questionId,
      answer,
    },
  });
};

export const scoreExamAttemptService = async ({
  examId,
  studentId,
}: {
  examId: string;
  studentId: string;
}) => {
  const attempt = await prisma.examAttempt.findUnique({
    where: {
      examId_studentId: {
        examId,
        studentId,
      },
    },
    include: {
      subjectAttempts: {
        include: {
          subjectPaper: {
            include: {
              subject: true,
              questions: true,
            },
          },
          answers: {
            include: {
              question: true,
            },
          },
        },
      },
    },
  });

  if (!attempt) {
    throw new Error("Exam attempt not found");
  }

  let totalScore = 0;

  for (const subjectAttempt of attempt.subjectAttempts) {
    let subjectScore = 0;

    for (const answer of subjectAttempt.answers) {
      let isCorrect: boolean | null = null;
      let scoreAwarded = 0;
      let requiresManualReview = false;

      if (answer.question.type === "SHORT_ANSWER") {
        requiresManualReview = true;
      } else {
        const expected = (answer.question.correctAnswer || "").trim().toLowerCase();
        const actual = (answer.answer || "").trim().toLowerCase();

        isCorrect = expected !== "" && expected === actual;
        scoreAwarded = isCorrect ? Number(answer.question.marks || 0) : 0;
      }

      await prisma.subjectExamAnswer.update({
        where: { id: answer.id },
        data: {
          isCorrect,
          scoreAwarded,
          requiresManualReview,
        },
      });

      subjectScore += scoreAwarded;
    }

    await prisma.subjectExamAttempt.update({
      where: { id: subjectAttempt.id },
      data: {
        score: subjectScore,
        submittedAt: new Date(),
      },
    });

    totalScore += subjectScore;
  }

  const updated = await prisma.examAttempt.update({
    where: { id: attempt.id },
    data: {
      totalScore,
      submittedAt: new Date(),
      isSubmitted: true,
      status: ExamAttemptStatus.SCORED,
    },
    include: {
      student: true,
      exam: true,
      subjectAttempts: {
        include: {
          subjectPaper: {
            include: {
              subject: true,
            },
          },
          answers: {
            include: {
              question: true,
            },
          },
        },
      },
    },
  });

  createNotification({
    recipientType: "STUDENT",
    recipientId: attempt.studentId,
    type: "GENERAL",
    title: "Exam Submitted",
    message: `Your attempt for "${updated.exam.title}" has been successfully recorded.`,
    link: `/dashboard/student/exams/${attempt.examId}/result`,
    meta: { examAttemptId: attempt.id, examId: attempt.examId },
  }).catch((err) => console.error("Submission alert error:", err));

  // --- Grade Integration ---
  try {
    for (const sa of updated.subjectAttempts) {
      const subjectName = sa.subjectPaper?.subject?.name || "Unknown Subject";
      await prisma.grade.upsert({
        where: { id: `grade-sa-${sa.id}` },
        update: {
          score: sa.score,
          maxMarks: sa.totalMarks,
          updatedAt: new Date(),
        },
        create: {
          id: `grade-sa-${sa.id}`,
          studentId: updated.studentId,
          schoolId: updated.exam.schoolId || "",
          teacherId: sa.subjectPaper.teacherId || updated.exam.teacherId,
          classId: updated.exam.classId,
          subject: subjectName,
          assessmentType: updated.exam.category || "EXAM",
          score: sa.score,
          maxMarks: sa.totalMarks,
          remarks: `Subject results for ${updated.exam.title}`,
          examId: updated.examId,
          examAttemptId: updated.id,
          subjectExamAttemptId: sa.id,
        },
      });
    }

    // If combined, also create a total summary entry
    if (updated.subjectAttempts.length > 1) {
      await prisma.grade.upsert({
        where: { id: `grade-total-${updated.id}` },
        update: {
          score: updated.totalScore,
          maxMarks: updated.totalMarks,
          updatedAt: new Date(),
        },
        create: {
          id: `grade-total-${updated.id}`,
          studentId: updated.studentId,
          schoolId: updated.exam.schoolId || "",
          teacherId: updated.exam.teacherId,
          classId: updated.exam.classId,
          subject: `${updated.exam.title} (Total)`,
          assessmentType: updated.exam.category || "EXAM",
          score: updated.totalScore,
          maxMarks: updated.totalMarks,
          remarks: `Overall total for combined exam`,
          examId: updated.examId,
          examAttemptId: updated.id,
        },
      });
    }
  } catch (gradeError) {
    console.error("Failed to sync detailed exam results to grades:", gradeError);
  }

  // Notify admins
  prisma.admin.findMany({
    where: {
      schoolAdmins: {
        some: { schoolId: updated.exam.schoolId || "" },
      },
    },
  }).then((admins: any[]) => {
    admins.forEach((admin: any) =>
      createNotification({
        recipientType: "ADMIN",
        recipientId: admin.id,
        type: "GENERAL",
        title: "Student Submitted Exam",
        message: `Student "${updated.student.name}" has submitted their attempt for exam "${updated.exam.title}".`,
        link: `/dashboard/admin/exams/${attempt.examId}/results`,
        meta: { examId: attempt.examId, studentId: attempt.studentId },
      })
    );
  }).catch((err: any) => console.error("Admin submission notify error:", err));

  return updated;
};

export const submitExamAttemptService = async ({
  examId,
  studentId,
}: {
  examId: string;
  studentId: string;
}) => {
  return scoreExamAttemptService({ examId, studentId });
};

export const getExamResultService = async ({
  examId,
  studentId,
  requestingUserRole,
}: {
  examId: string;
  studentId: string;
  requestingUserRole: UserRole;
}) => {
  const attempt = await prisma.examAttempt.findUnique({
    where: {
      examId_studentId: {
        examId,
        studentId,
      },
    },
    include: {
      exam: true,
      subjectAttempts: {
        include: {
          subjectPaper: {
            include: {
              subject: true,
            },
          },
          answers: {
            include: {
              question: true,
            },
          },
        },
      },
    },
  });

  if (!attempt) {
    throw new Error("Result not found");
  }

  if (requestingUserRole === UserRole.STUDENT) {
    if (!attempt.exam.allowImmediateResult && attempt.exam.resultReleaseAt) {
      // We don't throw anymore, we just return the attempt/result but will scrub sensitive analytics below
      // if it's before the release date.
    }
  }

  const subjectBreakdown = attempt.subjectAttempts.map((subjectAttempt) => ({
    subjectPaperId: subjectAttempt.subjectPaperId,
    subjectId: subjectAttempt.subjectPaper.subjectId,
    subjectName: subjectAttempt.subjectPaper.subject?.name || "Unknown",
    score: subjectAttempt.score,
    totalMarks: subjectAttempt.totalMarks,
    submittedAt: subjectAttempt.submittedAt,
  }));

  const baseData = {
    examId: attempt.examId,
    studentId: attempt.studentId,
    title: attempt.exam.title,
    durationMinutes: attempt.exam.durationMinutes,
    totalScore: attempt.totalScore,
    totalMarks: attempt.totalMarks,
    submittedAt: attempt.submittedAt,
    subjects: subjectBreakdown,
    startedAt: attempt.startedAt,
  };

  // Fetch class-wide statistics & All participants for ranking
  const [stats, totalParticipants, allAttempts] = await Promise.all([
    prisma.examAttempt.aggregate({
      where: { 
        examId,
        isSubmitted: true 
      },
      _avg: {
        totalScore: true,
      },
    }),
    prisma.examAttempt.count({
      where: { 
        examId,
        isSubmitted: true 
      },
    }),
    prisma.examAttempt.findMany({
      where: { examId, isSubmitted: true },
      select: { totalScore: true, totalMarks: true },
      orderBy: { totalScore: 'desc' }
    })
  ]);

  // 1. Calculate Global Standing (Percentile)
  let globalStanding = 0;
  if (totalParticipants > 0) {
    const studentPercentage = (attempt.totalScore / attempt.totalMarks) * 100;
    const outperformed = allAttempts.filter(a => {
        const p = (a.totalScore / a.totalMarks) * 100;
        return studentPercentage > p;
    }).length;
    
    // If it's the top score, give them a high percentile like 99.9
    if (outperformed === totalParticipants - 1 && totalParticipants > 1) {
        globalStanding = 99.9;
    } else {
        globalStanding = Number(((outperformed / totalParticipants) * 100).toFixed(1));
    }
  }

  // 2. Growth Velocity (Compare with student's historical average)
  const pastAttempts = await prisma.examAttempt.findMany({
    where: {
      studentId,
      isSubmitted: true,
      NOT: { examId } // Exclude current exam
    },
    select: { totalScore: true, totalMarks: true }
  });

  let velocity = 0;
  if (pastAttempts.length > 0) {
    const historicalAvg = pastAttempts.reduce((sum, a) => sum + (a.totalScore / a.totalMarks) * 100, 0) / pastAttempts.length;
    const currentPercentage = (attempt.totalScore / attempt.totalMarks) * 100;
    velocity = Number((currentPercentage - historicalAvg).toFixed(1));
  } else {
    // If first exam, velocity is compared to class average
    const currentPercentage = (attempt.totalScore / attempt.totalMarks) * 100;
    const classAvg = (stats._avg.totalScore || 0) / (attempt.totalMarks || 1) * 100;
    velocity = Number((currentPercentage - classAvg).toFixed(1));
  }

  // 3. Performance Insight (Suggestion)
  let performanceInsight = "Great effort! Keep practicing to improve your score.";
  const percentage = (attempt.totalScore / attempt.totalMarks) * 100;
  
  if (percentage >= 90) {
    performanceInsight = "Exceptional mastery! You've demonstrated elite understanding. Focus on helping peers or exploring advanced topics.";
  } else if (percentage >= 75) {
    performanceInsight = "Strong performance! You have a solid grasp of the material. Review the few missed items to reach elite status.";
  } else if (percentage >= 50) {
    performanceInsight = "Good work, you've passed! Focus on the subjects where your score was lower to build more consistent mastery.";
  } else if (percentage >= 40) {
    performanceInsight = "You're close to proficiency. We recommend reviewing the core concepts and attempting more practice questions.";
  } else {
    performanceInsight = "This was a challenging assessment. Don't be discouraged—review the foundations and reach out for extra support.";
  }

  const isReleased = 
    attempt.exam.allowImmediateResult || 
    !attempt.exam.resultReleaseAt || 
    new Date() >= new Date(attempt.exam.resultReleaseAt);

  const finalResponse = {
    ...baseData,
    classAverage: isReleased ? (stats._avg.totalScore || 0) : null,
    totalParticipants: isReleased ? totalParticipants : null,
    globalStanding: isReleased ? globalStanding : null,
    velocity: isReleased ? velocity : null,
    performanceInsight: isReleased ? performanceInsight : "Detailed insights will be available once results are officially released."
  };

  return finalResponse;
};

export const getExamReviewDataService = async ({
  examId,
  studentId,
}: {
  examId: string;
  studentId: string;
}) => {
  const attempt = await prisma.examAttempt.findUnique({
    where: {
      examId_studentId: {
        examId,
        studentId,
      },
    },
    include: {
      exam: true,
      subjectAttempts: {
        include: {
          subjectPaper: {
            include: {
              subject: true,
              questions: true,
            },
          },
          answers: {
            include: {
              question: true,
            },
          },
        },
      },
    },
  });

  if (!attempt) {
    throw new Error("Exam review data not found");
  }

  return {
    examId: attempt.examId,
    studentId: attempt.studentId,
    totalScore: attempt.totalScore,
    totalMarks: attempt.totalMarks,
    status: attempt.status,
    submittedAt: attempt.submittedAt,
    subjects: attempt.subjectAttempts.map((subjectAttempt) => ({
      subjectPaperId: subjectAttempt.subjectPaperId,
      subjectName: subjectAttempt.subjectPaper?.subject?.name || "Unknown",
      score: subjectAttempt.score,
      totalMarks: subjectAttempt.totalMarks,
      questions: subjectAttempt.subjectPaper.questions.map((question) => {
        const answer = subjectAttempt.answers.find(
          (ans) => ans.questionId === question.id,
        );

        return {
          questionId: question.id,
          question: question.question,
          type: question.type,
          options: {
            optionA: question.optionA,
            optionB: question.optionB,
            optionC: question.optionC,
            optionD: question.optionD,
          },
          correctAnswer: question.correctAnswer,
          studentAnswer: answer?.answer || null,
          isCorrect: answer?.isCorrect ?? null,
          scoreAwarded: answer?.scoreAwarded ?? 0,
          maxMarks: question.marks,
          requiresManualReview: answer?.requiresManualReview ?? false,
          manuallyReviewed: answer?.manuallyReviewed ?? false,
          reviewNote: answer?.reviewNote ?? null,
        };
      }),
    })),
  };
};

export const getExamAttemptsService = async ({
  examId,
  schoolId,
}: {
  examId: string;
  schoolId?: string;
}) => {
  return prisma.examAttempt.findMany({
    where: {
      examId,
      exam: schoolId ? { schoolId } : undefined,
    },
    include: {
      student: true,
      subjectAttempts: true,
    },
    orderBy: {
      totalScore: "desc",
    },
  });
};

export const getStudentExamAttemptsService = async (studentId: string) => {
  return prisma.examAttempt.findMany({
    where: {
      studentId,
      status: {
        in: [ExamAttemptStatus.SUBMITTED, ExamAttemptStatus.SCORED],
      },
    },
    include: {
      exam: true,
      subjectAttempts: {
        include: {
          subjectPaper: {
            include: {
              subject: true,
            },
          },
        },
      },
    },
    orderBy: {
      submittedAt: "desc",
    },
  });
};
