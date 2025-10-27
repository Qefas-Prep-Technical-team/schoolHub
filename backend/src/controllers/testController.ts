import { Request, Response } from "express";

export const fetchTest = (req: Request, res: Response) => {
  res.json({
    message: `You requested TES with ID: ${req.params.id}`,
  });
};
