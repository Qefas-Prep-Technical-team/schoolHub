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
