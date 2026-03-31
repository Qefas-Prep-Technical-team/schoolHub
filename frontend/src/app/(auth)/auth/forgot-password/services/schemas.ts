// lib/auth/forgot-password/schemas.ts
import * as yup from "yup";

export const resetPasswordRequestSchema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required")
    .matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, "Invalid email format")
    .trim(),
});

export const resetPasswordSchema = yup.object({
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password must not exceed 50 characters")
    .required("Password is required")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref('password')], "Passwords must match"),
});

export type ResetPasswordRequestFormData = yup.InferType<typeof resetPasswordRequestSchema>;
export type ResetPasswordFormData = yup.InferType<typeof resetPasswordSchema>;