import { Router } from "express";
import { getSubscriptionUsage, checkFeatureAccess, getAiUsage, activateFreePlan } from "./subscription.controller";
import { authenticateToken } from "../../middleware/authMiddleware";

const router = Router();

router.get("/usage", authenticateToken, getSubscriptionUsage);
router.get("/check-feature/:featureKey", authenticateToken, checkFeatureAccess);
router.get("/ai-usage", authenticateToken, getAiUsage);
router.post("/activate-free-plan", authenticateToken, activateFreePlan);

export default router;
