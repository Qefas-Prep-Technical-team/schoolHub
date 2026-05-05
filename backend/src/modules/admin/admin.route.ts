import express from "express";
import {
  approveAdmin,
  checkAdminStatus,
  getPendingAdmins,
  rejectAdmin,
  verifyTenantId,
  registerAdminSelf,
  getSchoolTeachers,
  getSchoolStudents,
  getSchoolMembers,
  updateAdminProfile,
  verifyStudent,
} from "./admin.controller";
import { 
  getTeacherById, 
  assignTeacherToClass,
  updateTeacher,
  getTeacherTimetable,
  createTimetablePeriod,
  inviteTeacher,
  resendClaimEmail
} from "./teacher-management.controller";
import { authenticateToken } from "@middleware/authMiddleware";
import rateLimit from "express-rate-limit";

const resendClaimEmailLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // Limit each IP/Admin to 5 requests per windowMs
  keyGenerator: (req) => {
    return (req as any).user?.id || req.ip;
  },
  message: {
    success: false,
    message: "You have exceeded the 5 resend requests limit per day. Please try again tomorrow.",
  },
});


const router = express.Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new school and admin account
 * @access  Public
 */

// Public routes (no authentication required)
router.post("/verify-tenant", verifyTenantId);
router.post("/register/admin-self", registerAdminSelf);
router.get("/admin-status/:email", checkAdminStatus);

router.use(authenticateToken);

router.get("/pending", getPendingAdmins);
router.get("/teachers", getSchoolTeachers);
router.get("/students", getSchoolStudents);
router.get("/members", getSchoolMembers);
router.patch("/profile", updateAdminProfile);
router.get("/teachers/:id", getTeacherById);
router.get("/teachers/:id/timetable", getTeacherTimetable);
router.post("/teachers/:id/timetable", createTimetablePeriod);
router.patch("/teachers/:id", updateTeacher);
router.post("/teachers/:id/assign-class", assignTeacherToClass);
router.post("/teachers/invite", inviteTeacher);
router.post("/teachers/:id/resend-claim-email", resendClaimEmailLimiter, resendClaimEmail);
router.patch("/students/:id/verify", verifyStudent);
router.put("/:adminId/approve", approveAdmin);
router.put("/:adminId/reject", rejectAdmin);

export default router;
