import * as yup from "yup";

export const schoolRegistrationSchema = yup.object({
  body: yup.object({
    schoolName: yup
      .string()
      .trim()
      .required("School name is required")
      .min(2, "School name must be at least 2 characters")
      .max(100, "School name must be less than 100 characters"),

    adminName: yup
      .string()
      .trim()
      .required("Admin name is required")
      .min(2, "Admin name must be at least 2 characters")
      .max(100, "Admin name must be less than 100 characters"),

    email: yup
      .string()
      .trim()
      .lowercase()
      .email("Invalid email")
      .required("Email is required"),

    password: yup
      .string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be less than 72 characters")
      .matches(/^\S+$/, "Password must not contain spaces")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/\d/, "Password must contain at least one number")
      .matches(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character",
      ),

    confirmPassword: yup
      .string()
      .required("Confirm password is required")
      .oneOf([yup.ref("password")], "Passwords must match"),

    subdomain: yup
      .string()
      .trim()
      .lowercase()
      .matches(
        /^[a-z0-9-]*$/,
        "Subdomain can only contain lowercase letters, numbers, and hyphens",
      )
      .min(3, "Subdomain must be at least 3 characters")
      .max(63, "Subdomain must be less than 63 characters")
      .optional(),
  }),
});

export const teacherRegistrationSchema = yup.object({
  body: yup.object({
    fullName: yup
      .string()
      .trim()
      .required("Full Name is required")
      .min(2, "Name must be at least 2 characters"),

    email: yup
      .string()
      .trim()
      .email("Invalid email format")
      .required("Email is required"),

    password: yup
      .string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be less than 72 characters")
      .matches(/^\S+$/, "Password must not contain spaces")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/\d/, "Password must contain at least one number")
      .matches(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character",
      ),

    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], "Passwords must match")
      .required("Confirm password is required"),
    tenantId: yup
      .string()
      .optional()
      // .matches(/^\d{10}$/, "Tenant ID must be a 6-digit code")
      .nullable(),
  }),
});

export const studentSchema = yup.object({
  body: yup.object({
    fullName: yup
      .string()
      .required("Full name is required")
      .min(2, "Name must be at least 2 characters"),
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup
      .string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be less than 72 characters")
      .matches(/^\S+$/, "Password must not contain spaces")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/\d/, "Password must contain at least one number")
      .matches(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character",
      ),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], "Passwords must match")
      .required("Confirm password is required"),
    tenantId: yup
      .string()
      .optional()
      .matches(/^\d{6}$/, "Tenant ID must be a 6-digit code")
      .nullable(),
    teacherCode: yup.string().optional().nullable(),
  }),
});

export const ParentRegisterSchema = yup.object({
  body: yup.object({
    fullName: yup
      .string()
      .required("Full name is required")
      .min(3, "Full name must be at least 3 characters")
      .max(50, "Full name must be less than 50 characters"),

    email: yup
      .string()
      .required("Email is required")
      .email("Enter a valid email"),

    password: yup
      .string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be less than 72 characters")
      .matches(/^\S+$/, "Password must not contain spaces")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/\d/, "Password must contain at least one number")
      .matches(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character",
      ),

    confirmPassword: yup
      .string()
      .required("Confirm password is required")
      .oneOf([yup.ref("password")], "Passwords do not match"),

    studentCode: yup // Changed from studentCodeOrEmail
      .string()
      .optional()
      .matches(/^stu-\d{6}$/, "Student code format: stu-123456")
      .nullable()
      .transform((value) => (value === "" ? null : value)),
  }),
});

export const requestCodeSchema = yup.object({
  body: yup.object({
    email: yup.string().email("Invalid email").required("Email is required"),
  }),
});

export const verifyCodeSchema = yup.object({
  body: yup.object({
    email: yup.string().email("Invalid email").required("Email is required"),
    code: yup
      .string()
      .length(6, "Code must be 6 digits")
      .required("Code is required"),
  }),
});

export const loginSchema = yup.object({
  body: yup.object({
    email: yup
      .string()
      .email("Invalid email format")
      .required("Email is required"),
    password: yup.string().required("Password is required"),
    userType: yup
      .string()
      .oneOf(["ADMIN", "TEACHER", "STUDENT", "PARENT"], "Invalid user type")
      .required("User type is required"),
  }),
});

export const completePasswordResetSchema = yup.object({
  body: yup.object({
    token: yup.string().required("Reset token is required"),

    newPassword: yup
      .string()
      .required("New password is required")
      .min(8, "Password must be at least 8 characters long")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .matches(
        /[@$!%*?&]/,
        "Password must contain at least one special character",
      ),

    confirmPassword: yup
      .string()
      .required("Confirm password is required")
      .oneOf([yup.ref("newPassword")], "Passwords must match"),
  }),
});
