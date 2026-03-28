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
    return existing;
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
    if (!attempt.exam.allowImmediateResult) {
      if (
        !attempt.exam.resultReleaseAt ||
        new Date() < attempt.exam.resultReleaseAt
      ) {
        throw new Error("Results are not yet available for this exam.");
      }
    }
  }

  const subjectBreakdown = attempt.subjectAttempts.map((subjectAttempt) => ({
    subjectPaperId: subjectAttempt.subjectPaperId,
    subjectId: subjectAttempt.subjectPaper.subjectId,
    subjectName: subjectAttempt.subjectPaper.subject.name,
    score: subjectAttempt.score,
    totalMarks: subjectAttempt.totalMarks,
    submittedAt: subjectAttempt.submittedAt,
  }));

  return {
    examId: attempt.examId,
    studentId: attempt.studentId,
    totalScore: attempt.totalScore,
    totalMarks: attempt.totalMarks,
    submittedAt: attempt.submittedAt,
    subjects: subjectBreakdown,
  };
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
      subjectName: subjectAttempt.subjectPaper.subject.name,
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
