import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/database";

// ─── In-memory session cache ──────────────────────────────────────────────────
// Short-lived cache to avoid hitting the DB on every request.
// This is the primary fix for random logouts caused by pgBouncer connection drops.
const sessionCache = new Map<string, { valid: boolean; schoolId?: string; tenantId?: string; expiresAt: number }>();
const SESSION_CACHE_TTL_MS = 30_000; // 30 seconds

function getCachedSession(userId: string, userType: string) {
  const key = `${userId}:${userType}`;
  const cached = sessionCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached;
  sessionCache.delete(key);
  return null;
}

function setCachedSession(userId: string, userType: string, data: { valid: boolean; schoolId?: string; tenantId?: string }) {
  sessionCache.set(`${userId}:${userType}`, { ...data, expiresAt: Date.now() + SESSION_CACHE_TTL_MS });
}

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

    // ── Cache check: skip DB on hot path ──────────────────────────────────
    const cached = getCachedSession(decoded.userId, decoded.userType);
    if (cached) {
      if (!cached.valid) {
        return res.status(401).json({ success: false, message: "User account no longer exists in the database. Please log in again." });
      }
      userExists = true;
      schoolId = cached.schoolId;
      tenantId = cached.tenantId;
    } else {
      // ── DB lookup ──────────────────────────────────────────────────────
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
      } else if (decoded.userType === "SUPER_ADMIN") {
        const admin = await prisma.admin.findUnique({ where: { id: decoded.userId } });
        if (admin) {
          userExists = true;
          tenantId = admin.tenantId;
        }
      } else if (decoded.userType === "TEACHER") {
        const teacher = await prisma.teacher.findUnique({ where: { id: decoded.userId } });
        if (teacher) {
          userExists = true;
          schoolId = teacher.activeSchoolId || teacher.primarySchoolId || undefined;
          tenantId = teacher.tenantId;
        }
      } else if (decoded.userType === "STUDENT") {
        const student = await prisma.student.findUnique({ where: { id: decoded.userId } });
        if (student) {
          userExists = true;
          schoolId = student.schoolId || undefined;
          tenantId = student.tenantId;
        }
      } else if (decoded.userType === "PARENT") {
        const parent = await prisma.parent.findUnique({ where: { id: decoded.userId } });
        if (parent) {
          userExists = true;
          tenantId = parent.tenantId;
        }
      } else {
        const [admin, teacher, student, parent] = await Promise.all([
          prisma.admin.findUnique({ where: { id: decoded.userId } }),
          prisma.teacher.findUnique({ where: { id: decoded.userId } }),
          prisma.student.findUnique({ where: { id: decoded.userId } }),
          prisma.parent.findUnique({ where: { id: decoded.userId } }),
        ]);
        userExists = !!(admin || teacher || student || parent);
      }

      setCachedSession(decoded.userId, decoded.userType, { valid: userExists, schoolId, tenantId });
    }

    if (!userExists) {
      console.warn(`[authMiddleware] User ID "${decoded.userId}" (${decoded.userType}) not found in database.`);
      return res.status(401).json({
        success: false,
        message: "User account no longer exists in the database. Please log in again.",
      });
    }

    // Require schoolId for Teachers and Students (403 — not a session issue, don't logout)
    if ((decoded.userType === "TEACHER" || decoded.userType === "STUDENT") && !schoolId) {
      console.warn(`[authMiddleware] User ID "${decoded.userId}" (${decoded.userType}) has no schoolId.`);
      return res.status(403).json({
        success: false,
        message: "Your account is not linked to a school yet. Please contact your school admin.",
      });
    }

    // Check if the session/device is still authorized
    const deviceModel = req.header("x-device-model");
    const activeSession = await prisma.refreshToken.findFirst({
      where: {
        userId: decoded.userId,
        isValid: true,
        ...(deviceModel ? { deviceModel: deviceModel as string } : {})
      }
    });

    if (!activeSession) {
      console.warn(`[authMiddleware] User ID "${decoded.userId}" session not found or no longer valid.`);
      return res.status(401).json({
        success: false,
        message: "Device no longer authorized",
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