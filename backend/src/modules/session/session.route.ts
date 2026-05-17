import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import {
  createSession,
  getActiveSession,
  getSessions,
  updateSession,
  archiveSession,
  deleteSession,
} from "./session.controller";

const router = Router();

router.post("/", authenticateToken, createSession);
router.get("/", authenticateToken, getSessions);
router.get("/active", authenticateToken, getActiveSession);
router.patch("/:id", authenticateToken, updateSession);
router.post("/:id/archive", authenticateToken, archiveSession);
router.delete("/:id", authenticateToken, deleteSession);

export default router;
