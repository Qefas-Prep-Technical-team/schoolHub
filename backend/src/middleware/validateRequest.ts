import { Request, Response, NextFunction } from "express";
import { AnySchema } from "yup";

export const validateRequest = (schema: AnySchema) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
 
  try {
    await schema.validate({ body: req.body });
    next();
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};
