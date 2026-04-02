import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import notificationRoutes from "../modules/notification/notification.route";
import linkRoutes from "../modules/link/link.route";
import classRoutes from "../modules/class/class.route";
import academicRoutes from "../modules/academic/academic.route";
import adminRoutes from "../modules/admin/admin.route";
import sessionRoutes from "../modules/session/session.route";
import examRoutes from "../modules/exam/exam.route";
import schoolRoutes from "../modules/school/school.route";
import studentRoutes from "../modules/student/student.route";
import uploadRoutes from "../modules/upload/upload.route";

const router = Router();

router.get("/health", (req, res) => res.status(200).send("API OK"));
router.use("/auth", authRoutes);
router.use("/notifications", notificationRoutes);
router.use("/links", linkRoutes);
router.use("/classes", classRoutes);
router.use("/academic", academicRoutes);
router.use("/admin", adminRoutes);
router.use("/sessions", sessionRoutes);
router.use("/exams", examRoutes);
router.use("/schools", schoolRoutes);
router.use("/students", studentRoutes);
router.use("/upload", uploadRoutes);
// router.use("/teachers", teacherRoutes);

export default router;
