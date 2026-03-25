import prisma from "../../config/database";
import { createNotification } from "../notification/notification.service";
import {
  AssessmentStatus,
  ExamMode,
  QuestionSource,
  QuestionType,
  SubjectPaperStatus,
} from "@prisma/client";
import { validateExamQuestionInput } from "./exam.validation";

export const createExamService = async ({
  title,
  description,
  scope,
  creationMode,
  mode,
  schoolId,
  departmentId,
  classId,
  sessionId,
  durationMinutes,
  aiPrompt,
  instructions,
}: {
  title: string;
  description?: string;
  scope: any;
  creationMode: any;
  mode: ExamMode;
  schoolId?: string;
  departmentId?: string;
  classId?: string;
  sessionId?: string;
  durationMinutes?: number;
  aiPrompt?: string;
  instructions?: string;
}) => {
  return prisma.exam.create({
    data: {
      title,
      description: description || null,
      scope,
      creationMode,
      mode,
      schoolId: schoolId || null,
      departmentId: departmentId || null,
      classId: classId || null,
      sessionId: sessionId || null,
      durationMinutes: durationMinutes || null,
      aiPrompt: aiPrompt || null,
      instructions: instructions || null,
    },
    include: {
      school: true,
      department: true,
      class: true,
      session: true,
      subjectPapers: true,
    },
  });
};

export const createSubjectPaperService = async ({
  examId,
  subjectId,
  teacherId,
  title,
  instructions,
  durationMinutes,
}: {
  examId: string;
  subjectId: string;
  teacherId?: string;
  title?: string;
  instructions?: string;
  durationMinutes?: number;
}) => {
  return prisma.subjectExamPaper.create({
    data: {
      examId,
      subjectId,
      teacherId: teacherId || null,
      title: title || null,
      instructions: instructions || null,
      durationMinutes: durationMinutes || null,
    },
    include: {
      exam: true,
      subject: true,
      teacher: true,
    },
  });
};

export const addManualQuestionsToPaperService = async ({
  subjectPaperId,
  questions,
}: {
  subjectPaperId: string;
  questions: Array<{
    type: QuestionType;
    question: string;
    optionA?: string;
    optionB?: string;
    optionC?: string;
    optionD?: string;
    correctAnswer: string;
    explanation?: string;
    marks?: number;
  }>;
}) => {
  const paper = await prisma.subjectExamPaper.findUnique({
    where: { id: subjectPaperId },
  });

  if (!paper) throw new Error("Subject paper not found");
  if (paper.status === SubjectPaperStatus.PUBLISHED) {
    throw new Error("You cannot edit a published paper");
  }

  for (const q of questions) {
    validateExamQuestionInput({ ...q, marks: q.marks || 1 });
  }

  await prisma.subjectExamQuestion.createMany({
    data: questions.map((q) => ({
      subjectPaperId,
      type: q.type,
      source: QuestionSource.MANUAL,
      question: q.question,
      optionA: q.optionA || null,
      optionB: q.optionB || null,
      optionC: q.optionC || null,
      optionD: q.optionD || null,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || null,
      marks: q.marks || 1,
    })),
  });

  const all = await prisma.subjectExamQuestion.findMany({
    where: { subjectPaperId },
  });

  const totalMarks = all.reduce((sum, q) => sum + Number(q.marks || 0), 0);

  return prisma.subjectExamPaper.update({
    where: { id: subjectPaperId },
    data: { totalMarks },
    include: { questions: true },
  });
};

export const addAIQuestionsToPaperService = async ({
  subjectPaperId,
  questions,
}: {
  subjectPaperId: string;
  questions: Array<{
    type: QuestionType;
    question: string;
    optionA?: string;
    optionB?: string;
    optionC?: string;
    optionD?: string;
    correctAnswer: string;
    explanation?: string;
    marks?: number;
  }>;
}) => {
  const paper = await prisma.subjectExamPaper.findUnique({
    where: { id: subjectPaperId },
  });

  if (!paper) throw new Error("Subject paper not found");
  if (paper.status === SubjectPaperStatus.PUBLISHED) {
    throw new Error("You cannot edit a published paper");
  }

  for (const q of questions) {
    validateExamQuestionInput({ ...q, marks: q.marks || 1 });
  }

  await prisma.subjectExamQuestion.createMany({
    data: questions.map((q) => ({
      subjectPaperId,
      type: q.type,
      source: QuestionSource.AI,
      question: q.question,
      optionA: q.optionA || null,
      optionB: q.optionB || null,
      optionC: q.optionC || null,
      optionD: q.optionD || null,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || null,
      marks: q.marks || 1,
    })),
  });

  const all = await prisma.subjectExamQuestion.findMany({
    where: { subjectPaperId },
  });

  const totalMarks = all.reduce((sum, q) => sum + Number(q.marks || 0), 0);

  return prisma.subjectExamPaper.update({
    where: { id: subjectPaperId },
    data: { totalMarks },
    include: { questions: true },
  });
};

