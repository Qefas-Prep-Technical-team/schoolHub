import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .lowercase()
    .email("Please enter a valid email address")
    .required("Email is required"),

  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be less than 72 characters"),
});

export type LoginFormData = yup.InferType<typeof loginSchema>;
