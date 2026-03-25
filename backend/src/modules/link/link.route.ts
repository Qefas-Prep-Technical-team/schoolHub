// src/modules/link/link.route.ts
import { Router } from "express";
import {
   createLinkRequest,
  respondToLinkRequest,
  getMySentLinkRequests,
  getMyPendingLinkRequests,
  getMyActiveLinks,
  getSingleLinkRequest,
  cancelLinkRequest,
  revokeActiveLink,
  batchRequestAction,
  batchRevokeActiveLinks,
} from "./link.controller";
import { authenticateToken } from "../../middleware/authMiddleware";

const router = Router();

router.post("/request", authenticateToken, createLinkRequest);
router.patch("/request/:id/respond", authenticateToken, respondToLinkRequest);
router.patch("/request/:id/cancel", authenticateToken, cancelLinkRequest);
router.get("/request/:id", authenticateToken, getSingleLinkRequest);

router.get("/requests/sent", authenticateToken, getMySentLinkRequests);
router.get("/requests/pending", authenticateToken, getMyPendingLinkRequests);

router.get("/active", authenticateToken, getMyActiveLinks);
router.patch("/active/:id/revoke", authenticateToken, revokeActiveLink);

router.post("/requests/batch-action", authenticateToken, batchRequestAction);
router.post("/active/batch-revoke", authenticateToken, batchRevokeActiveLinks);
export default router;