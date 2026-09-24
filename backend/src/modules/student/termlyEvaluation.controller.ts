import { Request, Response } from "express";
import { upsertTermlyEvaluationSchema } from "./termlyEvaluation.schema";
import { upsertTermlyEvaluation, getTermlyEvaluation } from "./termlyEvaluation.service";
import { Term } from "@prisma/client";

export const createOrUpdateEvaluation = async (req: Request, res: Response) => {
  try {
    const studentId = req.params.id as string;
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
    const studentId = req.params.id as string;
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
