import { Router } from "express";
import { platformLogin, platformLogout, getStaffProfile } from "./auth.controller";
import { authenticatePlatformStaff } from "../../../middleware/platformAuthMiddleware";

const router = Router();

/**
 * @route   POST /api/platform/auth/login
 */
router.post("/login", platformLogin);

/**
 * @route   POST /api/platform/auth/logout
 */
router.post("/logout", platformLogout);

/**
 * @route   GET /api/platform/auth/me
 */
router.get("/me", authenticatePlatformStaff, getStaffProfile);

export default router;
