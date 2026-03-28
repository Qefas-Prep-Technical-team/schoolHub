import { Router } from "express";
import { pickDepartment, updateStudentDepartmentByAdmin, getStudentProfile, getStudentById } from "./student.controller";
import { authenticateToken } from "../../middleware/authMiddleware";

const router = Router();

router.use(authenticateToken);

router.get("/profile", getStudentProfile);
router.get("/:id", getStudentById);
router.patch("/profile/department", pickDepartment);
router.patch("/:id/department", updateStudentDepartmentByAdmin);

export default router;
