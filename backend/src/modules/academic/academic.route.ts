import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import {
  createSubject,
  getSubjects,
  getSingleSubject,
  updateSubject,
  archiveSubject,
  attachDepartmentsToSubject,
  attachTeachersToSubject,
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
import {
  assignTeacherToSubject,
  getTeacherSubjects,
} from "./teacher-subject.controller";
import {
  getStudentGrades,
  getGradeById,
  getAllGrades,
  getClassLeaderboard,
} from "./grade.controller";
import { 
  getSubjectSchemes, 
  createSchemeEntry, 
  updateSchemeEntry, 
  deleteSchemeEntry,
  bulkSyncScheme
} from "./scheme-of-work.controller";

const router = Router();

// Subject Routes
router.post("/subjects", authenticateToken, createSubject);
router.get("/subjects", authenticateToken, getSubjects);
router.get("/subjects/:id", authenticateToken, getSingleSubject);
router.patch("/subjects/:id", authenticateToken, updateSubject);
router.patch("/subjects/:id/archive", authenticateToken, archiveSubject);
router.post("/subjects/:id/departments", authenticateToken, attachDepartmentsToSubject);
router.post("/subjects/:id/teachers", authenticateToken, attachTeachersToSubject);

// Scheme of Work Routes
router.get("/subjects/:id/scheme", authenticateToken, getSubjectSchemes);
router.post("/subjects/:id/scheme", authenticateToken, createSchemeEntry);
router.post("/subjects/:id/scheme/sync", authenticateToken, bulkSyncScheme);
router.patch("/scheme/:id", authenticateToken, updateSchemeEntry);
router.delete("/scheme/:id", authenticateToken, deleteSchemeEntry);

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

// Teacher-Subject Routes
router.post("/teacher-subjects/assign", authenticateToken, assignTeacherToSubject);
router.get("/teacher-subjects", authenticateToken, getTeacherSubjects);

// Grade Routes
router.get("/grades", authenticateToken, getStudentGrades);
router.get("/grades/leaderboard/:classId", authenticateToken, getClassLeaderboard);
router.get("/grades/admin", authenticateToken, getAllGrades);
router.get("/grades/:id", authenticateToken, getGradeById);

export default router;
