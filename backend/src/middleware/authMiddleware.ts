import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";




// middleware/authMiddleware.ts
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token =req.headers.authorization || req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
      });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
    
    // Attach basic user info to request
    req.user = {
      id: decoded.userId,
      userType: decoded.userType,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
};