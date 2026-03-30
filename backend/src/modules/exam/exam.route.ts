import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import {
  addAIQuestionsToPaper,
  addManualQuestionsToPaper,
  createExam,
  createSubjectPaper,
  getExamById,
  getExamPapers,
  getSubjectPaperById,
  getExams,
  publishExam,
  publishSubjectPaper,
  updateQuestion,
  deleteQuestion,
  validateExam,
  validateSubjectPaper,
  updateExam,
  reorderQuestions,
  unpublishExam,
  unpublishSubjectPaper,
  deleteExam,
  getSubjectPapers,
  linkSubjectPaperToExam,
  deleteSubjectPaper,
  unlinkSubjectPaper,
} from "./exam.controller";
import {
  getExamAttempt,
  getExamAttempts,
  getMyExamAttempts,
  getExamResult,
  getExamReviewData,
  saveExamAnswer,
  startExamAttempt,
  submitExamAttempt,
} from "./exam-attempt.controller";
import {
  generateExamQuestions,
  parseRawExamText,
} from "./exam-ai.controller";
import {
  getManualReviewQueue,
  markSubjectiveAnswer,
} from "./exam-review.controller";
import {
  getClassExamAnalytics,
  getDepartmentExamAnalytics,
  getExamRanking,
  getSessionExamAnalytics,
} from "./exam-analytics.controller";

const router = Router();

router.post("/ai/parse-text", authenticateToken, parseRawExamText);
router.post("/ai/generate", authenticateToken, generateExamQuestions);

router.get("/review/queue", authenticateToken, getManualReviewQueue);
router.patch("/review/answers/:answerId", authenticateToken, markSubjectiveAnswer);

router.get("/papers/all", authenticateToken, getSubjectPapers);
router.post("/papers", authenticateToken, createSubjectPaper);
router.patch("/papers/:paperId/link", authenticateToken, linkSubjectPaperToExam);
router.patch("/papers/:paperId/unlink", authenticateToken, unlinkSubjectPaper);

router.get("/", authenticateToken, getExams);
router.get("/:id", authenticateToken, getExamById);
router.patch("/:id", authenticateToken, updateExam);
router.post("/", authenticateToken, createExam);
router.post("/:id/papers", authenticateToken, createSubjectPaper);
router.get("/:id/papers", authenticateToken, getExamPapers);
router.get("/:id/papers/:paperId", authenticateToken, getSubjectPaperById);

router.post("/:id/papers/:paperId/questions/manual", authenticateToken, addManualQuestionsToPaper);
router.post("/:id/papers/:paperId/questions/ai", authenticateToken, addAIQuestionsToPaper);
router.patch("/questions/:questionId", authenticateToken, updateQuestion);
router.patch("/:id/papers/:paperId/questions/reorder", authenticateToken, reorderQuestions);
router.delete("/questions/:questionId", authenticateToken, deleteQuestion);

router.post("/:id/papers/:paperId/validate", authenticateToken, validateSubjectPaper);
router.post("/:id/papers/:paperId/publish", authenticateToken, publishSubjectPaper);

router.post("/:id/validate", authenticateToken, validateExam);
router.post("/:id/publish", authenticateToken, publishExam);
router.post("/:id/unpublish", authenticateToken, unpublishExam);
router.delete("/:id", authenticateToken, deleteExam);

router.post("/:id/papers/:paperId/unpublish", authenticateToken, unpublishSubjectPaper);
router.delete("/:id/papers/:paperId", authenticateToken, deleteSubjectPaper);

router.post("/:id/start", authenticateToken, startExamAttempt);
router.get("/my/attempts", authenticateToken, getMyExamAttempts);
router.get("/:id/attempt", authenticateToken, getExamAttempt);
router.get("/:id/attempts", authenticateToken, getExamAttempts);
router.post("/:id/answers", authenticateToken, saveExamAnswer);
router.post("/:id/submit", authenticateToken, submitExamAttempt);
router.get("/:id/review", authenticateToken, getExamReviewData);
router.get("/:id/result", authenticateToken, getExamResult);

router.get("/:id/ranking", authenticateToken, getExamRanking);
router.get("/:id/analytics/class", authenticateToken, getClassExamAnalytics);
router.get("/:id/analytics/department", authenticateToken, getDepartmentExamAnalytics);
router.get("/analytics/session", authenticateToken, getSessionExamAnalytics);

export default router;
