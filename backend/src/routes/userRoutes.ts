import { Router } from "express";
import { fetchUsers } from "@controllers/userController";
import authMiddleware from "@middleware/authMiddleware";

const router = Router();

router.get("/", authMiddleware, fetchUsers);

export default router;
