// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Missing token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
    req.user = payload;
    next();
  } catch (error) {
    // Check if the error is specifically due to expiration
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({
        message: "jwt expired",
        code: "TOKEN_EXPIRED", // Adding a code makes frontend checks even more reliable
      });
    }

    // Otherwise, it's a truly invalid/tampered token
    return res.status(401).json({ message: "Invalid token" });
  }
};
