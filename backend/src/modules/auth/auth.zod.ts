import { z } from "zod";

export const verify2FASchema = z.object({
  body: z.object({
    code: z
      .string()
      .length(6, "Code must be exactly 6 digits")
      .regex(/^\d+$/, "Code must contain only numbers"),
  }),
});

export const login2FASchema = z.object({
  body: z.object({
    tempToken: z.string().min(1, "Temporary token is required"),
    code: z
      .string()
      .length(6, "Code must be exactly 6 digits")
      .regex(/^\d+$/, "Code must contain only numbers"),
  }),
});

export const deactivateAccountSchema = z.object({
  body: z.object({
    reason: z.string().optional(),
    password: z.string().min(1, "Password is required to confirm account deactivation"),
  }),
});

export const dataDeletionRequestSchema = z.object({
  body: z.object({
    email: z.string().email("A valid email address is required"),
    role: z.enum(["ADMIN", "TEACHER", "STUDENT", "PARENT"]),
    reason: z.string().optional(),
    confirmAcknowledgment: z.boolean().refine((val) => val === true, {
      message: "You must confirm acknowledgment of the data deletion policy",
    }),
  }),
});

export const confirmDeactivationSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Confirmation token is required"),
    ticketId: z.string().min(1, "Reference ticket ID is required"),
  }),
});

