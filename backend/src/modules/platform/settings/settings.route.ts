import { Router } from "express";
import { getPlatformSettings, updateSetting, batchUpdateSettings } from "./settings.controller";
import { authenticatePlatformStaff, authorizePlatformRole } from "../../../middleware/platformAuthMiddleware";

const router = Router();

router.use(authenticatePlatformStaff);

/**
 * @route   GET /api/platform/settings
 */
router.get("/", getPlatformSettings);

/**
 * @route   POST /api/platform/settings
 */
router.post("/", authorizePlatformRole(["OWNER"]), updateSetting);

/**
 * @route   POST /api/platform/settings/batch
 */
router.post("/batch", authorizePlatformRole(["OWNER"]), batchUpdateSettings);

export default router;
