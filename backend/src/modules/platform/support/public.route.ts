import { Router } from "express";
import { getPublicRoleFeatures } from "./support.controller";

const router = Router();

/**
 * @route   GET /api/platform/config/features/:role
 */
router.get("/features/:role", getPublicRoleFeatures);

export default router;
