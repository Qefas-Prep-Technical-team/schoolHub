import { Router } from "express";
import { listPlans, updatePlan, assignSchoolToPlan, listSchoolSubscriptions, resetSchoolSubscription, resetStudentSubscription, resetTeacherSubscription, resetParentSubscription } from "./billing.controller";
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

/**
 * @route   POST /api/platform/billing/reset
 */
router.post("/reset", authorizePlatformRole(["OWNER", "FINANCE_ADMIN"]), resetSchoolSubscription);
router.post("/reset-student", authorizePlatformRole(["OWNER", "FINANCE_ADMIN"]), resetStudentSubscription);
router.post("/reset-teacher", authorizePlatformRole(["OWNER", "FINANCE_ADMIN"]), resetTeacherSubscription);
router.post("/reset-parent", authorizePlatformRole(["OWNER", "FINANCE_ADMIN"]), resetParentSubscription);

export default router;
