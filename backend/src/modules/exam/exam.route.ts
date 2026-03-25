import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import {
  addAIQuestionsToPaper,
  addManualQuestionsToPaper,
  createExam,
  createSubjectPaper,
  publishExam,
  publishSubjectPaper,
  validateExam,
  validateSubjectPaper,
} from "./exam.controller";
import {
  getExamAttempt,
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

router.post("/", authenticateToken, createExam);
router.post("/:id/papers", authenticateToken, createSubjectPaper);

router.post("/:id/papers/:paperId/questions/manual", authenticateToken, addManualQuestionsToPaper);
router.post("/:id/papers/:paperId/questions/ai", authenticateToken, addAIQuestionsToPaper);

router.post("/:id/papers/:paperId/validate", authenticateToken, validateSubjectPaper);
router.post("/:id/papers/:paperId/publish", authenticateToken, publishSubjectPaper);

router.post("/:id/validate", authenticateToken, validateExam);
router.post("/:id/publish", authenticateToken, publishExam);

router.post("/:id/start", authenticateToken, startExamAttempt);
router.get("/:id/attempt", authenticateToken, getExamAttempt);
router.post("/:id/answers", authenticateToken, saveExamAnswer);
router.post("/:id/submit", authenticateToken, submitExamAttempt);
router.get("/:id/review", authenticateToken, getExamReviewData);

router.get("/:id/ranking", authenticateToken, getExamRanking);
router.get("/:id/analytics/class", authenticateToken, getClassExamAnalytics);
router.get("/:id/analytics/department", authenticateToken, getDepartmentExamAnalytics);
router.get("/analytics/session", authenticateToken, getSessionExamAnalytics);

export default router;
