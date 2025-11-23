import express from "express";
import {
  approveAdmin,
  checkAdminStatus,
  getPendingAdmins,
  rejectAdmin,
  verifyTenantId,
  registerAdminSelf,
} from "./admin.controller";
import { authenticateToken } from "@middleware/authMiddleware";

const router = express.Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new school and admin account
 * @access  Public
 */

// Public routes (no authentication required)
router.post("/verify-tenant", verifyTenantId);
router.post("/register/admin-self", registerAdminSelf);
router.get("/admin-status/:email", checkAdminStatus);

router.use(authenticateToken);

router.get("/pending", getPendingAdmins);
router.put("/:adminId/approve", approveAdmin);
router.put("/:adminId/reject", rejectAdmin);

export default router;
