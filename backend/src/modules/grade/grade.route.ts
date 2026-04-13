import { Router } from "express";
import * as gradeController from "./grade.controller";

const router = Router();

router.get("/hub", gradeController.getGradeHub);
router.post("/", gradeController.createGradeEntry);
router.patch("/:id", gradeController.updateGradeScore);
router.delete("/:id", gradeController.deleteGrade);
router.post("/ocr", gradeController.processOCR);
router.post("/bulk", gradeController.bulkCreateGrades);

export default router;
