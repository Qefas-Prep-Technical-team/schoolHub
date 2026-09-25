import { z } from "zod";
import { Term } from "@prisma/client";

export const getClassSubjectResultsSchema = z.object({
  query: z.object({
    sessionId: z.string().uuid("Invalid session ID").optional(),
    term: z.nativeEnum(Term).optional(),
    classId: z.string().uuid("Invalid class ID").optional(),
  }),
});

export const getStudentTermResultsSchema = z.object({
  query: z.object({
    sessionId: z.string().uuid("Invalid session ID").optional(),
    term: z.nativeEnum(Term).optional(),
    classId: z.string().uuid("Invalid class ID").optional(),
    studentId: z.string().uuid("Invalid student ID").optional(),
  }),
});

export const createClassSubjectResultSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    classId: z.string().uuid("Invalid class ID"),
    subjectId: z.string().uuid("Invalid subject ID"),
    sessionId: z.string().uuid("Invalid session ID"),
    term: z.nativeEnum(Term),
    departmentId: z.string().uuid("Invalid department ID").optional().nullable(),
    revealDate: z.string().datetime().optional().nullable(),
    releaseDate: z.string().datetime().optional().nullable(),
    assignmentMax: z.number().optional().nullable(),
    quizMax: z.number().optional().nullable(),
    caMax: z.number().optional().nullable(),
    examMax: z.number().optional().nullable(),
  }),
});
export const getClassSubjectResultByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid result ID"),
  }),
});

export const updateClassSubjectResultSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid result ID"),
  }),
  body: z.object({
    name: z.string().min(1, "Name is required").optional(),
    revealDate: z.string().datetime().optional().nullable(),
    releaseDate: z.string().datetime().optional().nullable(),
    assignmentMax: z.number().optional().nullable(),
    quizMax: z.number().optional().nullable(),
    caMax: z.number().optional().nullable(),
    examMax: z.number().optional().nullable(),
    classId: z.string().uuid().optional().nullable(),
    departmentId: z.string().uuid().optional().nullable(),
    subjectId: z.string().uuid().optional().nullable(),
  }),
});

export const getStudentSubjectResultsSchema = z.object({
  query: z.object({
    classId: z.string().uuid("Invalid class ID"),
    subjectId: z.string().uuid("Invalid subject ID"),
    sessionId: z.string().uuid("Invalid session ID"),
    term: z.nativeEnum(Term),
  }),
});

export const bulkUpsertStudentSubjectResultsSchema = z.object({
  body: z.object({
    classId: z.string().uuid("Invalid class ID"),
    subjectId: z.string().uuid("Invalid subject ID"),
    sessionId: z.string().uuid("Invalid session ID"),
    term: z.nativeEnum(Term),
    scores: z.array(
      z.object({
        studentId: z.string().uuid("Invalid student ID"),
        assignmentScore: z.number().optional().nullable(),
        quizScore: z.number().optional().nullable(),
        caScore: z.number().optional().nullable(),
        examScore: z.number().optional().nullable(),
        scoreSources: z.any().optional(),
      })
    ).min(1, "At least one score entry is required"),
  }),
});
