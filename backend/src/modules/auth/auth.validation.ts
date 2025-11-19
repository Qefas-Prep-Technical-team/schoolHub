import * as yup from "yup";

export const schoolRegistrationSchema = yup.object({
  body: yup.object({
    schoolName: yup.string().required("School name is required"),
    adminName: yup.string().required("Admin name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], "Passwords must match")
      .required("Confirm password is required"),
    subdomain: yup.string().optional(),
  }),
});


export const teacherRegistrationSchema =  yup.object({
  body: yup.object({
  fullName: yup.string()
    .trim()
    .required("Full Name is required")
    .min(2, "Name must be at least 2 characters"),

  email: yup.string()
    .trim()
    .email("Invalid email format")
    .required("Email is required"),

  password: yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),

   confirmPassword: yup.string()
      .oneOf([yup.ref("password")], "Passwords must match")
      .required("Confirm password is required"),
  tenantId: yup.string()
    .optional()
    .matches(/^\d{6}$/, "Tenant ID must be a 6-digit code")
    .nullable(),
  }),
});


export const studentSchema = yup.object({
  body: yup.object({
    fullName: yup.string()
      .required("Full name is required")
      .min(2, "Name must be at least 2 characters"),
    email: yup.string()
      .email("Invalid email")
      .required("Email is required"),
    password: yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: yup.string()
      .oneOf([yup.ref("password")], "Passwords must match")
      .required("Confirm password is required"),
    tenantId: yup.string()
      .optional()
      .matches(/^\d{6}$/, "Tenant ID must be a 6-digit code")
      .nullable(),
    teacherCode: yup.string()
      .optional()
      .nullable(),
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
      .min(6, "Password must be at least 6 characters"),

    confirmPassword: yup
      .string()
      .required("Confirm password is required")
      .oneOf([yup.ref("password")], "Passwords do not match"),

    studentCode: yup  // Changed from studentCodeOrEmail
      .string()
      .optional()
      .matches(/^stu-\d{6}$/, "Student code format: stu-123456")
      .nullable()
      .transform((value) => value === "" ? null : value),
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
    code: yup.string().length(6, "Code must be 6 digits").required("Code is required"),
  }),
});