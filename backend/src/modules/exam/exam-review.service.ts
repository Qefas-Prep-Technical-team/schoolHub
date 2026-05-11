import prisma from "../../config/database";
import { createNotification } from "../notification/notification.service";

export const getManualReviewQueueService = async ({
  examId,
}: {
  examId?: string;
}) => {
  return prisma.subjectExamAnswer.findMany({
    where: {
      requiresManualReview: true,
      manuallyReviewed: false,
      ...(examId
        ? {
            subjectExamAttempt: {
              examAttempt: {
                examId,
              },
            },
          }
        : {}),
    },
    include: {
      question: true,
      subjectExamAttempt: {
        include: {
          subjectPaper: {
            include: {
              subject: true,
              exams: { include: { exam: true } },
            },
          },
          examAttempt: {
            include: {
              student: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

export const markSubjectiveAnswerService = async ({
  answerId,
  scoreAwarded,
  reviewNote,
  reviewerId,
}: {
  answerId: string;
  scoreAwarded: number;
  reviewNote?: string;
  reviewerId: string;
}) => {
  const answer = await prisma.subjectExamAnswer.findUnique({
    where: { id: answerId },
    include: {
      question: true,
      subjectExamAttempt: {
        include: {
          examAttempt: true,
        },
      },
    },
  });

  if (!answer) {
    throw new Error("Answer not found");
  }

  const maxMarks = Number(answer.question.marks || 0);

  if (scoreAwarded < 0 || scoreAwarded > maxMarks) {
    throw new Error(`Score must be between 0 and ${maxMarks}`);
  }

  const updated = await prisma.subjectExamAnswer.update({
    where: { id: answerId },
    data: {
      scoreAwarded,
      manuallyReviewed: true,
      reviewedById: reviewerId,
      reviewedAt: new Date(),
      reviewNote: reviewNote || null,
      isCorrect: scoreAwarded > 0 ? true : false,
    },
  });

  const subjectAttempt = await prisma.subjectExamAttempt.findUnique({
    where: { id: answer.subjectExamAttemptId },
    include: {
      answers: true,
      examAttempt: true,
    },
  });

  if (!subjectAttempt) {
    throw new Error("Subject attempt not found");
  }

  const subjectScore = subjectAttempt.answers.reduce(
    (sum: number, ans: any) => sum + Number(ans.scoreAwarded || 0),
    0
  );

  await prisma.subjectExamAttempt.update({
    where: { id: subjectAttempt.id },
    data: { score: subjectScore },
  });

  const allSubjectAttempts = await prisma.subjectExamAttempt.findMany({
    where: {
      examAttemptId: subjectAttempt.examAttemptId,
    },
  });

  const totalScore = allSubjectAttempts.reduce(
    (sum, item) => sum + Number(item.score || 0),
    0
  );

  await prisma.examAttempt.update({
    where: { id: subjectAttempt.examAttemptId },
    data: {
      totalScore,
    },
  });

  createNotification({
    recipientType: "STUDENT",
    recipientId: subjectAttempt.examAttempt.studentId,
    type: "GENERAL",
    title: "Subjective Answer Reviewed",
    message: `A teacher has reviewed and scored your subjective answer for an exam.`,
    meta: {
      examAttemptId: subjectAttempt.examAttemptId,
      answerId: answerId,
    },
  }).catch(console.error);

  return updated;
};
