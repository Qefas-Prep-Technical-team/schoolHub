import { Router } from "express";
import {
  getRecipients,
  addRecipient,
  updateRecipient,
  toggleRecipientStatus,
  deleteRecipient,
  sendTestAlert,
} from "./recipient.controller";
import { authenticatePlatformStaff, authorizePlatformRole } from "../../../middleware/platformAuthMiddleware";

const router = Router();

router.use(authenticatePlatformStaff);

/**
 * Platform notification alert recipients routes
 */
router.get("/recipients", authorizePlatformRole(["OWNER", "SUPPORT_AGENT", "TECH_ADMIN"]), getRecipients);
router.post("/recipients", authorizePlatformRole(["OWNER", "TECH_ADMIN"]), addRecipient);
router.patch("/recipients/:id", authorizePlatformRole(["OWNER", "TECH_ADMIN"]), updateRecipient);
router.patch("/recipients/:id/toggle", authorizePlatformRole(["OWNER", "TECH_ADMIN"]), toggleRecipientStatus);
router.delete("/recipients/:id", authorizePlatformRole(["OWNER", "TECH_ADMIN"]), deleteRecipient);
router.post("/recipients/:id/test", authorizePlatformRole(["OWNER", "TECH_ADMIN", "SUPPORT_AGENT"]), sendTestAlert);

export default router;
