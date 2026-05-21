import { z } from "zod";

export const createStudentSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  classId: z.string().uuid("Invalid class ID – must be a valid UUID"),
  // schoolId is optional here; the controller will auto-resolve it from the
  // authenticated admin's SchoolAdmin record when not provided or invalid.
  schoolId: z.string().uuid().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
