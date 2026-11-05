import { Router } from "express";
import {
  listTutorials,
  getTutorial,
  saveTutorialsBatch,
  upsertTutorial,
  deleteTutorial,
  resetTutorials,
} from "./tutorials.controller";
import { authenticatePlatformStaff, authorizePlatformRole } from "../../../middleware/platformAuthMiddleware";

const router = Router();

/**
 * PUBLIC ROUTES (Accessible to public frontend http://localhost:3000/tutorials and internal console)
 */
router.get("/", listTutorials);
router.get("/:id", getTutorial);

/**
 * CONSOLE ROUTES (Protected — require platform staff authentication)
 */
router.use(authenticatePlatformStaff);

router.post("/", authorizePlatformRole(["OWNER", "TECH_ADMIN", "SUPPORT_AGENT"]), saveTutorialsBatch);
router.post("/upsert", authorizePlatformRole(["OWNER", "TECH_ADMIN", "SUPPORT_AGENT"]), upsertTutorial);
router.delete("/:id", authorizePlatformRole(["OWNER", "TECH_ADMIN"]), deleteTutorial);
router.post("/reset", authorizePlatformRole(["OWNER", "TECH_ADMIN"]), resetTutorials);

export default router;

