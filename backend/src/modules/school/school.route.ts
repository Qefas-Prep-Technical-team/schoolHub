import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import { getSchoolTeachers, getSchoolStudents } from "./school.controller";

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

export default router;