export const validateSubjectPaperService = async (subjectPaperId: string) => {
  const paper = await prisma.subjectExamPaper.findUnique({
    where: { id: subjectPaperId },
    include: { questions: true },
  });

  if (!paper) throw new Error("Subject paper not found");
  if (!paper.questions.length) {
    throw new Error("Subject paper must have at least one question");
  }

  for (const q of paper.questions) {
    validateExamQuestionInput({
      type: q.type,
      question: q.question,
      optionA: q.optionA || undefined,
      optionB: q.optionB || undefined,
      optionC: q.optionC || undefined,
      optionD: q.optionD || undefined,
      correctAnswer: q.correctAnswer,
      marks: Number(q.marks),
    });
  }

  return prisma.subjectExamPaper.update({
    where: { id: subjectPaperId },
    data: {
      status: SubjectPaperStatus.APPROVED,
      validatedAt: new Date(),
    },
    include: { questions: true },
  });
};

export const publishSubjectPaperService = async (subjectPaperId: string) => {
  const paper = await prisma.subjectExamPaper.findUnique({
    where: { id: subjectPaperId },
    include: { questions: true },
  });

  if (!paper) throw new Error("Subject paper not found");
  if (!paper.questions.length) {
    throw new Error("Subject paper must have at least one question");
  }

  return prisma.subjectExamPaper.update({
    where: { id: subjectPaperId },
    data: {
      status: SubjectPaperStatus.PUBLISHED,
      publishedAt: new Date(),
    },
    include: { questions: true },
  });
};

export const validateExamService = async (examId: string) => {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      subjectPapers: true,
    },
  });

  if (!exam) throw new Error("Exam not found");
  if (!exam.subjectPapers.length) {
    throw new Error("Exam must have at least one subject paper");
  }

  const unpublished = exam.subjectPapers.filter(
    (paper) => paper.status !== SubjectPaperStatus.PUBLISHED
  );

  if (unpublished.length) {
    throw new Error("All subject papers must be published before exam validation");
  }

  const totalMarks = exam.subjectPapers.reduce(
    (sum, p) => sum + Number(p.totalMarks || 0),
    0
  );

  return prisma.exam.update({
    where: { id: examId },
    data: {
      totalMarks,
      validatedAt: new Date(),
    },
    include: { subjectPapers: true },
  });
};

export const publishExamService = async (examId: string) => {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      subjectPapers: true,
    },
  });

  if (!exam) throw new Error("Exam not found");
  if (!exam.subjectPapers.length) {
    throw new Error("Exam must have at least one subject paper");
  }

  const unpublished = exam.subjectPapers.filter(
    (paper) => paper.status !== SubjectPaperStatus.PUBLISHED
  );

  if (unpublished.length) {
    throw new Error("All subject papers must be published before publishing exam");
  }

  const totalMarks = exam.subjectPapers.reduce(
    (sum, p) => sum + Number(p.totalMarks || 0),
    0
  );

  const updatedExam = await prisma.exam.update({
    where: { id: examId },
    data: {
      status: AssessmentStatus.PUBLISHED,
      validatedAt: exam.validatedAt || new Date(),
      publishedAt: new Date(),
      totalMarks,
    },
    include: { subjectPapers: true },
  });

  if (exam.classId) {
    const enrollments = await prisma.classEnrollment.findMany({
      where: { classId: exam.classId },
    });
    
    Promise.all(
      enrollments.map((enrollment) =>
        createNotification({
          recipientType: "STUDENT",
          recipientId: enrollment.studentId,
          type: "GENERAL",
          title: "New Exam Published!",
          message: `A new exam "${exam.title}" has been scheduled for your class.`,
          meta: { examId: exam.id },
        })
      )
    ).catch((err) => console.error("Failed to scatter exam notifications:", err));
  }

  return updatedExam;
};
