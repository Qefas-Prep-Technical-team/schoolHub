import prisma, { withRetry } from "../../config/database";
import { generateStudentPerformanceInsight } from "./exam-ai.service";
import { AssessmentStatus, ExamAttemptStatus, UserRole, GradeStatus } from "@prisma/client";
import { createNotification } from "../notification/notification.service";
import {
  computeExpiryTime,
  getRemainingSeconds,
  isAttemptExpired,
} from "./exam-timer.util";

export interface BulkAnswerPayloadItem {
  subjectPaperId: string;
  questionId: string;
  answer: string;
}

export const startExamAttemptService = async ({
  examId,
  studentId,
  deviceId,
}: {
  examId: string;
  studentId: string;
  deviceId?: string;
}) => {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      departments: true,
      subjectExamPapers: {
        include: {
          subjectPaper: {
            include: { questions: true },
          },
        },
      },
    },
  });

  if (!exam) {
    throw new Error("Exam not found");
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      schoolId: true,
      departmentId: true,
      classes: { select: { classId: true } },
    },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  // Cross-school isolation check: if the exam belongs to a specific school, the student must belong to the same school
  if (exam.schoolId && student.schoolId !== exam.schoolId) {
    throw new Error("You do not have permission to access or take an exam from another institution");
  }

  // Class cohort check: if the exam is targeted to a specific class, student must belong to that class
  if (exam.classId && student.classes && student.classes.length > 0) {
    const isEnrolledInClass = student.classes.some((c: { classId: string }) => c.classId === exam.classId);
    if (!isEnrolledInClass) {
      throw new Error("This exam is not designated for your class cohort");
    }
  }

  // Department check & Unattached / School-wide assessment subject matching:
  const hasNoClass = !exam.classId;
  const hasNoDepartments = !exam.departments || exam.departments.length === 0;

  if (hasNoClass && hasNoDepartments && student.departmentId) {
    // If assessment is not attached to a class or department, check if it matches a subject assigned to the student's department
    const deptSubjects = await prisma.departmentSubject.findMany({
      where: { departmentId: student.departmentId },
      select: { subjectId: true },
    });
    const deptSubjectIds = deptSubjects.map((ds) => ds.subjectId);

    const examSubjId = exam.subjectId;
    const examPaperSubjIds = (exam.subjectExamPapers || []).map((p: any) => p.subjectPaper?.subjectId).filter(Boolean);
    const allExamSubjectIds = [examSubjId, ...examPaperSubjIds].filter(Boolean);

    if (allExamSubjectIds.length > 0) {
      const matchesDeptSubject = allExamSubjectIds.some((sId: string) => deptSubjectIds.includes(sId));
      if (!matchesDeptSubject) {
        throw new Error("This exam is not available for your academic department curriculum");
      }
    }
  } else if (exam.departments && exam.departments.length > 0 && student.departmentId) {
    const isDeptAllowed = exam.departments.some((d: { departmentId: string }) => d.departmentId === student.departmentId);
    if (!isDeptAllowed) {
      throw new Error("This exam is not available for your academic department");
    }
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
      subjectExamAttempts: {
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

  if (existing) {
    if (existing.status === ExamAttemptStatus.EXPIRED) {
      // If an older attempt was marked EXPIRED, check if time still remains; otherwise score it properly
      if (!isAttemptExpired({ expiresAt: existing.expiresAt })) {
        const reopened = await prisma.examAttempt.update({
          where: { id: existing.id },
          data: {
            status: ExamAttemptStatus.IN_PROGRESS,
            ...(deviceId ? { deviceId } : {}),
          },
          include: {
            subjectExamAttempts: {
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
        return {
          ...reopened,
          subjectAttempts: reopened.subjectExamAttempts,
        };
      }
      await autoSubmitExpiredAttemptService({ examId, studentId });
      throw new Error("This examination attempt has already expired and been submitted.");
    } else if (
      existing.status === ExamAttemptStatus.SUBMITTED ||
      existing.status === ExamAttemptStatus.SCORED
    ) {
      await prisma.examAttempt.delete({
        where: { id: existing.id },
      });
    } else {
      // Still in progress: allow seamless continuation even if browser rotated deviceId after a session expiry
      if (deviceId && existing.deviceId !== deviceId) {
        await prisma.examAttempt.update({
          where: { id: existing.id },
          data: { deviceId },
        });
      }
      return {
        ...existing,
        subjectAttempts: existing.subjectExamAttempts || (existing as any).subjectAttempts,
      };
    }
  }

  const papers = exam.subjectExamPapers.map((link: any) => link.subjectPaper);

  const totalMarks = papers.reduce(
    (sum: number, paper: any) => sum + Number(paper.totalMarks || 0),
    0,
  );

  const effectiveDurationMinutes =
    exam.durationMinutes && exam.durationMinutes > 0
      ? exam.durationMinutes
      : papers.reduce(
        (sum: number, paper: any) => sum + Number(paper?.durationMinutes || 0),
        0,
      );

  const startedAt = new Date();
  const expiresAt = computeExpiryTime({
    startedAt,
    durationMinutes: effectiveDurationMinutes > 0 ? effectiveDurationMinutes : null,
  });

  const createdAttempt = await prisma.examAttempt.create({
    data: {
      examId,
      studentId,
      deviceId,
      totalMarks,
      startedAt,
      expiresAt,
      status: ExamAttemptStatus.IN_PROGRESS,
      subjectExamAttempts: {
        create: papers.map((paper: any) => ({
          subjectPaperId: paper.id,
          totalMarks: Number(paper.totalMarks || 0),
        })),
      },
    },
    include: {
      subjectExamAttempts: {
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

  return {
    ...createdAttempt,
    subjectAttempts: createdAttempt.subjectExamAttempts,
  };
};

const AUTO_SUBMIT_GRACE_MS = 10 * 60 * 1000; // 10 minutes grace window for auto-submission & network recovery

const ensureAttemptStillActive = async (attemptId: string, allowAutoSubmitGrace: boolean = false) => {
  const attempt = await withRetry(
    () =>
      prisma.examAttempt.findUnique({
        where: { id: attemptId },
      }),
    "ensureAttemptStillActive_findUnique",
  );

  if (!attempt) {
    throw new Error("Exam attempt not found");
  }

  if (attempt.status === "SUBMITTED" || attempt.status === "SCORED") {
    throw new Error("This exam attempt is already submitted");
  }

  // If allowAutoSubmitGrace is enabled (e.g., saving answers during timer expiry flush),
  // allow saving as long as we are within the grace window or the attempt hasn't been scored yet.
  if (allowAutoSubmitGrace) {
    if (!attempt.expiresAt) return attempt;
    const msSinceExpiry = Date.now() - new Date(attempt.expiresAt).getTime();
    if (msSinceExpiry <= AUTO_SUBMIT_GRACE_MS) {
      return attempt;
    }
  }

  if (attempt.status === "EXPIRED") {
    throw new Error("This exam attempt has expired");
  }

  if (isAttemptExpired({ expiresAt: attempt.expiresAt })) {
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
      subjectExamAttempts: {
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
    (attempt.status === "IN_PROGRESS" || attempt.status === "EXPIRED") &&
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
        subjectExamAttempts: {
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

  // Check if results should be visible
  const isResultsReleased = attempt.exam?.allowImmediateResult
    ? true
    : attempt.exam?.resultReleaseAt
      ? new Date() >= new Date(attempt.exam.resultReleaseAt)
      : false;

  // Scrub correct answers if exam is still in progress OR if results are not released yet
  if (attempt.status === "IN_PROGRESS" || !isResultsReleased) {
    result.subjectExamAttempts.forEach((sa: any) => {
      // Deterministic shuffle if enabled
      if ((attempt as any).exam?.shuffleQuestions) {
        // Use student ID + attempt ID as seed
        const seedStr = sa.id + attempt!.studentId;
        let seed = 0;
        for (let i = 0; i < seedStr.length; i++) {
          seed = ((seed << 5) - seed) + seedStr.charCodeAt(i);
          seed |= 0;
        }

        const seededRandom = (s: number) => {
          const x = Math.sin(s) * 10000;
          return x - Math.floor(x);
        };

        const questions = [...sa.subjectPaper.questions];
        let m = questions.length, t, i;
        while (m) {
          i = Math.floor(seededRandom(seed++) * m--);
          t = questions[m];
          questions[m] = questions[i];
          questions[i] = t;
        }
        sa.subjectPaper.questions = questions;
      }

      if (sa.subjectPaper?.questions) {
        sa.subjectPaper.questions = sa.subjectPaper.questions.map((q: any) => ({
          ...q,
          correctAnswer: "",
          explanation: ""
        })) as any;
      }
    });
  }

  // Scrub scores if results are not released yet
  if (!isResultsReleased && result.status === "SCORED") {
    result.totalScore = null as any;
    result.subjectExamAttempts.forEach((sa: any) => {
      sa.score = null as any;
    });
  }

  return {
    ...result,
    subjectAttempts: result.subjectExamAttempts,
  };
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
  const attempt = await withRetry(
    () =>
      prisma.examAttempt.findUnique({
        where: {
          examId_studentId: {
            examId,
            studentId,
          },
        },
      }),
    "saveExamAnswer_attempt_findUnique",
  );

  if (!attempt) {
    console.error("Exam attempt not found for save:", { examId, studentId });
    throw new Error("Exam attempt not found. Start the exam first.");
  }

  await ensureAttemptStillActive(attempt.id, true);

  const [subjectAttempt, question] = await withRetry(
    () =>
      Promise.all([
        prisma.subjectExamAttempt.findFirst({
          where: {
            examAttemptId: attempt.id,
            subjectPaperId,
          },
          select: { id: true, subjectPaperId: true },
        }),
        prisma.subjectExamQuestion.findUnique({
          where: { id: questionId },
          select: { id: true, subjectPaperId: true },
        }),
      ]),
    "saveExamAnswer_lookup",
  );

  if (!subjectAttempt) {
    throw new Error("Subject exam attempt not found");
  }

  if (!question) {
    throw new Error("Question not found");
  }

  if (question.subjectPaperId !== subjectPaperId) {
    throw new Error("Question does not belong to this subject paper");
  }

  return withRetry(
    () =>
      prisma.subjectExamAnswer.upsert({
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
      }),
    "saveExamAnswer_upsert",
  );
};

export const submitSubjectPaperAttemptService = async ({
  examId,
  studentId,
  subjectPaperId,
}: {
  examId: string;
  studentId: string;
  subjectPaperId: string;
}) => {
  const attempt = await withRetry(
    () =>
      prisma.examAttempt.findUnique({
        where: {
          examId_studentId: {
            examId,
            studentId,
          },
        },
      }),
    "submitSubjectPaperAttempt_attempt_findUnique",
  );

  if (!attempt) {
    throw new Error("Exam attempt not found. Start the exam first.");
  }

  const subjectAttempt = await withRetry(
    () =>
      prisma.subjectExamAttempt.findFirst({
        where: {
          examAttemptId: attempt.id,
          subjectPaperId,
        },
      }),
    "submitSubjectPaperAttempt_subjectAttempt_findFirst",
  );

  if (!subjectAttempt) {
    throw new Error("Subject exam attempt not found for the given paper.");
  }

  // Idempotent — if already marked as submitted or parent attempt is already submitted/scored, return early without error
  if (subjectAttempt.submittedAt || attempt.status === "SUBMITTED" || attempt.status === "SCORED") {
    return subjectAttempt;
  }

  return withRetry(
    () =>
      prisma.subjectExamAttempt.update({
        where: { id: subjectAttempt.id },
        data: { submittedAt: new Date() },
      }),
    "submitSubjectPaperAttempt_update",
  );
};

export const scoreExamAttemptService = async ({
  examId,
  studentId,
  answers: pendingAnswers,
}: {
  examId: string;
  studentId: string;
  answers?: BulkAnswerPayloadItem[];
}) => {
  const attempt = await withRetry(
    () =>
      prisma.examAttempt.findUnique({
        where: {
          examId_studentId: {
            examId,
            studentId,
          },
        },
        include: {
          subjectExamAttempts: {
            include: {
              subjectPaper: {
                include: {
                  subject: true,
                  questions: {
                    select: {
                      id: true,
                      type: true,
                      correctAnswer: true,
                      marks: true,
                      optionA: true,
                      optionB: true,
                      optionC: true,
                      optionD: true,
                    },
                  },
                },
              },
              answers: true,
            },
          },
        },
      }),
    "scoreExamAttempt_attempt_findUnique",
  );

  if (!attempt) {
    throw new Error("Exam attempt not found");
  }

  // Merge any pending answers sent directly in the submit payload
  if (pendingAnswers && Array.isArray(pendingAnswers) && pendingAnswers.length > 0) {
    const upsertQueue: any[] = [];
    for (const item of pendingAnswers) {
      if (!item || !item.questionId || item.answer === undefined) continue;
      const targetSa = attempt.subjectExamAttempts.find(
        (sa) => sa.subjectPaperId === item.subjectPaperId || sa.subjectPaper?.questions?.some((q) => q.id === item.questionId),
      );
      if (!targetSa) continue;

      const existingAns = targetSa.answers.find((a) => a.questionId === item.questionId);
      if (existingAns) {
        if (existingAns.answer !== item.answer) {
          existingAns.answer = item.answer;
          upsertQueue.push(
            prisma.subjectExamAnswer.update({
              where: { id: existingAns.id },
              data: { answer: item.answer },
            }),
          );
        }
      } else {
        upsertQueue.push(
          prisma.subjectExamAnswer.upsert({
            where: {
              subjectExamAttemptId_questionId: {
                subjectExamAttemptId: targetSa.id,
                questionId: item.questionId,
              },
            },
            update: { answer: item.answer },
            create: {
              subjectExamAttemptId: targetSa.id,
              questionId: item.questionId,
              answer: item.answer,
            },
          }),
        );
      }
    }

    if (upsertQueue.length > 0) {
      await withRetry(() => prisma.$transaction(upsertQueue), "scoreExamAttempt_flushPendingAnswers");
      // Re-fetch answers if new rows were created so we have their IDs
      const refreshedSubjectAttempts = await withRetry(
        () =>
          prisma.subjectExamAttempt.findMany({
            where: { examAttemptId: attempt.id },
            include: { answers: true },
          }),
        "scoreExamAttempt_refreshAnswers",
      );
      for (const sa of attempt.subjectExamAttempts) {
        const refreshed = refreshedSubjectAttempts.find((r) => r.id === sa.id);
        if (refreshed) {
          sa.answers = refreshed.answers;
        }
      }
    }
  }

  let totalScore = 0;
  const transactionQueue: any[] = [];

  // Group answer IDs by (isCorrect, scoreAwarded, requiresManualReview) so we issue a handful of updateMany queries instead of 100+ individual updates
  const answerUpdateGroups = new Map<
    string,
    {
      isCorrect: boolean | null;
      scoreAwarded: number;
      requiresManualReview: boolean;
      ids: string[];
    }
  >();

  for (const subjectAttempt of attempt.subjectExamAttempts) {
    let subjectScore = 0;
    const questionMap = new Map(
      (subjectAttempt.subjectPaper?.questions || []).map((q) => [q.id, q]),
    );

    for (const answer of subjectAttempt.answers) {
      const question = questionMap.get(answer.questionId);
      if (!question) continue;

      let isCorrect: boolean | null = null;
      let scoreAwarded = 0;
      let requiresManualReview = false;

      if (question.type === "SHORT_ANSWER") {
        requiresManualReview = true;
      } else {
        const expected = (question.correctAnswer || "").trim().toLowerCase();
        const actual = (answer.answer || "").trim().toLowerCase();

        isCorrect = expected !== "" && expected === actual;
        if (!isCorrect && question.type === "MULTIPLE_CHOICE" && ["a", "b", "c", "d"].includes(expected)) {
          const optionKey = `option${expected.toUpperCase()}` as "optionA" | "optionB" | "optionC" | "optionD";
          const optionText = String(question[optionKey] || "").trim().toLowerCase();
          if (optionText && optionText === actual) {
            isCorrect = true;
          }
        } else if (!isCorrect && question.type === "MULTIPLE_CHOICE" && ["a", "b", "c", "d"].includes(actual)) {
          const optionKey = `option${actual.toUpperCase()}` as "optionA" | "optionB" | "optionC" | "optionD";
          const optionText = String(question[optionKey] || "").trim().toLowerCase();
          if (optionText && optionText === expected) {
            isCorrect = true;
          }
        }

        scoreAwarded = isCorrect ? Number(question.marks || 0) : 0;
      }

      const groupKey = `${String(isCorrect)}:${scoreAwarded}:${requiresManualReview}`;
      const group = answerUpdateGroups.get(groupKey) || {
        isCorrect,
        scoreAwarded,
        requiresManualReview,
        ids: [],
      };
      group.ids.push(answer.id);
      answerUpdateGroups.set(groupKey, group);

      subjectScore += scoreAwarded;
    }

    transactionQueue.push(
      prisma.subjectExamAttempt.update({
        where: { id: subjectAttempt.id },
        data: {
          score: subjectScore,
          submittedAt: subjectAttempt.submittedAt || new Date(),
        },
      }),
    );

    totalScore += subjectScore;
  }

  for (const group of answerUpdateGroups.values()) {
    transactionQueue.push(
      prisma.subjectExamAnswer.updateMany({
        where: { id: { in: group.ids } },
        data: {
          isCorrect: group.isCorrect,
          scoreAwarded: group.scoreAwarded,
          requiresManualReview: group.requiresManualReview,
        },
      }),
    );
  }

  // Execute all batched updates safely in a single DB connection and single round-trip
  if (transactionQueue.length > 0) {
    await withRetry(() => prisma.$transaction(transactionQueue), "scoreExamAttempt_batchTransaction");
  }

  const updated = await withRetry(
    () =>
      prisma.examAttempt.update({
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
      }),
    "scoreExamAttempt_updateExamAttempt",
  );

  createNotification({
    recipientType: "STUDENT",
    recipientId: attempt.studentId,
    type: "GENERAL",
    title: "Exam Submitted",
    message: `Your attempt for "${updated.exam.title}" has been successfully recorded.`,
    link: `/dashboard/student/exams/${attempt.examId}/result`,
    meta: { examAttemptId: attempt.id, examId: attempt.examId },
  }).catch((err) => console.error("Submission alert error:", err));

  // --- Grade Integration (Executed Asynchronously in Background to minimize submission latency) ---
  const syncExamGradesAsync = async () => {
    try {
      if (!updated.exam.schoolId) return; // Only sync to institutional Gradebook if linked to a school
      const gradeTransactions: any[] = [];
      const gradeStatus = updated.exam.allowImmediateResult ? GradeStatus.PUBLISHED : GradeStatus.DRAFT;

      for (const sa of updated.subjectExamAttempts) {
        const subjectName = sa.subjectPaper?.subject?.name || "Unknown Subject";
        gradeTransactions.push(
          prisma.grade.upsert({
            where: { id: `grade-sa-${sa.id}` },
            update: {
              score: sa.score,
              maxMarks: sa.totalMarks,
              subjectPaperId: sa.subjectPaperId,
              updatedAt: new Date(),
              status: gradeStatus,
            },
            create: {
              id: `grade-sa-${sa.id}`,
              studentId: updated.studentId,
              schoolId: updated.exam.schoolId,
              teacherId: sa.subjectPaper.teacherId || updated.exam.teacherId,
              classId: updated.exam.classId,
              subject: subjectName,
              assessmentType: updated.exam.category || "EXAM",
              score: sa.score,
              maxMarks: sa.totalMarks,
              remarks: `Subject results for ${updated.exam.title}`,
              examId: updated.examId,
              subjectPaperId: sa.subjectPaperId,
              examAttemptId: updated.id,
              subjectExamAttemptId: sa.id,
              status: gradeStatus,
            },
          })
        );
      }

      // If combined, also create/update a total summary entry
      if (updated.subjectExamAttempts.length > 1) {
        gradeTransactions.push(
          prisma.grade.upsert({
            where: { id: `grade-total-${updated.id}` },
            update: {
              score: updated.totalScore,
              maxMarks: updated.totalMarks,
              updatedAt: new Date(),
              status: gradeStatus,
            },
            create: {
              id: `grade-total-${updated.id}`,
              studentId: updated.studentId,
              schoolId: updated.exam.schoolId,
              teacherId: updated.exam.teacherId,
              classId: updated.exam.classId,
              subject: `${updated.exam.title} (Total)`,
              assessmentType: updated.exam.category || "EXAM",
              score: updated.totalScore,
              maxMarks: updated.totalMarks,
              remarks: `Overall total for combined exam`,
              examId: updated.examId,
              examAttemptId: updated.id,
              status: gradeStatus,
            },
          })
        );
      }

      if (gradeTransactions.length > 0) {
        await withRetry(() => prisma.$transaction(gradeTransactions), "scoreExamAttempt_gradeUpsertTransaction");
      }
    } catch (gradeError) {
      console.error("Failed to sync detailed exam results to grades:", gradeError);
    }
  };

  // Launch grade sync non-blockingly so the student receives an instant submission response
  syncExamGradesAsync().catch((e) => console.error("Async grade sync error:", e));

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
  answers,
}: {
  examId: string;
  studentId: string;
  answers?: BulkAnswerPayloadItem[];
}) => {
  return scoreExamAttemptService({ examId, studentId, answers });
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
      student: true,
      exam: {
        include: {
          class: true,
        },
      },
      subjectExamAttempts: {
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

  const isReleased = attempt.exam.allowImmediateResult
    ? true
    : attempt.exam.resultReleaseAt
      ? new Date() >= new Date(attempt.exam.resultReleaseAt)
      : false;

  if (requestingUserRole === UserRole.STUDENT && !isReleased) {
    throw new Error("Results for this exam are not yet released.");
  }

  const subjectBreakdown = attempt.subjectExamAttempts.map((subjectAttempt: any) => ({
    subjectPaperId: subjectAttempt.subjectPaperId,
    subjectId: subjectAttempt.subjectPaper.subjectId,
    subjectName: subjectAttempt.subjectPaper.subject?.name || "Unknown",
    score: isReleased ? subjectAttempt.score : null,
    totalMarks: subjectAttempt.totalMarks,
    passMark: subjectAttempt.subjectPaper.passMark || 40,
    submittedAt: subjectAttempt.submittedAt,
  }));

  const baseData = {
    examId: attempt.examId,
    studentId: attempt.studentId,
    student: {
      name: attempt.student.name,
      email: attempt.student.email,
      studentCode: attempt.student.studentCode,
    },
    className: attempt.exam.class?.name || "N/A",
    title: attempt.exam.title,
    durationMinutes: attempt.exam.durationMinutes,
    totalScore: isReleased ? attempt.totalScore : null,
    totalMarks: attempt.totalMarks,
    overallPassMark: attempt.exam.mode === 'SINGLE_SUBJECT'
      ? (attempt.subjectExamAttempts[0]?.subjectPaper?.passMark || 40)
      : 40, // Default 40% for combined exams if not specified
    submittedAt: attempt.submittedAt,
    subjects: subjectBreakdown,
    startedAt: attempt.startedAt,
    isReleased
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
      select: { totalScore: true, totalMarks: true, studentId: true },
      orderBy: { totalScore: 'desc' }
    })
  ]);

  // 1. Calculate Position and Global Standing (Percentile)
  const position = allAttempts.findIndex(a => a.studentId === studentId) + 1;

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

  // 3. Performance Insight (Suggestion) & Nigerian Grading
  let performanceInsight = "Great effort! Keep practicing to improve your score.";
  const percentage = (attempt.totalScore / attempt.totalMarks) * 100;

  let grade = "F9";
  let proficiency = "Fail";

  if (percentage >= 75) {
    grade = "A1";
    proficiency = "Distinction";
    performanceInsight = "Exceptional mastery! You've demonstrated elite understanding. Focus on helping peers or exploring advanced topics.";
  } else if (percentage >= 70) {
    grade = "B2";
    proficiency = "Very Good";
    performanceInsight = "Very strong performance! You have a solid grasp of the material. Review the few missed items to reach elite status.";
  } else if (percentage >= 65) {
    grade = "B3";
    proficiency = "Good";
    performanceInsight = "Good work! You have a solid understanding. Focus on consistency to reach the next level.";
  } else if (percentage >= 50) {
    grade = "C6";
    proficiency = "Credit";
    performanceInsight = "Good work, you've passed! Focus on the subjects where your score was lower to build more consistent mastery.";
  } else if (percentage >= 40) {
    grade = "D7";
    proficiency = "Pass";
    performanceInsight = "You're close to proficiency. We recommend reviewing the core concepts and attempting more practice questions.";
  } else {
    grade = "F9";
    proficiency = "Fail";
    performanceInsight = "This was a challenging assessment. Don't be discouraged—review the foundations and reach out for extra support.";
  }

  // Check if AI Insight should be available based on subscription
  // Student has access if their school is on an active plan that has the AI Insights feature in the features column of subscription_plans table
  let hasAiInsightAccess = false;

  const checkPlanHasAiInsight = (features?: string[] | null): boolean => {
    if (!features || !Array.isArray(features)) return false;
    return features.some((feat: unknown) => {
      if (typeof feat !== "string") return false;
      const normalized = feat.trim().toLowerCase();
      return (
        normalized === "ai insights" ||
        normalized === "ai insight" ||
        normalized === "ai_insight" ||
        normalized === "ai_insights" ||
        normalized === "ai_tools" ||
        normalized.includes("ai insight")
      );
    });
  };

  const schoolId = attempt.exam.schoolId || attempt.student?.schoolId;

  if (schoolId) {
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      include: {
        subscriptionPlan: true,
        schoolSubscriptions: {
          include: {
            subscriptionPlan: true,
          },
        },
      },
    });

    if (school) {
      let activeSchoolPlan = null;

      // 1. Check active schoolSubscriptions record
      const schoolSub = school.schoolSubscriptions;
      if (schoolSub && schoolSub.status === "ACTIVE") {
        const isExpired = schoolSub.expiresAt ? new Date(schoolSub.expiresAt) < new Date() : false;
        if (!isExpired) {
          activeSchoolPlan = schoolSub.subscriptionPlan;
        }
      }

      // 2. Check school direct subscriptionPlan if active or trial active
      if (!activeSchoolPlan && (school.subscriptionStatus === "ACTIVE" || school.isTrialActive)) {
        activeSchoolPlan = school.subscriptionPlan;
      }

      // 3. Fallback: if school has an assigned subscription plan
      if (!activeSchoolPlan && school.subscriptionPlan) {
        activeSchoolPlan = school.subscriptionPlan;
      }

      if (activeSchoolPlan && checkPlanHasAiInsight(activeSchoolPlan.features)) {
        hasAiInsightAccess = true;
      }
    }
  }

  // Also allow access if student has an active individual user subscription with AI Insights
  if (!hasAiInsightAccess) {
    const userSub = await prisma.userSubscription.findUnique({
      where: { userId: studentId },
      include: { subscriptionPlan: true },
    });

    if (userSub?.status === "ACTIVE" && checkPlanHasAiInsight(userSub.subscriptionPlan?.features)) {
      hasAiInsightAccess = true;
    }
  }

  // Extract incorrect questions to provide targeted diagnostics for study focus
  const incorrectQuestions: Array<{
    subjectName?: string;
    questionText: string;
    studentAnswer?: string;
    correctAnswer?: string;
  }> = [];

  attempt.subjectExamAttempts.forEach((sea) => {
    const subjectName = sea.subjectPaper?.subject?.name || "General";
    if (sea.answers && Array.isArray(sea.answers)) {
      sea.answers.forEach((ans) => {
        if (ans.isCorrect === false) {
          incorrectQuestions.push({
            subjectName,
            questionText: ans.question?.question || "Question item",
            studentAnswer: ans.answer,
            correctAnswer: ans.question?.correctAnswer,
          });
        }
      });
    }
  });

  // Attempt to generate AI insight if OpenAI key is present, otherwise fallback to heuristic
  // Only generate if they have access to avoid wasting tokens
  if (hasAiInsightAccess) {
    if (attempt.performanceInsight && !attempt.performanceInsight.startsWith("Premium AI insights")) {
      performanceInsight = attempt.performanceInsight;
    } else if (process.env.OPENAI_API_KEY) {
      try {
        performanceInsight = await generateStudentPerformanceInsight({
          studentName: attempt.student.name,
          totalScore: attempt.totalScore,
          totalMarks: attempt.totalMarks,
          grade,
          proficiency,
          subjects: subjectBreakdown,
          incorrectQuestions,
        });

        // Cache the insight
        await prisma.examAttempt.update({
          where: { id: attempt.id },
          data: { performanceInsight },
        });
      } catch (err) {
        console.error("Failed to generate AI insight, using heuristic.");
      }
    }
  } else {
    performanceInsight = "Premium AI pedagogical insights are available exclusively for schools subscribed to an AI-enabled plan. Ask your school administrator to upgrade to unlock comprehensive performance analysis and recommendations.";
  }

  const finalResponse = {
    ...baseData,
    grade: isReleased ? grade : null,
    proficiency: isReleased ? proficiency : null,
    classAverage: isReleased ? (stats._avg.totalScore || 0) : null,
    totalParticipants: isReleased ? totalParticipants : null,
    globalStanding: isReleased ? globalStanding : null,
    position: isReleased ? position : null,
    velocity: isReleased ? velocity : null,
    performanceInsight: isReleased ? performanceInsight : "Detailed insights will be available once results are officially released.",
    hasAiInsightAccess: isReleased ? hasAiInsightAccess : false
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
      subjectExamAttempts: {
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

  // Same restriction as getExamResultService
  const isStudentRequest = studentId === attempt.studentId;
  // Assuming studentId filter corresponds to the logged in user if they are a student, enforced by controller
  if (isStudentRequest) {
    const isReleased =
      attempt.exam.allowImmediateResult ||
      !attempt.exam.resultReleaseAt ||
      new Date() >= new Date(attempt.exam.resultReleaseAt);

    if (!isReleased) {
      throw new Error("Review data for this exam is not yet released.");
    }
  }

  return {
    examId: attempt.examId,
    studentId: attempt.studentId,
    totalScore: attempt.totalScore,
    totalMarks: attempt.totalMarks,
    status: attempt.status,
    submittedAt: attempt.submittedAt,
    subjects: attempt.subjectExamAttempts.map((subjectAttempt: any) => ({
      subjectPaperId: subjectAttempt.subjectPaperId,
      subjectName: subjectAttempt.subjectPaper?.subject?.name || "Unknown",
      score: subjectAttempt.score,
      totalMarks: subjectAttempt.totalMarks,
      questions: subjectAttempt.subjectPaper.questions.map((question: any) => {
        const answer = subjectAttempt.answers.find(
          (ans: any) => ans.questionId === question.id,
        );

        return {
          questionId: question.id,
          question: question.question,
          images: (question as any).images || [],
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
  // Proactively sweep any expired attempts that are still marked IN_PROGRESS for this exam
  // so admins and teachers always see auto-submitted / scored attempts without waiting for a student heartbeat
  try {
    const expiredInProgress = await prisma.examAttempt.findMany({
      where: {
        examId,
        status: "IN_PROGRESS",
        expiresAt: {
          lte: new Date(),
        },
      },
      select: {
        examId: true,
        studentId: true,
      },
    });

    for (const exp of expiredInProgress) {
      try {
        await autoSubmitExpiredAttemptService({
          examId: exp.examId,
          studentId: exp.studentId,
        });
      } catch (err) {
        console.warn(`[getExamAttemptsService] Failed to auto-submit expired attempt for student ${exp.studentId}:`, err);
      }
    }
  } catch (sweepError) {
    console.error("[getExamAttemptsService] Error sweeping expired attempts:", sweepError);
  }

  const attempts = await prisma.examAttempt.findMany({
    where: {
      examId,
      exam: schoolId ? { schoolId } : undefined,
    },
    include: {
      student: true,
      grades: true,
      exam: {
        include: {
          class: true,
          session: true,
          school: true,
        },
      },
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
    orderBy: {
      totalScore: "desc",
    },
  });

  const gradeIds = attempts.flatMap(a => a.grades.map((g: any) => g.id));
  if (gradeIds.length > 0) {
    const logs = await prisma.gradeAuditLog.findMany({
      where: { gradeId: { in: gradeIds }, newStatus: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' }
    });

    const logMap = new Map();
    for (const log of logs) {
      if (!logMap.has(log.gradeId)) logMap.set(log.gradeId, log);
    }

    const adminIds = [...new Set(logs.filter((l: any) => l.changedByType === 'ADMIN' || l.changedByType === 'SUPER_ADMIN').map((l: any) => l.changedById))];
    const teacherIds = [...new Set(logs.filter((l: any) => l.changedByType === 'TEACHER').map((l: any) => l.changedById))];

    const admins = adminIds.length > 0 ? await prisma.admin.findMany({ where: { id: { in: adminIds } }, select: { id: true, name: true } }) : [];
    const teachers = teacherIds.length > 0 ? await prisma.teacher.findMany({ where: { id: { in: teacherIds } }, select: { id: true, name: true } }) : [];

    const userMap = new Map();
    admins.forEach((a: any) => userMap.set(a.id, a.name));
    teachers.forEach((t: any) => userMap.set(t.id, t.name));

    for (const attempt of attempts) {
      for (const grade of attempt.grades) {
        const log = logMap.get(grade.id);
        if (log) {
          (grade as any).approverName = userMap.get(log.changedById) || 'Admin';
          (grade as any).approvedAt = log.createdAt;
        }
      }
    }
  }

  return attempts;
};

export const getStudentExamAttemptsService = async (studentId: string, page: number = 1, limit: number = 10) => {
  const now = new Date();
  const skip = (page - 1) * limit;

  const where: any = {
    studentId,
    status: {
      in: [ExamAttemptStatus.SUBMITTED, ExamAttemptStatus.SCORED],
    },
    exam: {
      OR: [
        { allowImmediateResult: true },
        {
          AND: [
            { allowImmediateResult: false },
            { resultReleaseAt: { not: null } },
            { resultReleaseAt: { lte: now } }
          ]
        }
      ]
    }
  };

  const [data, total] = await Promise.all([
    prisma.examAttempt.findMany({
      where,
      include: {
        exam: {
          include: {
            class: true,
          },
        },
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
      orderBy: {
        submittedAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.examAttempt.count({ where })
  ]);

  return {
    attempts: data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const deleteExamAttemptService = async ({
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

  // Delete associated grades first
  await prisma.grade.deleteMany({
    where: {
      OR: [
        { examAttemptId: attempt.id },
        { examId, studentId, assessmentType: "EXAM" }
      ]
    },
  });

  // Find all subject exam attempts under this exam attempt
  const subjectAttempts = await prisma.subjectExamAttempt.findMany({
    where: { examAttemptId: attempt.id },
    select: { id: true },
  });
  const subjectAttemptIds = subjectAttempts.map(sa => sa.id);

  if (subjectAttemptIds.length > 0) {
    // Delete all answers under these subject attempts
    await prisma.subjectExamAnswer.deleteMany({
      where: { subjectExamAttemptId: { in: subjectAttemptIds } },
    });

    // Delete grades linked to subjectExamAttempts if any
    await prisma.grade.deleteMany({
      where: { subjectExamAttemptId: { in: subjectAttemptIds } },
    });

    // Delete the subject exam attempts
    await prisma.subjectExamAttempt.deleteMany({
      where: { id: { in: subjectAttemptIds } },
    });
  }

  // Delete the attempt
  return prisma.examAttempt.delete({
    where: { id: attempt.id },
  });
};
