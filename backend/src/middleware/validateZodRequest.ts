import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export const validateZodRequest = (schema: any) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await schema.parseAsync({ body: req.body, query: req.query, params: req.params });
    next();
  } catch (error: any) {
    if (error instanceof ZodError) {
      res.status(400).json({ success: false, message: (error as any).errors[0]?.message, errors: (error as any).errors });
    } else {
      res.status(400).json({ success: false, message: "Invalid request data" });
    }
  }
};
