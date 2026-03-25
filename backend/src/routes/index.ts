import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import notificationRoutes from "../modules/notification/notification.route";
import linkRoutes from "../modules/link/link.route";
import classRoutes from "../modules/class/class.route";
import academicRoutes from "../modules/academic/academic.route";
// import schoolRoutes from "../modules/school/school.route";
// import studentRoutes from "../modules/student/student.route";
// import teacherRoutes from "../modules/teacher/teacher.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/notifications", notificationRoutes);
router.use("/links", linkRoutes);
router.use("/classes", classRoutes);
router.use("/academic", academicRoutes);
// router.use("/schools", schoolRoutes);
// router.use("/students", studentRoutes);
// router.use("/teachers", teacherRoutes);

export default router;
