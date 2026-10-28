import { Router } from "express";
import {
  platformLogin,
  platformLogout,
  getStaffProfile,
  updateStaffProfile,
  changeStaffPassword,
  linkSocialAccount,
} from "./auth.controller";
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

/**
 * @route   PATCH /api/platform/auth/profile
 */
router.patch("/profile", authenticatePlatformStaff, updateStaffProfile);

/**
 * @route   PATCH /api/platform/auth/password
 */
router.patch("/password", authenticatePlatformStaff, changeStaffPassword);

/**
 * @route   POST /api/platform/auth/social-link
 */
router.post("/social-link", authenticatePlatformStaff, linkSocialAccount);

export default router;

