import express from "express";
import {
  approveAdmin,
  checkAdminStatus,
  getPendingAdmins,
  rejectAdmin,
  verifyTenantId,
  verifySchoolCode,
  registerAdminSelf,
  getSchoolTeachers,
  getSchoolStudents,
  getSchoolMembers,
  updateAdminProfile,
  verifyStudent,
  createStudent,
  inviteStudent,
  getSchoolAdmins,
  updateAdminRole,
  transferOwnership,
  removeAdmin,
} from "./admin.controller";
import {
  getTeacherById,
  assignTeacherToClass,
  assignTeacherToSubject,
  removeTeacherFromSubject,
  removeTeacherFromClass,
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
  getSchoolTeacherAttendanceTrend,
} from "./teacher-management.controller";
import { authenticateToken } from "@middleware/authMiddleware";
import {
  requireAdmin,
  requireSchoolOwner,
  requireSchoolOwnerOrPrincipal,
} from "./admin.middleware";
import rateLimit from "express-rate-limit";

const resendClaimEmailLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => (req as any).user?.id || req.ip,
  validate: { default: false },
  message: {
    success: false,
    message: "You have exceeded the 5 resend requests limit per day. Please try again tomorrow.",
  },
});

const adminSelfRegisterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,                    // max 5 registration attempts per IP per hour
  validate: { default: false },
  message: {
    success: false,
    message: "Too many registration attempts. Please try again in an hour.",
  },
});

const router = express.Router();

// ─── Public routes (no authentication required) ───────────────────────────────
router.post("/verify-tenant", verifyTenantId);                             // Legacy — keep for backwards compat
router.post("/verify-school-code", verifySchoolCode);                      // NEW — user-friendly school lookup
router.post("/register/admin-self", adminSelfRegisterLimiter, registerAdminSelf); // NEW flow — schoolCode based
router.get("/admin-status/:email", checkAdminStatus);                      // Pending admin can check their status

// ─── All routes below require valid JWT ──────────────────────────────────────
router.use(authenticateToken);

// ─── Team management: SCHOOL_OWNER + PRINCIPAL ───────────────────────────────
router.get("/team", requireAdmin, getSchoolAdmins);                                            // List all school admins
router.get("/pending", requireAdmin, requireSchoolOwnerOrPrincipal, getPendingAdmins);         // List pending requests
router.put("/:adminId/approve", requireAdmin, requireSchoolOwnerOrPrincipal, approveAdmin);    // FIXED — was unsecured
router.put("/:adminId/reject", requireAdmin, requireSchoolOwnerOrPrincipal, rejectAdmin);      // FIXED — was unsecured

// ─── Role & ownership management: SCHOOL_OWNER only ─────────────────────────
router.patch("/team/:adminId/role", requireAdmin, requireSchoolOwner, updateAdminRole);        // Change admin's role
router.post("/team/:adminId/transfer-ownership", requireAdmin, requireSchoolOwner, transferOwnership); // Transfer ownership
router.delete("/team/:adminId", requireAdmin, requireSchoolOwner, removeAdmin);                // Remove admin

// ─── General admin routes (any approved admin) ───────────────────────────────
router.patch("/profile", requireAdmin, updateAdminProfile);
router.get("/members", requireAdmin, getSchoolMembers);

// ─── Teacher management ───────────────────────────────────────────────────────
router.get("/teachers", requireAdmin, getSchoolTeachers);
router.post("/teachers/invite", requireAdmin, inviteTeacher);
router.get("/teachers/attendance/by-date", requireAdmin, getSchoolTeacherAttendanceByDate);
router.get("/teachers/attendance/trend", requireAdmin, getSchoolTeacherAttendanceTrend);
router.post("/teachers/attendance/bulk", requireAdmin, markBulkTeacherAttendance);
router.get("/teachers/:id", requireAdmin, getTeacherById);
router.get("/teachers/:id/timetable", requireAdmin, getTeacherTimetable);
router.post("/teachers/:id/timetable", requireAdmin, createTimetablePeriod);
router.delete("/teachers/:id/timetable/:periodId", requireAdmin, deleteTimetablePeriod);
router.patch("/teachers/:id", requireAdmin, updateTeacher);
router.post("/teachers/:id/assign-class", requireAdmin, assignTeacherToClass);
router.post("/teachers/:id/assign-subject", requireAdmin, assignTeacherToSubject);
router.delete("/teachers/:id/remove-subject/:subjectId", requireAdmin, removeTeacherFromSubject);
router.delete("/teachers/:id/remove-class/:classId", requireAdmin, removeTeacherFromClass);
router.post("/teachers/:id/resend-claim-email", requireAdmin, resendClaimEmailLimiter, resendClaimEmail);
router.get("/teachers/:id/attendance", requireAdmin, getTeacherAttendance);
router.post("/teachers/:id/attendance", requireAdmin, markTeacherAttendance);

// ─── Student management ───────────────────────────────────────────────────────
router.get("/students", requireAdmin, getSchoolStudents);
router.post("/students", requireAdmin, createStudent);
router.post("/students/:id/invite", requireAdmin, inviteStudent);
router.patch("/students/:id/verify", requireAdmin, verifyStudent);

export default router;

