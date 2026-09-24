import { z } from "zod";
import { Term } from "@prisma/client";

export const upsertTermlyEvaluationSchema = z.object({
  classId: z.string().uuid(),
  sessionId: z.string().uuid(),
  term: z.nativeEnum(Term),
  
  // Affective Domain
  attentiveness: z.number().int().min(1).max(5).optional().nullable(),
  honesty: z.number().int().min(1).max(5).optional().nullable(),
  neatness: z.number().int().min(1).max(5).optional().nullable(),
  politeness: z.number().int().min(1).max(5).optional().nullable(),
  punctuality: z.number().int().min(1).max(5).optional().nullable(),
  selfControl: z.number().int().min(1).max(5).optional().nullable(),
  obedience: z.number().int().min(1).max(5).optional().nullable(),
  reliability: z.number().int().min(1).max(5).optional().nullable(),
  responsibility: z.number().int().min(1).max(5).optional().nullable(),
  relationship: z.number().int().min(1).max(5).optional().nullable(),

  // Psychomotor Skills
  handlingTools: z.number().int().min(1).max(5).optional().nullable(),
  drawingPainting: z.number().int().min(1).max(5).optional().nullable(),
  handwriting: z.number().int().min(1).max(5).optional().nullable(),
  publicSpeaking: z.number().int().min(1).max(5).optional().nullable(),
  speechFluency: z.number().int().min(1).max(5).optional().nullable(),
  sportsGames: z.number().int().min(1).max(5).optional().nullable(),

  // Remarks
  teacherRemark: z.string().optional().nullable(),
  principalRemark: z.string().optional().nullable(),
});

export type UpsertTermlyEvaluationInput = z.infer<typeof upsertTermlyEvaluationSchema>;
