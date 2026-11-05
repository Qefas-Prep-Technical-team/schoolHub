import { z } from "zod";

export const TutorialStepSchema = z.object({
  title: z.string().min(1, "Step title is required"),
  description: z.string().min(1, "Step description is required"),
  tips: z.string().optional(),
});

export const TutorialFaqSchema = z.object({
  q: z.string().min(1, "Question is required"),
  a: z.string().min(1, "Answer is required"),
});

export const TutorialItemSchema = z.object({
  id: z.string().min(1, "ID is required"),
  title: z.string().min(1, "Title is required"),
  summary: z.string().min(1, "Summary is required"),
  role: z.enum(["ALL", "ADMIN", "TEACHER", "STUDENT", "PARENT"]),
  category: z.enum(["Setup", "Academics", "Assessments", "Billing", "Communication", "General"]),
  duration: z.string().default("5:00"),
  videoUrl: z.string().min(1, "Video URL is required"),
  thumbnail: z.string().min(1, "Thumbnail is required"),
  featured: z.boolean().default(false).optional(),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).default("Beginner"),
  steps: z.array(TutorialStepSchema).default([]),
  keyTakeaways: z.array(z.string()).default([]),
  faqs: z.array(TutorialFaqSchema).optional(),
  richTextGuide: z.string().optional().nullable(),
  order: z.number().int().optional(),
  isPublished: z.boolean().default(true).optional(),
});

export const SaveTutorialsSchema = z.object({
  tutorials: z.array(TutorialItemSchema),
});

export type TutorialStep = z.infer<typeof TutorialStepSchema>;
export type TutorialFaq = z.infer<typeof TutorialFaqSchema>;
export type TutorialItem = z.infer<typeof TutorialItemSchema>;

