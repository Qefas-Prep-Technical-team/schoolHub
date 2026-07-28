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
      console.error(`LOG ERROR: [authMiddleware] Missing token for URL: ${req.originalUrl}`);
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
    let schoolId: string | undefined;
    let tenantId: string | undefined;
    let userExists = false;

    if (decoded.userType === "ADMIN") {
      const admin = await prisma.admin.findUnique({
        where: { id: decoded.userId },
        include: { schoolAdmins: { where: { active: true }, take: 1 } }
      });
      if (admin) {
        userExists = true;
        schoolId = admin.schoolAdmins[0]?.schoolId;
        tenantId = admin.tenantId;
      }
    } else if (decoded.userType === "TEACHER") {
      const teacher = await prisma.teacher.findUnique({
        where: { id: decoded.userId }
      });
      if (teacher) {
        userExists = true;
        schoolId = teacher.activeSchoolId || teacher.primarySchoolId || undefined;
        tenantId = teacher.tenantId;
      }
    } else if (decoded.userType === "STUDENT") {
      const student = await prisma.student.findUnique({
        where: { id: decoded.userId }
      });
      if (student) {
        userExists = true;
        schoolId = student.schoolId || undefined;
        tenantId = student.tenantId;
      }
    } else if (decoded.userType === "PARENT") {
      const parent = await prisma.parent.findUnique({
        where: { id: decoded.userId }
      });
      if (parent) {
        userExists = true;
        tenantId = parent.tenantId;
      }
    } else {
      // Fallback check across entity models for unknown userType
      const [admin, teacher, student, parent] = await Promise.all([
        prisma.admin.findUnique({ where: { id: decoded.userId } }),
        prisma.teacher.findUnique({ where: { id: decoded.userId } }),
        prisma.student.findUnique({ where: { id: decoded.userId } }),
        prisma.parent.findUnique({ where: { id: decoded.userId } }),
      ]);
      userExists = !!(admin || teacher || student || parent);
    }

    if (!userExists) {
      console.warn(`[authMiddleware] User ID "${decoded.userId}" (${decoded.userType}) not found in database.`);
      return res.status(401).json({
        success: false,
        message: "User account no longer exists in the database. Please log in again.",
      });
    }

    req.user = {
      id: decoded.userId,
      userType: decoded.userType,
      schoolId: schoolId || undefined,
      tenantId: tenantId || undefined
    };

    next();
  } catch (error: any) {
    console.error("LOG ERROR: [authMiddleware] failure:", error);
    console.error("LOG ERROR: [authMiddleware] authHeader was:", req.header("Authorization"));
    console.error("LOG ERROR: [authMiddleware] cookies were:", req.cookies);
    const message = error.name === "TokenExpiredError" ? "Session expired, please login again" : "Invalid token";
    return res.status(401).json({
      success: false,
      message,
    });
  }
};