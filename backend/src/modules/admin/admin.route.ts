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
  createStudent,
  inviteStudent,
} from "./admin.controller";
import { 
  getTeacherById, 
  assignTeacherToClass,
  assignTeacherToSubject,
  removeTeacherFromSubject,
  updateTeacher,
  getTeacherTimetable,
  createTimetablePeriod,
  deleteTimetablePeriod,
  inviteTeacher,
  resendClaimEmail,
  getTeacherAttendance,
  markTeacherAttendance,
  markBulkTeacherAttendance,
  getSchoolTeacherAttendanceByDate,
  getSchoolTeacherAttendanceTrend
} from "./teacher-management.controller";
import { authenticateToken } from "@middleware/authMiddleware";
import rateLimit from "express-rate-limit";

const resendClaimEmailLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // Limit each IP/Admin to 5 requests per windowMs
  keyGenerator: (req) => {
    return (req as any).user?.id || req.ip;
  },
  validate: { default: false },
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
router.post("/students", createStudent);
router.post("/students/:id/invite", inviteStudent);
router.get("/members", getSchoolMembers);
router.patch("/profile", updateAdminProfile);
router.get("/teachers/:id", getTeacherById);
router.get("/teachers/:id/timetable", getTeacherTimetable);
router.post("/teachers/:id/timetable", createTimetablePeriod);
router.delete("/teachers/:id/timetable/:periodId", deleteTimetablePeriod);
router.patch("/teachers/:id", updateTeacher);
router.post("/teachers/:id/assign-class", assignTeacherToClass);
router.post("/teachers/:id/assign-subject", assignTeacherToSubject);
router.delete("/teachers/:id/remove-subject/:subjectId", removeTeacherFromSubject);
router.post("/teachers/invite", inviteTeacher);
router.post("/teachers/:id/resend-claim-email", resendClaimEmailLimiter, resendClaimEmail);
router.get("/teachers/attendance/by-date", getSchoolTeacherAttendanceByDate);
router.get("/teachers/attendance/trend", getSchoolTeacherAttendanceTrend);
router.post("/teachers/attendance/bulk", markBulkTeacherAttendance);
router.get("/teachers/:id/attendance", getTeacherAttendance);
router.post("/teachers/:id/attendance", markTeacherAttendance);
router.patch("/students/:id/verify", verifyStudent);
router.put("/:adminId/approve", approveAdmin);
router.put("/:adminId/reject", rejectAdmin);

export default router;
