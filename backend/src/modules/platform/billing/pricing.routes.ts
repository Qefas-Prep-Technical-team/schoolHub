import { Router } from "express";
import { 
    getDynamicPlans, 
    listAllPlans, 
    savePlan, 
    seedPlans, 
    getDefaults 
} from "./pricing.controller";
import { authenticatePlatformStaff, authorizePlatformRole } from "../../../middleware/platformAuthMiddleware";

const router = Router();

/**
 * PUBLIC ROUTES
 */
router.get("/resolve", getDynamicPlans);

/**
 * CONSOLE ROUTES (Protected)
 */
router.use(authenticatePlatformStaff);

// List plans for management
router.get("/defaults", getDefaults);
router.get("/plans", listAllPlans);
router.get("/all", listAllPlans);

// Mutate plans (OWNER & FINANCE_ADMIN only)
router.post("/save", authorizePlatformRole(["OWNER", "FINANCE_ADMIN"]), savePlan);
router.post("/seed", authorizePlatformRole(["OWNER", "FINANCE_ADMIN"]), seedPlans);

export default router;
