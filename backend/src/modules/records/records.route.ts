import { Router, Request, Response, NextFunction } from "express";
import * as recordsController from "./records.controller";
import { AdminRole, UserRole } from "@prisma/client";

const router = Router();

// ─── Student-accessible routes (BEFORE restrictTo) ────────────────────────────
// Students can only view their own published results
router.get("/my-results", recordsController.getMyPublishedResults);

// Inline restrictTo middleware for admin/teacher routes
const restrictTo = (...roles: AdminRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // If not an admin and not a teacher, block
    if (req.user?.userType !== UserRole.ADMIN && req.user?.userType !== UserRole.TEACHER) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    next();
  };
};

// Apply role-based access control middleware to all admin/teacher routes
router.use(restrictTo("SCHOOL_OWNER", "PRINCIPAL", "REGISTRAR"));

router.get("/class-subjects", recordsController.getClassSubjectResults);
router.post("/class-subjects", recordsController.createClassSubjectResult);
router.get("/class-subjects/:id", recordsController.getClassSubjectResultById);
router.patch("/class-subjects/:id", recordsController.updateClassSubjectResult);
router.patch("/class-subjects/:id/paper-links", recordsController.updatePaperLinks);
router.post("/class-subjects/:id/calculate-sync", recordsController.calculatePaperSync);
router.post("/class-subjects/:id/publish", recordsController.publishClassSubjectResult);
router.post("/class-subjects/:id/unpublish", recordsController.unpublishClassSubjectResult);
router.get("/class-subjects/:id/student/:studentId/score-breakdown", recordsController.getStudentScoreBreakdown);
router.get("/student-subject-results", recordsController.getStudentSubjectResults);
router.post("/student-subject-results/bulk", recordsController.bulkUpsertStudentSubjectResults);
router.get("/student-terms", recordsController.getStudentTermResults);

export default router;
