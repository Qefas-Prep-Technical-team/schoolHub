import { Request, Response } from "express";
import {
  upsertTermlyEvaluationSchema,
  bulkUpsertTermlyEvaluationSchema,
} from "./termlyEvaluation.schema";
import {
  upsertTermlyEvaluation,
  getTermlyEvaluation,
  getClassTermlyEvaluations,
  bulkUpsertClassTermlyEvaluations,
} from "./termlyEvaluation.service";
import { Term, UserRole } from "@prisma/client";
import prisma from "../../config/database";

export const createOrUpdateEvaluation = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }

    const isSuperAdmin = (user.userType as string) === "SUPER_ADMIN";

    // Only teachers, admins, and super admins can create or update termly evaluations
    if (![UserRole.ADMIN, UserRole.TEACHER].includes(user.userType as any) && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        error: "Forbidden: Only teachers and administrators can record termly evaluations",
      });
    }

    const studentId = req.params.id as string;
    const targetStudent = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, schoolId: true },
    });

    if (!targetStudent) {
      return res.status(404).json({ success: false, error: "Student not found" });
    }

    // Check school tenant boundary
    if (!isSuperAdmin && user.schoolId !== targetStudent.schoolId) {
      return res.status(403).json({
        success: false,
        error: "Access denied: You do not have permission to evaluate students from another school",
      });
    }

    const data = upsertTermlyEvaluationSchema.parse(req.body);
    const evaluation = await upsertTermlyEvaluation(studentId, data);

    res.status(200).json({ success: true, data: evaluation });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ success: false, error: "Validation Error", details: error.errors });
    } else {
      res.status(500).json({ success: false, error: error.message || "Failed to update termly evaluation" });
    }
  }
};

export const fetchEvaluation = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }

    const isSuperAdmin = (user.userType as string) === "SUPER_ADMIN";
    const studentId = req.params.id as string;
    const targetStudent = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, schoolId: true },
    });

    if (!targetStudent) {
      return res.status(404).json({ success: false, error: "Student not found" });
    }

    // Verify caller has permission to view this evaluation
    if (user.userType === UserRole.STUDENT) {
      if (user.id !== targetStudent.id) {
        return res.status(403).json({ success: false, error: "Access denied: Students can only view their own evaluations" });
      }
    } else if (user.userType === UserRole.PARENT) {
      const isLinked = await prisma.parentChildLink.findFirst({
        where: { parentId: user.id, studentId: targetStudent.id },
      });
      if (!isLinked) {
        return res.status(403).json({ success: false, error: "Access denied: You are not linked to this student" });
      }
    } else if (!isSuperAdmin) {
      // Teachers and Admins must belong to the same school
      if (user.schoolId !== targetStudent.schoolId) {
        return res.status(403).json({ success: false, error: "Access denied: You cannot view evaluations of students from another school" });
      }
    }

    const classId = req.query.classId as string;
    const sessionId = req.query.sessionId as string;
    const term = req.query.term as Term;

    if (!classId || !sessionId || !term) {
      return res.status(400).json({ success: false, error: "Missing required query parameters: classId, sessionId, term" });
    }

    const evaluation = await getTermlyEvaluation(
      studentId, 
      classId, 
      sessionId, 
      term
    );

    res.status(200).json({ success: true, data: evaluation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch termly evaluation" });
  }
};

export const fetchClassEvaluations = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }

    const isSuperAdmin = (user.userType as string) === "SUPER_ADMIN";
    const classId = req.params.classId as string;
    const sessionId = req.query.sessionId as string;
    const term = req.query.term as Term;

    if (!classId || !sessionId || !term) {
      return res.status(400).json({
        success: false,
        error: "Missing required query parameters: classId, sessionId, term",
      });
    }

    const targetClass = await prisma.class.findUnique({
      where: { id: classId },
      select: { id: true, schoolId: true },
    });

    if (!targetClass) {
      return res.status(404).json({ success: false, error: "Class not found" });
    }

    if (!isSuperAdmin && user.schoolId && targetClass.schoolId !== user.schoolId) {
      return res.status(403).json({
        success: false,
        error: "Access denied: You cannot view evaluations of classes from another school",
      });
    }

    const evaluations = await getClassTermlyEvaluations(classId, sessionId, term);
    res.status(200).json({ success: true, data: evaluations });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch class termly evaluations",
    });
  }
};

export const bulkSaveEvaluations = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }

    const isSuperAdmin = (user.userType as string) === "SUPER_ADMIN";
    if (![UserRole.ADMIN, UserRole.TEACHER].includes(user.userType as any) && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        error: "Forbidden: Only teachers and administrators can record termly evaluations",
      });
    }

    const parsed = bulkUpsertTermlyEvaluationSchema.parse(req.body);
    const { classId, sessionId, term, evaluations } = parsed;

    const targetClass = await prisma.class.findUnique({
      where: { id: classId },
      select: { id: true, schoolId: true },
    });

    if (!targetClass) {
      return res.status(404).json({ success: false, error: "Class not found" });
    }

    if (!isSuperAdmin && user.schoolId && targetClass.schoolId !== user.schoolId) {
      return res.status(403).json({
        success: false,
        error: "Access denied: You cannot evaluate students from another school",
      });
    }

    const results = await bulkUpsertClassTermlyEvaluations(
      classId,
      sessionId,
      term,
      evaluations
    );

    res.status(200).json({ success: true, data: results });
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ success: false, error: "Validation Error", details: error.errors });
    } else {
      res.status(500).json({
        success: false,
        error: error.message || "Failed to bulk update termly evaluations",
      });
    }
  }
};
