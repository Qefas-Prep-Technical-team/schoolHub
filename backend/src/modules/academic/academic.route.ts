import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import {
  createSubject,
  getSubjects,
  getSingleSubject,
  updateSubject,
  archiveSubject,
} from "./subject.controller";
import {
  createDepartment,
  getDepartments,
  getSingleDepartment,
  updateDepartment,
  archiveDepartment,
  attachSubjectsToDepartment,
  removeSubjectFromDepartment,
} from "./department.controller";
import {
  createExam,
  createQuiz,
  getExams,
  getQuizzes,
} from "./academic.controller";

const router = Router();

// Subject Routes
router.post("/subjects", authenticateToken, createSubject);
router.get("/subjects", authenticateToken, getSubjects);
router.get("/subjects/:id", authenticateToken, getSingleSubject);
router.patch("/subjects/:id", authenticateToken, updateSubject);
router.patch("/subjects/:id/archive", authenticateToken, archiveSubject);

// Department Routes
router.post("/departments", authenticateToken, createDepartment);
router.get("/departments", authenticateToken, getDepartments);
router.get("/departments/:id", authenticateToken, getSingleDepartment);
router.patch("/departments/:id", authenticateToken, updateDepartment);
router.patch("/departments/:id/archive", authenticateToken, archiveDepartment);
router.post("/departments/subjects/attach", authenticateToken, attachSubjectsToDepartment);
router.delete("/departments/:id/subjects/:subjectId", authenticateToken, removeSubjectFromDepartment);

// Quiz Routes
router.post("/quizzes", authenticateToken, createQuiz);
router.get("/quizzes", authenticateToken, getQuizzes);

// Exam Routes
router.post("/exams", authenticateToken, createExam);
router.get("/exams", authenticateToken, getExams);

export default router;
