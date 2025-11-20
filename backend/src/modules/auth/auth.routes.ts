import express from "express";
import { registerSchool,registerTeacher,registerStudent, registerParent, verifyEmailCode, requestVerificationCode, login, refreshToken, logout } from "./auth.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { schoolRegistrationSchema ,teacherRegistrationSchema,studentSchema, ParentRegisterSchema, requestCodeSchema, verifyCodeSchema, loginSchema} from "./auth.validation";
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
export default router;
