import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import { checkSubscription } from "../../middleware/subscriptionMiddleware";
import { getChildren, getChildDetails, getChildAssignments, getChildAssignmentDetails, getParentDashboard, updateProfile, updateChildProfile } from "./parent.controller";

const router = Router();

// All parent routes require authentication
router.use(authenticateToken);

router.get("/dashboard", checkSubscription, getParentDashboard);
router.get("/children", checkSubscription, getChildren);
router.get("/children/:childId", checkSubscription, getChildDetails);
router.get("/children/:childId/assignments", checkSubscription, getChildAssignments);
router.get("/children/:childId/assignments/:assignmentId", checkSubscription, getChildAssignmentDetails);
router.patch("/children/:childId", checkSubscription, updateChildProfile);
router.patch("/profile", updateProfile);

export default router;

