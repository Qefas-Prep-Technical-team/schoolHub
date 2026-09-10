import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import { 
  getStudentAssignments, 
  getAssignmentById, 
  submitAssignment,
  getTeacherAssignments,
  getTeacherAssignmentById,
  createAssignment,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
  updateAssignmentStatus,
  deleteAssignment,
  updateAssignmentSettings,
  gradeSubmission
} from "./assignment.controller";

const router = Router();

router.use(authenticateToken);

// Student endpoints
router.get("/student", getStudentAssignments);
router.get("/student/:id", getAssignmentById);
router.post("/student/:id/submit", submitAssignment);

// Teacher endpoints
router.get("/teacher", getTeacherAssignments);
router.get("/teacher/:id", getTeacherAssignmentById);
router.post("/teacher", createAssignment);
router.delete("/teacher/:id", deleteAssignment);

// Admin endpoints (reusing teacher endpoints since admin can view all based on schoolId)
router.get("/admin", getTeacherAssignments);
router.get("/admin/:id", getTeacherAssignmentById);
router.post("/admin", createAssignment);
router.delete("/admin/:id", deleteAssignment);
router.post("/admin/:id/submissions/:subId/grade", gradeSubmission);

// Question endpoints (usable by teachers/admins)
router.post("/:assignmentId/questions", addQuestion);
router.patch("/questions/:questionId", updateQuestion);
router.delete("/questions/:questionId", deleteQuestion);
router.patch("/:assignmentId/questions/reorder", reorderQuestions);
router.patch("/:assignmentId/status", updateAssignmentStatus);
router.patch("/:assignmentId/settings", updateAssignmentSettings);

export default router;
