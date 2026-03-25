import express from "express";
import {
  registerSchool,
  registerTeacher,
  registerStudent,
  registerParent,
  verifyEmailCode,
  requestVerificationCode,
  login,
  refreshToken,
  logout,
  requestPasswordReset,
  validateResetToken,
  verifyResetToken,
  completePasswordReset,
  googleAuth,
} from "./auth.controller";
import { validateRequest } from "../../middleware/validateRequest";
import {
  schoolRegistrationSchema,
  teacherRegistrationSchema,
  studentSchema,
  ParentRegisterSchema,
  requestCodeSchema,
  verifyCodeSchema,
  loginSchema,
  completePasswordResetSchema,
  googleAuthSchema,
} from "./auth.validation";
import { getStudentByCode, linkChildToParent } from "./auth.service";

const router = express.Router();

// Registration
router.post(
  "/register/school",
  validateRequest(schoolRegistrationSchema),
  registerSchool
);
router.post(
  "/register/teacher",
  validateRequest(teacherRegistrationSchema),
  registerTeacher
);
router.post(
  "/register/student",
  validateRequest(studentSchema),
  registerStudent
);
router.post(
  "/register/parents",
  validateRequest(ParentRegisterSchema),
  registerParent
);

// Linking & Retrieval
router.get("/students/code/:studentCode", getStudentByCode);
router.post("/parents/link-child", linkChildToParent);

// Google Auth
router.post("/google", validateRequest(googleAuthSchema), googleAuth);

// Verification
router.post(
  "/request-code",
  validateRequest(requestCodeSchema),
  requestVerificationCode
);
router.post("/verify-code", validateRequest(verifyCodeSchema), verifyEmailCode);

// Login & Session
router.post("/login", validateRequest(loginSchema), login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

// Reset password routes
router.post("/password/reset/request", requestPasswordReset);
router.get("/password/reset/validate/:token", validateResetToken);
router.post("/password/reset/verify", verifyResetToken);
router.post(
  "/password/reset/complete",
  validateRequest(completePasswordResetSchema),
  completePasswordReset
);

export default router;
