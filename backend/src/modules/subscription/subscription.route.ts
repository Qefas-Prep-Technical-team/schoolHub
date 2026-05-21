import { Router } from "express";
import { getSubscriptionUsage, checkFeatureAccess } from "./subscription.controller";
import { authenticateToken } from "../../middleware/authMiddleware";

const router = Router();

router.get("/usage", authenticateToken, getSubscriptionUsage);
router.get("/check-feature/:featureKey", authenticateToken, checkFeatureAccess);

export default router;
