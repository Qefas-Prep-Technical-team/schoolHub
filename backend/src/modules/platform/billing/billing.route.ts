import { Router } from "express";
import { listPlans, updatePlan, assignSchoolToPlan, listSchoolSubscriptions } from "./billing.controller";
import { authenticatePlatformStaff, authorizePlatformRole } from "../../../middleware/platformAuthMiddleware";

const router = Router();

router.use(authenticatePlatformStaff);

/**
 * @route   GET /api/platform/billing/plans
 */
router.get("/plans", listPlans);

/**
 * @route   PUT /api/platform/billing/plans/:id
 */
router.put("/plans/:id", authorizePlatformRole(["OWNER", "FINANCE_ADMIN"]), updatePlan);

/**
 * @route   POST /api/platform/billing/assign
 */
router.post("/assign", authorizePlatformRole(["OWNER", "FINANCE_ADMIN"]), assignSchoolToPlan);

/**
 * @route   GET /api/platform/billing/schools
 */
router.get("/schools", listSchoolSubscriptions);

export default router;
