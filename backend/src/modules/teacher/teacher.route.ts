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

export default router;
