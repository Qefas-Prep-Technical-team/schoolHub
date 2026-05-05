import express from "express";
import {
  registerSchool,
  registerTeacher,
  registerStudent,
  registerParent,
  verifyEmailCode,
  verifyCheckoutCode,
  checkEmail,
  requestVerificationCode,
  login,
  refreshToken,
  logout,
  requestPasswordReset,
  validateResetToken,
  verifyResetToken,
  completePasswordReset,
  googleAuth,
  finalizeCheckoutSetup,
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
import { authRateLimiter, loginRateLimiter } from "../../middleware/rateLimiter";

const router = express.Router();

// Registration
router.post(
  "/register/school",
  authRateLimiter,
  validateRequest(schoolRegistrationSchema),
  registerSchool
);
router.post(
  "/register/teacher",
  authRateLimiter,
  validateRequest(teacherRegistrationSchema),
  registerTeacher
);
router.post(
  "/register/student",
  authRateLimiter,
  validateRequest(studentSchema),
  registerStudent
);
router.post(
  "/register/parents",
  authRateLimiter,
  validateRequest(ParentRegisterSchema),
  registerParent
);

// Linking & Retrieval
router.get("/students/code/:studentCode", getStudentByCode);
router.post("/parents/link-child", linkChildToParent);

// Google Auth
router.post("/google", validateRequest(googleAuthSchema), googleAuth);

// Verification
router.post("/check-email", checkEmail);
router.post(
  "/request-code",
  validateRequest(requestCodeSchema),
  requestVerificationCode
);
router.post("/verify-code", validateRequest(verifyCodeSchema), verifyEmailCode);
router.post("/verify-checkout-code", validateRequest(verifyCodeSchema), verifyCheckoutCode);

// Login & Session
router.post("/login", loginRateLimiter, validateRequest(loginSchema), login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

// Reset password routes
router.post("/password/reset/request", authRateLimiter, requestPasswordReset);
router.get("/password/reset/validate/:token", validateResetToken);
router.post("/password/reset/verify", verifyResetToken);
router.post(
  "/password/reset/complete",
  validateRequest(completePasswordResetSchema),
  completePasswordReset
);

router.post("/finalize-checkout-setup", finalizeCheckoutSetup);

export default router;
