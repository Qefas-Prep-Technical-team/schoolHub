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
