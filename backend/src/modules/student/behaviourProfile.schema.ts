import { z } from "zod";

export const updateBehaviourProfileSchema = z.object({
  conductScore: z.number().int().min(0).max(100).optional(),
  strengths: z
    .array(
      z.object({
        name: z.string().min(1, "Strength name is required"),
        description: z.string().min(1, "Strength description is required"),
        icon: z.string().min(1, "Strength icon is required"),
      })
    )
    .optional(),
});

export type UpdateBehaviourProfileInput = z.infer<typeof updateBehaviourProfileSchema>;
