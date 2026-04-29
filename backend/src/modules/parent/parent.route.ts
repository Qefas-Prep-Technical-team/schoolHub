import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import { checkSubscription } from "../../middleware/subscriptionMiddleware";
import { getChildren, getChildDetails, getParentDashboard } from "./parent.controller";

const router = Router();

// All parent routes require authentication and an active subscription
router.use(authenticateToken);
router.use(checkSubscription);

router.get("/dashboard", getParentDashboard);
router.get("/children", getChildren);
router.get("/children/:childId", getChildDetails);

export default router;

