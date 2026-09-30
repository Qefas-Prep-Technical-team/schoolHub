import { Router } from "express";
import { testEmailTemplate } from "./email.controller";
import { authenticateToken } from "../../../middleware/authMiddleware";

const router = Router();

router.post("/test", authenticateToken, testEmailTemplate);

export default router;
