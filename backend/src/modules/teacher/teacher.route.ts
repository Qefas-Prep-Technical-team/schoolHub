import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import {
    getTeacherDashboardStats,
    getTeacherLinkedSchools,
    getTeacherPerformanceTrends,
    getTeacherStudents,
    getTeacherClasses,
    getTeacherClassDetail,
    getTeacherClassAssignments,
    getTeacherClassGrades,
    updateTeacherClassStudentGrade,
    deleteTeacherClassStudentGrade,
    getTeacherSubjects,
    getTeacherProfile,
    updateTeacherProfile,
    requestTeacherEmailUpdate,
    confirmTeacherEmailUpdate,
    getTeacherSettings,
    updateTeacherSettings,
} from "./teacher-dashboard.controller";

const router = Router();

// All teacher dashboard routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/v1/teacher/dashboard-stats
 * @desc    Get dashboard statistics for the authenticated teacher
 * @access  Private-Teacher
 */
router.get("/dashboard-stats", getTeacherDashboardStats);

/**
 * @route   GET /api/v1/teacher/linked-schools
 * @desc    Get all schools linked to the authenticated teacher
 * @access  Private-Teacher
 */
router.get("/linked-schools", getTeacherLinkedSchools);

/**
 * @route   GET /api/v1/teacher/performance-trends
 * @desc    Get performance trends for the authenticated teacher
 * @access  Private-Teacher
 */
router.get("/performance-trends", getTeacherPerformanceTrends);

/**
 * @route   GET /api/v1/teacher/students
 * @desc    Get all students linked to the teacher's classes
 * @access  Private-Teacher
 */
router.get("/students", getTeacherStudents);

/**
 * @route   GET /api/v1/teacher/classes
 * @desc    Get all classes assigned to the authenticated teacher
 * @access  Private-Teacher
 */
router.get("/classes", getTeacherClasses);

/**
 * @route   GET /api/v1/teacher/subjects
 * @desc    Get all subjects assigned to the teacher
 * @access  Private-Teacher
 */
router.get("/subjects", getTeacherSubjects);

/**
 * @route   GET /api/v1/teacher/classes/:classId
 * @desc    Get detailed data for a specific class
 * @access  Private-Teacher
 */
router.get("/classes/:classId", getTeacherClassDetail);

/**
 * @route   GET /api/v1/teacher/classes/:classId/assignments
 * @desc    Get assignments/exams for a specific class
 * @access  Private-Teacher
 */
router.get("/classes/:classId/assignments", getTeacherClassAssignments);

/**
 * @route   GET /api/v1/teacher/classes/:classId/grades
 * @desc    Get grades for students in a specific class
 * @access  Private-Teacher
 */
router.get("/classes/:classId/grades", getTeacherClassGrades);

/**
 * @route   PATCH /api/v1/teacher/classes/:classId/grades/student/:studentId
 * @desc    Update aggregate CA and EXAM grades for a student
 * @access  Private-Teacher
 */
router.patch("/classes/:classId/grades/student/:studentId", updateTeacherClassStudentGrade);

/**
 * @route   DELETE /api/v1/teacher/classes/:classId/grades/:gradeId
 * @desc    Delete an individual grade record (subject-owner check enforced)
 * @access  Private-Teacher
 */
router.delete("/classes/:classId/grades/:gradeId", deleteTeacherClassStudentGrade);

/**
 * @route   GET /api/v1/teacher/profile
 * @desc    Get the profile of the authenticated teacher
 * @access  Private-Teacher
 */
router.get("/profile", getTeacherProfile);

/**
 * @route   PATCH /api/v1/teacher/profile
 * @desc    Update the profile of the authenticated teacher
 * @access  Private-Teacher
 */
router.patch("/profile", updateTeacherProfile);

/**
 * @route   POST /api/v1/teacher/profile/email/request
 * @desc    Request an email update for the authenticated teacher
 * @access  Private-Teacher
 */
router.post("/profile/email/request", requestTeacherEmailUpdate);

/**
 * @route   POST /api/v1/teacher/profile/email/verify
 * @desc    Confirm and finalize email update for the teacher
 * @access  Private-Teacher
 */
router.post("/profile/email/verify", confirmTeacherEmailUpdate);

/**
 * @route   GET /api/v1/teacher/settings
 * @desc    Get the settings of the authenticated teacher
 * @access  Private-Teacher
 */
router.get("/settings", getTeacherSettings);

/**
 * @route   PATCH /api/v1/teacher/settings
 * @desc    Update the settings of the authenticated teacher
 * @access  Private-Teacher
 */
router.patch("/settings", updateTeacherSettings);

import { teacherAttendanceController } from './teacher-attendance.controller';

/**
 * @route   POST /api/v1/teacher/schools/:schoolId/attendance
 * @desc    Record attendance for a class
 * @access  Private-Teacher
 */
router.post("/schools/:schoolId/attendance", teacherAttendanceController.saveClassAttendance);

export default router;
