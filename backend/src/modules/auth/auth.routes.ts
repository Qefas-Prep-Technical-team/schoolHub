import express from "express";
import { registerSchool,registerTeacher,registerStudent, registerParent, verifyEmailCode, requestVerificationCode, login, refreshToken, logout, requestPasswordReset, 
  validateResetToken,
  verifyResetToken,
  completePasswordReset
} from "./auth.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { schoolRegistrationSchema ,teacherRegistrationSchema,studentSchema, ParentRegisterSchema, requestCodeSchema, verifyCodeSchema, loginSchema, completePasswordResetSchema} from "./auth.validation";
import { getStudentByCode, linkChildToParent } from "./auth.service";

const router = express.Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new school and admin account
 * @access  Public
 */
router.post(
  "/register/school",
  validateRequest(schoolRegistrationSchema),
  registerSchool
);

router.post("/register/teacher",
  validateRequest(teacherRegistrationSchema),
   registerTeacher
  );

  router.post(
  "/register/student",
  validateRequest(studentSchema),
  registerStudent
);

router.post('/register/parents', validateRequest(ParentRegisterSchema), registerParent);
router.get('/students/code/:studentCode', getStudentByCode);
router.post('/parents/link-child', linkChildToParent);


// code verification 
router.post("/request-code", validateRequest(requestCodeSchema), requestVerificationCode);

router.post("/verify-code", validateRequest(verifyCodeSchema), verifyEmailCode);

// login 
router.post("/login", validateRequest(loginSchema),login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

// Reset password routes
router.post('/password/reset/request', requestPasswordReset); // Send reset email
router.get('/password/reset/validate/:token', validateResetToken); // Check if token is valid
router.post('/password/reset/verify', verifyResetToken); // Verify token (optional step)
router.post('/password/reset/complete',  validateRequest(completePasswordResetSchema),completePasswordReset); // Set new password
export default router;


