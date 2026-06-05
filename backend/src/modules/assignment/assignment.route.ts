import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import { 
  getStudentAssignments, 
  getAssignmentById, 
  submitAssignment,
  getTeacherAssignments,
  createAssignment
} from "./assignment.controller";

const router = Router();

router.use(authenticateToken);

// Student endpoints
router.get("/student", getStudentAssignments);
router.get("/student/:id", getAssignmentById);
router.post("/student/:id/submit", submitAssignment);

// Teacher endpoints
router.get("/teacher", getTeacherAssignments);
router.post("/teacher", createAssignment);

// Admin endpoints (reusing teacher endpoints since admin can view all based on schoolId)
router.get("/admin", getTeacherAssignments);
router.post("/admin", createAssignment);

export default router;
