import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/database";

// ─── In-memory session cache ──────────────────────────────────────────────────
// Short-lived cache to avoid hitting the DB on every request.
// This is the primary fix for random logouts caused by pgBouncer connection drops.
const sessionCache = new Map<string, { valid: boolean; schoolId?: string; tenantId?: string; name?: string; email?: string; role?: string; expiresAt: number }>();
const SESSION_CACHE_TTL_MS = 30_000; // 30 seconds

function getCachedSession(userId: string, userType: string) {
  const key = `${userId}:${userType}`;
  const cached = sessionCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached;
  sessionCache.delete(key);
  return null;
}

function setCachedSession(userId: string, userType: string, data: { valid: boolean; schoolId?: string; tenantId?: string; name?: string; email?: string; role?: string }) {
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
    let userName: string | undefined;
    let userEmail: string | undefined;
    let userRole: string | undefined;
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
      userName = cached.name;
      userEmail = cached.email;
      userRole = cached.role;
    } else {
      // ── DB lookup ──────────────────────────────────────────────────────
      if (decoded.userType === "ADMIN") {
        const admin = await prisma.admin.findUnique({
          where: { id: decoded.userId },
          include: { schoolAdmins: { where: { active: true }, take: 1 } }
        });
        if (admin && admin.isActive !== false) {
          userExists = true;
          schoolId = admin.schoolAdmins[0]?.schoolId;
          tenantId = admin.tenantId;
          userName = admin.name;
          userEmail = admin.email;
          userRole = admin.role;
        }
      } else if (decoded.userType === "SUPER_ADMIN") {
        const admin = await prisma.admin.findUnique({ where: { id: decoded.userId } });
        if (admin && admin.isActive !== false) {
          userExists = true;
          tenantId = admin.tenantId;
          userName = admin.name;
          userEmail = admin.email;
          userRole = admin.role;
        }
      } else if (decoded.userType === "TEACHER") {
        const teacher = await prisma.teacher.findUnique({ where: { id: decoded.userId } });
        if (teacher && teacher.isActive !== false) {
          userExists = true;
          schoolId = (teacher as any).activeSchoolId || (teacher as any).primarySchoolId || (teacher as any).currentSchoolId || (teacher as any).schoolId || undefined;
          tenantId = (teacher as any).tenantId;
          userName = teacher.name;
          userEmail = teacher.email || undefined;
          userRole = teacher.role;
        }
      } else if (decoded.userType === "STUDENT") {
        const student = await prisma.student.findUnique({ where: { id: decoded.userId } });
        if (student && student.isActive !== false) {
          userExists = true;
          schoolId = student.schoolId || undefined;
          tenantId = student.tenantId;
          userName = student.name;
          userEmail = student.email || undefined;
          userRole = "STUDENT";
        }
      } else if (decoded.userType === "PARENT") {
        const parent = await prisma.parent.findUnique({ where: { id: decoded.userId } });
        if (parent && parent.isActive !== false) {
          userExists = true;
          tenantId = parent.tenantId;
          userName = parent.fullName;
          userEmail = parent.email || undefined;
          userRole = "PARENT";
        }
      } else {
        const [admin, teacher, student, parent] = await Promise.all([
          prisma.admin.findUnique({ where: { id: decoded.userId } }),
          prisma.teacher.findUnique({ where: { id: decoded.userId } }),
          prisma.student.findUnique({ where: { id: decoded.userId } }),
          prisma.parent.findUnique({ where: { id: decoded.userId } }),
        ]);
        const matched = admin || teacher || student || parent;
        userExists = !!(matched && (matched as any).isActive !== false);
        if (matched) {
          userName = (matched as any).name || (matched as any).fullName;
          userEmail = (matched as any).email;
          userRole = (matched as any).role || decoded.userType;
        }
      }

      setCachedSession(decoded.userId, decoded.userType, { valid: userExists, schoolId, tenantId, name: userName, email: userEmail, role: userRole });
    }

    if (!userExists) {
      console.warn(`[authMiddleware] User ID "${decoded.userId}" (${decoded.userType}) not found or account is deactivated.`);
      return res.status(401).json({
        success: false,
        message: "User account no longer exists or has been deactivated. Please log in again.",
      });
    }

    // Require schoolId for Teachers and Students (403 — not a session issue, don't logout)
    // EXEMPTION: Allow /auth routes (like sessions, me) and independent teachers
    if ((decoded.userType === "TEACHER" || decoded.userType === "STUDENT") && !schoolId) {
      const isAuthRoute = req.originalUrl.includes('/auth/');
      const isSettingsRoute = req.originalUrl.includes('/settings') || req.originalUrl.includes('/profile');
      
      if (!isAuthRoute && !isSettingsRoute) {
        console.warn(`[authMiddleware] User ID "${decoded.userId}" (${decoded.userType}) has no schoolId on protected route ${req.originalUrl}`);
        return res.status(403).json({
          success: false,
          message: "Your account is not linked to a school yet. Please contact your school admin.",
        });
      }
    }

    // Check if the session/device is still authorized and not revoked
    const deviceModel = req.header("x-device-model");
    let activeSession = null;

    if (deviceModel) {
      activeSession = await prisma.refreshToken.findFirst({
        where: {
          userId: decoded.userId,
          isValid: true,
          deviceModel: deviceModel as string,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // Fallback: Check for any valid active session for this user
    if (!activeSession) {
      activeSession = await prisma.refreshToken.findFirst({
        where: {
          userId: decoded.userId,
          isValid: true,
        },
        orderBy: { createdAt: "desc" },
      });

      // Opportunistically enrich deviceModel if it was previously Unknown Device
      if (activeSession && deviceModel && (!activeSession.deviceModel || activeSession.deviceModel === "Unknown Device")) {
        prisma.refreshToken
          .update({
            where: { id: activeSession.id },
            data: { deviceModel: String(deviceModel).slice(0, 100) },
          })
          .catch(() => {});
      }
    }

    if (!activeSession) {
      console.warn(`[authMiddleware] User ID "${decoded.userId}" session not found or no longer valid.`);
      return res.status(401).json({
        success: false,
        message: "Session no longer valid. Please log in again.",
      });
    }

    req.user = {
      id: decoded.userId,
      userId: decoded.userId,
      userType: decoded.userType,
      schoolId: schoolId || undefined,
      tenantId: tenantId || undefined,
      name: userName || undefined,
      email: userEmail || undefined,
      role: userRole || decoded.userType,
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

/**
 * Middleware to restrict route access to specific UserRole(s)
 */
export const requireRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to access this resource",
      });
    }
    next();
  };
};