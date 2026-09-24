import { PrismaClient, Term } from "@prisma/client";
import { UpsertTermlyEvaluationInput } from "./termlyEvaluation.schema";

const prisma = new PrismaClient();

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
