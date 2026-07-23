import { Router } from "express";
import { logComplaint } from "./ai-complaint.controller";

const router = Router();

// Endpoint for AI to log a complaint
router.post("/", logComplaint);

export default router;
