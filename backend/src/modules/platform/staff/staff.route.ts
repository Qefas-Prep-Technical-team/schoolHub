import { Router } from "express";
import { createStaff, listStaff, toggleStaffStatus, deleteStaff, verifyStaffInvite, completeStaffSetup, updateStaffRole, requestCredentialReset } from "./staff.controller";
import { authenticatePlatformStaff, authorizePlatformRole } from "../../../middleware/platformAuthMiddleware";

const router = Router();

/**
 * @route   GET /api/platform/staff/invite/verify
 * @desc    Verify staff invitation link (Public)
 */
router.get("/invite/verify", verifyStaffInvite);

/**
 * @route   POST /api/platform/staff/invite/complete
 * @desc    Complete setup by setting password (Public)
 */
router.post("/invite/complete", completeStaffSetup);

// All staff management routes require platform auth
router.use(authenticatePlatformStaff);

/**
 * @route   GET /api/platform/staff
 * @desc    List all staff (Accessible by any staff)
 */
router.get("/", listStaff);

/**
 * @route   POST /api/platform/staff
 * @desc    Create new staff (OWNER only)
 */
router.post("/", authorizePlatformRole(["OWNER"]), createStaff);

/**
 * @route   PATCH /api/platform/staff/:id/status
 * @desc    Toggle active status (OWNER only)
 */
router.patch("/:id/status", authorizePlatformRole(["OWNER"]), toggleStaffStatus);

/**
 * @route   PATCH /api/platform/staff/:id/role
 * @desc    Update access level (OWNER only)
 */
router.patch("/:id/role", authorizePlatformRole(["OWNER"]), updateStaffRole);

/**
 * @route   POST /api/platform/staff/:id/reset
 * @desc    Re-dispatch password setup email (OWNER only)
 */
router.post("/:id/reset", authorizePlatformRole(["OWNER"]), requestCredentialReset);

/**
 * @route   DELETE /api/platform/staff/:id
 * @desc    Delete staff (OWNER only)
 */
router.delete("/:id", authorizePlatformRole(["OWNER"]), deleteStaff);

export default router;
