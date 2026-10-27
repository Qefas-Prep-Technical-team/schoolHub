import { Router } from "express";
import {
  pickDepartment,
  updateStudentDepartmentByAdmin,
  getStudentProfile,
  getStudentById,
  getStudentAssignments,
  updateStudentProfile,
  requestEmailUpdate,
  confirmEmailUpdate,
  getStudentAttendance,
  updateStudentAttendance,
  pickLevel,
  updateStudentLevelByAdmin,
  exitStudent,
  batchExitStudents,
  getStudentHistory,
  assignPrefectRole,
  removePrefectRole,
  acknowledgePrefectCelebration,
  getStudentDownloadAudit,
  recordResultDownload,
  getStudentSchools,
  addPreviousSchoolRecord,
  promoteStudentDirect,
} from "./student.controller";
import { getStudentBehaviourProfile, upsertStudentBehaviourProfile } from "./behaviourProfile.controller";
import {
  fetchEvaluation,
  createOrUpdateEvaluation,
  fetchClassEvaluations,
  bulkSaveEvaluations,
} from "./termlyEvaluation.controller";
import { authenticateToken } from "../../middleware/authMiddleware";

const router = Router();

router.use(authenticateToken);

router.get("/profile", getStudentProfile);
router.patch("/profile", updateStudentProfile);
router.post("/profile/email/request", requestEmailUpdate);
router.post("/profile/email/verify", confirmEmailUpdate);
router.get("/termly-evaluations/class/:classId", fetchClassEvaluations);
router.post("/termly-evaluations/bulk", bulkSaveEvaluations);
router.get("/:id", getStudentById);
router.get("/:id/assignments", getStudentAssignments);
router.get("/:id/history", getStudentHistory);
router.get("/:id/schools", getStudentSchools);
router.post("/:id/previous-school", addPreviousSchoolRecord);
router.post("/:id/promote", promoteStudentDirect);
router.get("/:id/attendance", getStudentAttendance);
router.post("/:id/attendance", updateStudentAttendance);
router.patch("/profile/department", pickDepartment);
router.patch("/profile/level", pickLevel);
router.patch("/:id/department", updateStudentDepartmentByAdmin);
router.patch("/:id/level", updateStudentLevelByAdmin);
router.get("/:id/behaviour-profile", getStudentBehaviourProfile);
router.put("/:id/behaviour-profile", upsertStudentBehaviourProfile);
router.post("/batch-exit", batchExitStudents);
router.post("/:id/exit", exitStudent);
router.post("/:id/prefect-role", assignPrefectRole);
router.delete("/:id/prefect-role", removePrefectRole);
router.post("/:id/prefect-role/acknowledge", acknowledgePrefectCelebration);
router.get("/:id/termly-evaluation", fetchEvaluation);
router.put("/:id/termly-evaluation", createOrUpdateEvaluation);
router.get("/:id/download-audit", getStudentDownloadAudit);
router.post("/:id/download-audit", recordResultDownload);
export default router;

