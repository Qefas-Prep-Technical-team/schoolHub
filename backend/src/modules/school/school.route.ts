import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import { getSchoolTeachers, getSchoolStudents, getSchoolStats, getSchoolPerformanceAnalysis, getSchoolProfile, updateSchoolProfile, getSchoolSettings, updateSchoolSettings, getDashboardSummary } from "./school.controller";
import { 
    getTeacherDashboardStats, 
    getTeacherLinkedSchools, 
    getTeacherPerformanceTrends, 
    getTeacherStudents, 
    getTeacherClasses, 
    getTeacherClassDetail, 
    getTeacherClassAssignments,
    getTeacherClassGrades
} from "./teacher-dashboard.controller";

const router = Router();

// All school member routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/v1/schools/:schoolId/teachers
 * @desc    Get all teachers linked to a school
 * @access  Private
 */
router.get("/:schoolId/teachers", getSchoolTeachers);

/**
 * @route   GET /api/v1/schools/:schoolId/students
 * @desc    Get all students linked to a school
 * @access  Private
 */
router.get("/:schoolId/students", getSchoolStudents);

/**
 * @route   GET /api/v1/schools/:schoolId/stats
 * @desc    Get high-level statistics for a school
 * @access  Private-Admin
 */
router.get("/:schoolId/stats", getSchoolStats);

router.get("/:schoolId/performance-analysis", getSchoolPerformanceAnalysis);

/**
 * @route   GET /api/v1/schools/:schoolId/dashboard-summary
 * @desc    Get dashboard summary for institutional overview
 * @access  Private-Admin
 */
router.get("/:schoolId/dashboard-summary", getDashboardSummary);

/**
 * @route   GET /api/v1/schools/:schoolId/profile
 * @desc    Get detailed school profile
 * @access  Private
 */
router.get("/:schoolId/profile", getSchoolProfile);

/**
 * @route   PATCH /api/v1/schools/:schoolId/profile
 * @desc    Update school profile
 * @access  Private-Admin
 */
router.patch("/:schoolId/profile", updateSchoolProfile);

/**
 * @route   GET /api/v1/schools/:schoolId/settings
 * @desc    Get school-wide settings
 * @access  Private-Admin
 */
router.get("/:schoolId/settings", getSchoolSettings);

/**
 * @route   PATCH /api/v1/schools/:schoolId/settings
 * @desc    Update school-wide settings
 * @access  Private-Admin
 */
router.patch("/:schoolId/settings", updateSchoolSettings);

/**
 * @route   GET /api/v1/schools/teacher/dashboard-stats
 * @desc    Get dashboard statistics for a teacher
 * @access  Private-Teacher
 */
router.get("/teacher/dashboard-stats", getTeacherDashboardStats);

/**
 * @route   GET /api/v1/schools/teacher/linked-schools
 * @desc    Get all schools linked to the teacher
 * @access  Private-Teacher
 */
router.get("/teacher/linked-schools", getTeacherLinkedSchools);

/**
 * @route   GET /api/v1/schools/teacher/performance-trends
 * @desc    Get performance trends for a teacher
 * @access  Private-Teacher
 */
router.get("/teacher/performance-trends", getTeacherPerformanceTrends);

/**
 * @route   GET /api/v1/schools/teacher/students
 * @desc    Get all students linked to the teacher's classes
 * @access  Private-Teacher
 */
router.get("/teacher/students", getTeacherStudents);

/**
 * @route   GET /api/v1/schools/teacher/classes
 * @desc    Get all classes assigned to the teacher
 * @access  Private-Teacher
 */
router.get("/teacher/classes", getTeacherClasses);

/**
 * @route   GET /api/v1/schools/teacher/classes/:classId
 * @desc    Get detailed data for a specific class
 * @access  Private-Teacher
 */
router.get("/teacher/classes/:classId", getTeacherClassDetail);

/**
 * @route   GET /api/v1/schools/teacher/classes/:classId/assignments
 * @desc    Get assignments for a specific class
 * @access  Private-Teacher
 */
router.get("/teacher/classes/:classId/assignments", getTeacherClassAssignments);

/**
 * @route   GET /api/v1/schools/teacher/classes/:classId/grades
 * @desc    Get grades for a specific class
 * @access  Private-Teacher
 */
router.get("/teacher/classes/:classId/grades", getTeacherClassGrades);

export default router;
