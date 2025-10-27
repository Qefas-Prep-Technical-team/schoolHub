import { Request, Response } from "express";
import { getUsers } from "@services/userService";

export const fetchUsers = (req: Request, res: Response) => {
  res.json(getUsers());
};
