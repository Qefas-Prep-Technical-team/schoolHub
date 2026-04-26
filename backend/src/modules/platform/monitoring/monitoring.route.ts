import { Router } from "express";
import { getErrorLogs, getSystemHealth } from "./monitoring.controller";
import { authenticatePlatformStaff, authorizePlatformRole } from "../../../middleware/platformAuthMiddleware";

const router = Router();

router.use(authenticatePlatformStaff);

/**
 * @route   GET /api/platform/monitoring/logs
 */
router.get("/logs", authorizePlatformRole(["OWNER", "TECH_ADMIN"]), getErrorLogs);

/**
 * @route   GET /api/platform/monitoring/health
 */
router.get("/health", authorizePlatformRole(["OWNER", "TECH_ADMIN"]), getSystemHealth);

export default router;
