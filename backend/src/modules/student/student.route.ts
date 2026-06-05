import { Router } from "express";
import { pickDepartment, updateStudentDepartmentByAdmin, getStudentProfile, getStudentById, updateStudentProfile, requestEmailUpdate, confirmEmailUpdate, getStudentAttendance, updateStudentAttendance, pickLevel, updateStudentLevelByAdmin, exitStudent, getStudentHistory, assignPrefectRole, removePrefectRole, acknowledgePrefectCelebration } from "./student.controller";
import { getStudentBehaviourProfile, upsertStudentBehaviourProfile } from "./behaviourProfile.controller";
import { authenticateToken } from "../../middleware/authMiddleware";

const router = Router();

router.use(authenticateToken);

router.get("/profile", getStudentProfile);
router.patch("/profile", updateStudentProfile);
router.post("/profile/email/request", requestEmailUpdate);
router.post("/profile/email/verify", confirmEmailUpdate);
router.get("/:id", getStudentById);
router.get("/:id/history", getStudentHistory);
router.get("/:id/attendance", getStudentAttendance);
router.post("/:id/attendance", updateStudentAttendance);
router.patch("/profile/department", pickDepartment);
router.patch("/profile/level", pickLevel);
router.patch("/:id/department", updateStudentDepartmentByAdmin);
router.patch("/:id/level", updateStudentLevelByAdmin);
router.get("/:id/behaviour-profile", getStudentBehaviourProfile);
router.put("/:id/behaviour-profile", upsertStudentBehaviourProfile);
router.post("/:id/exit", exitStudent);
router.post("/:id/prefect-role", assignPrefectRole);
router.delete("/:id/prefect-role", removePrefectRole);
router.post("/:id/prefect-role/acknowledge", acknowledgePrefectCelebration);
export default router;
