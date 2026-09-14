import { Router } from "express";
import * as gradeController from "./grade.controller";

const router = Router();

router.get("/hub", gradeController.getGradeHub);
router.post("/", gradeController.createGradeEntry);
router.post("/bulk", gradeController.bulkCreateGrades);
router.patch("/bulk/publish", gradeController.bulkPublishGrades);

router.patch("/:id", gradeController.updateGradeScore);
router.patch("/:id/publish", gradeController.publishGrade);
router.delete("/:id", gradeController.deleteGrade);
router.post("/ocr", gradeController.processOCR);

export default router;
