import { Router } from "express";
import { pickDepartment, updateStudentDepartmentByAdmin, getStudentProfile, getStudentById, updateStudentProfile, requestEmailUpdate, confirmEmailUpdate } from "./student.controller";
import { getStudentBehaviourProfile, upsertStudentBehaviourProfile } from "./behaviourProfile.controller";
import { authenticateToken } from "../../middleware/authMiddleware";

const router = Router();

router.use(authenticateToken);

router.get("/profile", getStudentProfile);
router.patch("/profile", updateStudentProfile);
router.post("/profile/email/request", requestEmailUpdate);
router.post("/profile/email/verify", confirmEmailUpdate);
router.get("/:id", getStudentById);
router.patch("/profile/department", pickDepartment);
router.patch("/:id/department", updateStudentDepartmentByAdmin);
router.get("/:id/behaviour-profile", getStudentBehaviourProfile);
router.put("/:id/behaviour-profile", upsertStudentBehaviourProfile);

export default router;
