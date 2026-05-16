import { Router } from "express";
import { 
    getDynamicPlans, 
    listAllPlans, 
    savePlan, 
    seedPlans, 
    getDefaults,
    getFeatures,
    saveFeature,
    harvestFeatures,
    deleteFeature,
    getStats
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
router.get("/stats", getStats);

// Mutate plans (OWNER & FINANCE_ADMIN only)
router.post("/save", authorizePlatformRole(["OWNER", "FINANCE_ADMIN", "TECH_ADMIN"]), savePlan);
router.post("/seed", authorizePlatformRole(["OWNER", "FINANCE_ADMIN", "TECH_ADMIN"]), seedPlans);

// Feature Manifest Management
router.get("/features/manifest", getFeatures);
router.post("/features/save", authorizePlatformRole(["OWNER", "TECH_ADMIN"]), saveFeature);
router.post("/features/harvest", authorizePlatformRole(["OWNER", "TECH_ADMIN"]), harvestFeatures);
router.delete("/features/:id", authorizePlatformRole(["OWNER", "TECH_ADMIN"]), deleteFeature);

export default router;
