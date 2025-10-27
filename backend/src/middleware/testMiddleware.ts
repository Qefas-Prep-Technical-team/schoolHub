import { Request, Response, NextFunction } from "express";

export const testMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  if (id) {
    console.log(`🆔 ID from route: ${id}`);
  }
  next();
};
