import { Router } from "express";
import { getGlobalStats, getGrowthStats, getSubscriptionAnalytics } from "./analytics.controller";
import { authenticatePlatformStaff } from "../../../middleware/platformAuthMiddleware";

const router = Router();

// Require platform staff auth for all analytics
router.use(authenticatePlatformStaff);

/**
 * @route   GET /api/platform/analytics/stats
 * @desc    Get global KPIs
 */
router.get("/stats", getGlobalStats);

/**
 * @route   GET /api/platform/analytics/growth
 * @desc    Get growth chart data
 */
router.get("/growth", getGrowthStats);

/**
 * @route   GET /api/platform/analytics/subscriptions
 * @desc    Get subscription distribution and history
 */
router.get("/subscriptions", getSubscriptionAnalytics);

export default router;
