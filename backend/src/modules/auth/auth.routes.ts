import express from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
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
  facebookAuth,
  facebookDataDeletion,
  finalizeCheckoutSetup,
  claimAccount,
  changePassword,
  getUserSessions,
  revokeUserSession,
  getMe,
  generate2FA,
  verify2FA,
  disable2FA,
  login2FA,
  send2FAEmail,
  deactivateAccount,
  requestDataDeletion,
  confirmDeactivation,
} from "./auth.controller";
import { validateZodRequest } from "../../middleware/validateZodRequest";
import {
  verify2FASchema,
  login2FASchema,
  deactivateAccountSchema,
  dataDeletionRequestSchema,
  confirmDeactivationSchema,
} from "./auth.zod";
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
  facebookAuthSchema,
  changePasswordSchema,
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

// Social OAuth (Google & Facebook)
router.post("/google", validateRequest(googleAuthSchema), googleAuth);
router.post("/facebook", validateRequest(facebookAuthSchema), facebookAuth);
router.post("/facebook/data-deletion", facebookDataDeletion);

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
router.post("/login/2fa", loginRateLimiter, validateZodRequest(login2FASchema), login2FA);
router.post("/login/2fa/email", loginRateLimiter, send2FAEmail);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/sessions", authenticateToken, getUserSessions);
router.delete("/sessions/:id", authenticateToken, revokeUserSession);

// Reset password routes
router.post("/password/reset/request", authRateLimiter, requestPasswordReset);
router.get("/password/reset/validate/:token", validateResetToken);
router.post("/password/reset/verify", verifyResetToken);
router.post(
  "/password/reset/complete",
  validateRequest(completePasswordResetSchema),
  completePasswordReset
);

router.post(
  "/password/change",
  authenticateToken,
  authRateLimiter,
  validateRequest(changePasswordSchema),
  changePassword
);

router.post("/finalize-checkout-setup", finalizeCheckoutSetup);

// Account Claim
router.post("/claim-account", claimAccount);

// Current User Profile
router.get("/me", authenticateToken, getMe);

// 2FA Routes
router.post("/2fa/generate", authenticateToken, generate2FA);
router.post("/2fa/verify", authenticateToken, validateZodRequest(verify2FASchema), verify2FA);
router.post("/2fa/disable", authenticateToken, disable2FA);

// User Data Deletion & Account Deactivation
router.post(
  "/account/deactivate",
  authenticateToken,
  validateZodRequest(deactivateAccountSchema),
  deactivateAccount
);
router.post(
  "/account/deletion-request",
  validateZodRequest(dataDeletionRequestSchema),
  requestDataDeletion
);
router.post(
  "/account/confirm-deactivation",
  validateZodRequest(confirmDeactivationSchema),
  confirmDeactivation
);

export default router;
