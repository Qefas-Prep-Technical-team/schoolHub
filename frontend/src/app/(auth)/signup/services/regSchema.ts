import * as yup from "yup";

export const parentSchema = yup.object({
  fullName: yup
    .string()
    .required("Full name is required")
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be less than 100 characters"),

  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),

  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .matches(
      /^(?=.*[a-zA-Z])(?=.*\d)/,
      "Password must contain at least one letter and one number"
    ),

  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),

  studentCode: yup
    .string()
    .optional()
    .test(
      "studentCode-format",
      "Student code must be in format: stu-123456",
      (value) => {
        // If no value provided, it's valid (optional field)
        if (!value || value.trim() === "") return true;

        // If value provided, validate the format
        return /^stu-\d{6}$/.test(value);
      }
    ),
});

export type ParentFormData = yup.InferType<typeof parentSchema>;

// teacher schema

export const teacherSchema = yup.object({
  fullName: yup
    .string()
    .required("Full name is required")
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be less than 100 characters"),

  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),

  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .matches(
      /^(?=.*[a-zA-Z])(?=.*\d)/,
      "Password must contain at least one letter and one number"
    ),

  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),

  tenantId: yup
    .string()
    .optional()
    .test(
      "tenantId-format",
      "Tenant ID must be at least 3 characters",
      (value) => {
        // If no value provided, it's valid (optional field)
        if (!value || value.trim() === "") return true;

        // If value provided, validate minimum length
        return value.trim().length >= 3;
      }
    ),

  isIndependent: yup.boolean().default(false),
});

export type TeacherFormData = yup.InferType<typeof teacherSchema>;

// student

export const studentSchema = yup.object({
  fullName: yup
    .string()
    .required("Full name is required")
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be less than 100 characters"),

  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),

  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .matches(
      /^(?=.*[a-zA-Z])(?=.*\d)/,
      "Password must contain at least one letter and one number"
    ),

  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),

  tenantId: yup
    .string()
    .optional()
    .test(
      "tenantId-format",
      "Tenant ID must be at least 3 characters",
      (value) => {
        if (!value || value.trim() === "") return true;
        return value.trim().length >= 3;
      }
    ),

  teacherCode: yup
    .string()
    .optional()
    .test(
      "teacherCode-format",
      "Teacher code must be in format: tch-123456",
      (value) => {
        if (!value || value.trim() === "") return true;
        return /^tch-\d{6}$/.test(value);
      }
    ),
});

export type StudentFormData = yup.InferType<typeof studentSchema>;

// school

export const schoolSchema = yup.object({
  schoolName: yup
    .string()
    .required("School name is required")
    .min(2, "School name must be at least 2 characters")
    .max(100, "School name must be less than 100 characters"),

  adminName: yup
    .string()
    .required("Admin name is required")
    .min(2, "Admin name must be at least 2 characters")
    .max(100, "Admin name must be less than 100 characters"),

  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),

  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .matches(
      /^(?=.*[a-zA-Z])(?=.*\d)/,
      "Password must contain at least one letter and one number"
    ),

  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),

  subdomain: yup
    .string()
    .optional()
    .test(
      "subdomain-format",
      "Subdomain can only contain letters, numbers, and hyphens",
      (value) => {
        if (!value || value.trim() === "") return true;
        return /^[a-zA-Z0-9-]+$/.test(value);
      }
    )
    .test(
      "subdomain-length",
      "Subdomain must be between 3 and 63 characters",
      (value) => {
        if (!value || value.trim() === "") return true;
        return value.length >= 3 && value.length <= 63;
      }
    ),
});

export type SchoolFormData = yup.InferType<typeof schoolSchema>;
