import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import notificationRoutes from "../modules/notification/notification.route";
import linkRoutes from "../modules/link/link.route";
import classRoutes from "../modules/class/class.route";
import academicRoutes from "../modules/academic/academic.route";
import sessionRoutes from "../modules/session/session.route";
import examRoutes from "../modules/exam/exam.route";
// import schoolRoutes from "../modules/school/school.route";
// import studentRoutes from "../modules/student/student.route";
// import teacherRoutes from "../modules/teacher/teacher.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/notifications", notificationRoutes);
router.use("/links", linkRoutes);
router.use("/classes", classRoutes);
router.use("/academic", academicRoutes);
router.use("/sessions", sessionRoutes);
router.use("/exams", examRoutes);
// router.use("/schools", schoolRoutes);
// router.use("/students", studentRoutes);
// router.use("/teachers", teacherRoutes);

export default router;
