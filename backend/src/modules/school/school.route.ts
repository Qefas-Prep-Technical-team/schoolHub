import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import { requireFeatureAccess } from "../subscription-checkers";
import {
  getSchoolTeachers,
  getSchoolStudents,
  getSchoolStats,
  getSchoolPerformanceAnalysis,
  getSchoolProfile,
  updateSchoolProfile,
  getSchoolSettings,
  updateSchoolSettings,
  getDashboardSummary,
  getSchoolBilling,
  getSchoolLandingPage,
  getSchoolLandingPageBySubdomain,
  updateSchoolLandingPage,
  getSchoolTodayAttendance,
} from "./school.controller";

const router = Router();

// Public route to fetch landing page settings by subdomain
router.get("/subdomain/:subdomain/landing-page", getSchoolLandingPageBySubdomain);

// Public route to submit an inquiry
import { submitInquiry, getInquiries } from "./school.controller";
router.post("/subdomain/:subdomain/inquiry", submitInquiry);

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

const aiInsightsFeatureKey = process.env.FEATURE_KEY_AI_INSIGHTS || "aiInsights";
router.get("/:schoolId/performance-analysis", requireFeatureAccess(aiInsightsFeatureKey), getSchoolPerformanceAnalysis);

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
 * @route   GET /api/v1/schools/:schoolId/billing
 * @desc    Get consolidated billing and subscription data
 * @access  Private-Admin
 */
router.get("/:schoolId/billing", getSchoolBilling);

/**
 * @route   GET /api/v1/schools/:schoolId/landing-page
 * @desc    Get landing page settings for a school
 * @access  Private-Admin
 */
router.get("/:schoolId/landing-page", getSchoolLandingPage);

/**
 * @route   PATCH /api/v1/schools/:schoolId/landing-page
 * @desc    Update landing page settings for a school
 * @access  Private-Admin
 */
router.patch("/:schoolId/landing-page", updateSchoolLandingPage);

/**
 * @route   GET /api/v1/schools/:schoolId/today-attendance
 * @desc    Get today's attendance summary per class
 * @access  Private-Admin
 */
router.get("/:schoolId/today-attendance", getSchoolTodayAttendance);

/**
 * @route   GET /api/v1/schools/:schoolId/inquiries
 * @desc    Get all inquiries for a school
 * @access  Private-Admin
 */
router.get("/:schoolId/inquiries", getInquiries);

export default router;
