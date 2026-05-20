import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";

import {
  addStudentToClass,
  approveClass,
  attachSubjectsToClass,
  createClass,
  getClasses,
  getSingleClass,
  getClassStats,
  previewClassByCode,
  previewClassById,
  rejectClass,
  removeStudentFromClass,
  requestToJoinClass,
  updateClass,
  changeClassStatus,
  archiveClass,
  editClassSubjects,
  removeSubjectFromClass,
} from "./class.controller";
import {
  getClassBehaviourAlerts,
  createBehaviourAlert,
  updateBehaviourAlert,
  deleteBehaviourAlert,
} from "./behaviour.controller";
import { 
  getClassAttendance, 
  submitAttendance, 
  getClassAttendanceSummary 
} from "./attendance.controller";
import { 
  getClassTimetable, 
  upsertTimetablePeriod, 
  deleteTimetablePeriod,
  autoGenerateTimetable,
  replicateTimetable
} from "./timetable.controller";

const router = Router();

router.post("/", authenticateToken, createClass);
router.get("/", authenticateToken, getClasses);
router.get("/code/:classCode", authenticateToken, previewClassByCode);
router.post("/join/request", authenticateToken, requestToJoinClass);

router.patch("/:id", authenticateToken, updateClass);
router.patch("/:id/status", authenticateToken, changeClassStatus);
router.patch("/:id/archive", authenticateToken, archiveClass);

router.post("/subjects/attach", authenticateToken, attachSubjectsToClass);
router.put("/subjects/edit", authenticateToken, editClassSubjects);
router.delete("/:id/subjects/:subjectId", authenticateToken, removeSubjectFromClass);

router.post("/students/add", authenticateToken, addStudentToClass);
router.delete(
  "/:id/students/:studentId",
  authenticateToken,
  removeStudentFromClass,
);

router.patch("/:id/approve", authenticateToken, approveClass);
router.patch("/:id/reject", authenticateToken, rejectClass);

// Attendance
router.get("/:id/attendance", authenticateToken, getClassAttendance);
router.post("/:id/attendance", authenticateToken, submitAttendance);
router.get("/:id/attendance/summary", authenticateToken, getClassAttendanceSummary);

// Timetable
router.get("/:id/timetable", authenticateToken, getClassTimetable);
router.post("/:id/timetable", authenticateToken, upsertTimetablePeriod);
router.delete("/:id/timetable/:periodId", authenticateToken, deleteTimetablePeriod);
router.post("/:id/timetable/generate", authenticateToken, autoGenerateTimetable);
router.post("/:id/timetable/replicate", authenticateToken, replicateTimetable);

router.get("/preview/:id", authenticateToken, previewClassById);
router.get("/:id/stats", authenticateToken, getClassStats);
router.get("/:id/behaviour-alerts", authenticateToken, getClassBehaviourAlerts);
router.post("/:id/behaviour-alerts", authenticateToken, createBehaviourAlert);
router.patch("/:id/behaviour-alerts/:alertId", authenticateToken, updateBehaviourAlert);
router.delete("/:id/behaviour-alerts/:alertId", authenticateToken, deleteBehaviourAlert);
router.get("/:id", authenticateToken, getSingleClass);

export default router;
