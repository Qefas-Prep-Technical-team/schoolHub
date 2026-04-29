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
    
    // Fetch schoolId and tenantId based on user type
    let schoolId: string | undefined;
    let tenantId: string | undefined;
    
    if (decoded.userType === "ADMIN") {
      const admin = await prisma.admin.findUnique({
        where: { id: decoded.userId },
        include: { schoolAdmins: { where: { active: true }, take: 1 } }
      });
      schoolId = admin?.schoolAdmins[0]?.schoolId;
      tenantId = admin?.tenantId;
    } else if (decoded.userType === "TEACHER") {
      const teacher = await prisma.teacher.findUnique({
        where: { id: decoded.userId }
      });
<<<<<<< HEAD
      schoolId = teacher?.activeSchoolId || teacher?.primarySchoolId || undefined;
=======
      schoolId = (teacher?.activeSchoolId || teacher?.primarySchoolId) ?? undefined;
>>>>>>> be22764e1e3563322c0acc4c834adbfe0d64c76e
      tenantId = teacher?.tenantId;
    } else if (decoded.userType === "STUDENT") {
      const student = await prisma.student.findUnique({
        where: { id: decoded.userId }
      });
<<<<<<< HEAD
      schoolId = student?.schoolId || undefined;
=======
      schoolId = student?.schoolId ?? undefined;
>>>>>>> be22764e1e3563322c0acc4c834adbfe0d64c76e
      tenantId = student?.tenantId;
    }

    console.log("LOG: [authMiddleware] User verified", { 
      userId: decoded.userId, 
      userType: decoded.userType,
      schoolId 
    });

    req.user = {
      id: decoded.userId,
      userType: decoded.userType,
      schoolId: schoolId || undefined,
      tenantId: tenantId || undefined
    };

    console.log("LOG: [authMiddleware] Proceeding to next handler for user:", req.user.id, "Context:", { schoolId, tenantId });
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