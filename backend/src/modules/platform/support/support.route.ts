import { Router } from "express";
import { searchSchools, toggleSchoolStatus, impersonateAdmin, listTickets, updateSchoolLimits } from "./support.controller";
import { authenticatePlatformStaff, authorizePlatformRole } from "../../../middleware/platformAuthMiddleware";

const router = Router();

router.use(authenticatePlatformStaff);

/**
 * @route   GET /api/platform/support/schools
 */
router.get("/schools", searchSchools);

/**
 * @route   PATCH /api/platform/support/schools/:id/status
 */
router.patch("/schools/:id/status", authorizePlatformRole(["OWNER", "SUPPORT_AGENT"]), toggleSchoolStatus);
router.patch("/schools/:id/limits", authorizePlatformRole(["OWNER", "SUPPORT_AGENT"]), updateSchoolLimits);

/**
 * @route   POST /api/platform/support/impersonate
 */
router.post("/impersonate", authorizePlatformRole(["OWNER", "SUPPORT_AGENT"]), impersonateAdmin);

/**
 * @route   GET /api/platform/support/tickets
 */
router.get("/tickets", listTickets);

export default router;
