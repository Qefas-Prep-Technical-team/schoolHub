import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";



const router = Router();

router.use("/auth", authRoutes);
// router.use("/schools", schoolRoutes);
// router.use("/students", studentRoutes);
// router.use("/teachers", teacherRoutes);

export default router;
