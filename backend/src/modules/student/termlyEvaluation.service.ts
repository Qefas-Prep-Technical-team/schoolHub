import { Term } from "@prisma/client";
import { UpsertTermlyEvaluationInput } from "./termlyEvaluation.schema";
import prisma from "../../config/database";


export const upsertTermlyEvaluation = async (
  studentId: string,
  data: UpsertTermlyEvaluationInput
) => {
  const { classId, sessionId, term, ...evaluationData } = data;

  const evaluation = await prisma.termlyEvaluation.upsert({
    where: {
      studentId_classId_sessionId_term: {
        studentId,
        classId,
        sessionId,
        term,
      },
    },
    update: {
      ...evaluationData,
    },
    create: {
      studentId,
      classId,
      sessionId,
      term,
      ...evaluationData,
    },
  });

  return evaluation;
};

export const getTermlyEvaluation = async (
  studentId: string,
  classId: string,
  sessionId: string,
  term: Term
) => {
  return await prisma.termlyEvaluation.findUnique({
    where: {
      studentId_classId_sessionId_term: {
        studentId,
        classId,
        sessionId,
        term,
      },
    },
  });
};

export const getClassTermlyEvaluations = async (
  classId: string,
  sessionId: string,
  term: Term
) => {
  return await prisma.termlyEvaluation.findMany({
    where: {
      classId,
      sessionId,
      term,
    },
  });
};

export const bulkUpsertClassTermlyEvaluations = async (
  classId: string,
  sessionId: string,
  term: Term,
  evaluations: Array<{
    studentId: string;
    attentiveness?: number | null;
    honesty?: number | null;
    neatness?: number | null;
    politeness?: number | null;
    punctuality?: number | null;
    selfControl?: number | null;
    obedience?: number | null;
    reliability?: number | null;
    responsibility?: number | null;
    relationship?: number | null;
    handlingTools?: number | null;
    drawingPainting?: number | null;
    handwriting?: number | null;
    publicSpeaking?: number | null;
    speechFluency?: number | null;
    sportsGames?: number | null;
    teacherRemark?: string | null;
    principalRemark?: string | null;
  }>
) => {
  const upsertPromises = evaluations.map((item) => {
    const { studentId, ...data } = item;
    return prisma.termlyEvaluation.upsert({
      where: {
        studentId_classId_sessionId_term: {
          studentId,
          classId,
          sessionId,
          term,
        },
      },
      update: {
        ...data,
      },
      create: {
        studentId,
        classId,
        sessionId,
        term,
        ...data,
      },
    });
  });

  return await prisma.$transaction(upsertPromises);
};
