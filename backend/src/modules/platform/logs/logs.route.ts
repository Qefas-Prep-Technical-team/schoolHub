import { Router } from "express";
import { listLogs } from "./logs.controller";
import { authenticatePlatformStaff, authorizePlatformRole } from "../../../middleware/platformAuthMiddleware";

const router = Router();

router.use(authenticatePlatformStaff);

/**
 * @route   GET /api/platform/logs
 */
router.get("/", authorizePlatformRole(["OWNER", "TECH_ADMIN"]), listLogs);

export default router;
