import { Router } from "express";
import { getSubscriptionUsage } from "./subscription.controller";
import { authenticateToken } from "../../middleware/authMiddleware";

const router = Router();

router.get("/usage", authenticateToken, getSubscriptionUsage);

export default router;
