import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import {
  createSession,
  getActiveSession,
  getSessions,
} from "./session.controller";

const router = Router();

router.post("/", authenticateToken, createSession);
router.get("/", authenticateToken, getSessions);
router.get("/active", authenticateToken, getActiveSession);

export default router;
