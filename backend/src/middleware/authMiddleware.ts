import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/database";

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.header("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : undefined;

    const token = bearerToken || req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
    
    // Fetch schoolId based on user type
    let schoolId: string | undefined;
    
    if (decoded.userType === "ADMIN") {
      const admin = await prisma.admin.findUnique({
        where: { id: decoded.userId },
        include: { schoolAdmins: { where: { active: true }, take: 1 } }
      });
      schoolId = admin?.schoolAdmins[0]?.schoolId || admin?.defaultTenantId;
    } else if (decoded.userType === "TEACHER") {
      const teacher = await prisma.teacher.findUnique({
        where: { id: decoded.userId }
      });
      schoolId = teacher?.schoolId || teacher?.currentSchoolId || teacher?.defaultTenantId;
    } else if (decoded.userType === "STUDENT") {
      const student = await prisma.student.findUnique({
        where: { id: decoded.userId }
      });
      schoolId = student?.schoolId || student?.defaultTenantId;
    }

    console.log("LOG: [authMiddleware] User verified", { 
      userId: decoded.userId, 
      userType: decoded.userType,
      schoolId 
    });

    req.user = {
      id: decoded.userId,
      userType: decoded.userType,
      schoolId: schoolId || undefined
    };

    console.log("LOG: [authMiddleware] Proceeding to next handler for user:", req.user.id);
    next();
  } catch (error: any) {
    console.error("LOG ERROR: [authMiddleware] failure:", error);
    const message = error.name === "TokenExpiredError" ? "Session expired, please login again" : "Invalid token";
    return res.status(401).json({
      success: false,
      message,
    });
  }
};