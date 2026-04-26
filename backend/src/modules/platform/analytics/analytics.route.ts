import { Router } from "express";
import { getGlobalStats, getGrowthStats } from "./analytics.controller";
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

export default router;
