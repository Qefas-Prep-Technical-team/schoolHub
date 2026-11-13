import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma, { withRetry } from "../config/database";

// ─── In-memory session cache ──────────────────────────────────────────────────
// Short-lived cache to avoid hitting the DB on every request.
// This is the primary fix for random logouts caused by pgBouncer connection drops.
const sessionCache = new Map<string, { valid: boolean; schoolId?: string; tenantId?: string; name?: string; email?: string; role?: string; adminRole?: string; expiresAt: number }>();
const SESSION_CACHE_TTL_MS = 30_000; // 30 seconds

function getCachedSession(userId: string, userType: string) {
  const key = `${userId}:${userType}`;
  const cached = sessionCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached;
  sessionCache.delete(key);
  return null;
}

function setCachedSession(userId: string, userType: string, data: { valid: boolean; schoolId?: string; tenantId?: string; name?: string; email?: string; role?: string; adminRole?: string }) {
  sessionCache.set(`${userId}:${userType}`, { ...data, expiresAt: Date.now() + SESSION_CACHE_TTL_MS });
}

export function invalidateSessionCache(userId?: string, userType?: string) {
  if (userId && userType) {
    sessionCache.delete(`${userId}:${userType}`);
    return;
  }
  if (userId) {
    for (const key of sessionCache.keys()) {
      if (key.startsWith(`${userId}:`)) {
        sessionCache.delete(key);
      }
    }
    return;
  }
  sessionCache.clear();
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let decodedUserId: string | undefined;
  let decodedUserType: string | undefined;

  try {
    const authHeader = req.header("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : undefined;

    const token = bearerToken || req.cookies.token;

    if (!token) {
      console.warn(`[authMiddleware] Missing token | code=TOKEN_INVALID | route=${req.originalUrl}`);
      return res.status(401).json({
        success: false,
        code: "TOKEN_INVALID",
        message: "Access token required",
      });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
    decodedUserId = decoded.userId;
    decodedUserType = decoded.userType;

    let schoolId: string | undefined;
    let tenantId: string | undefined;
    let userName: string | undefined;
    let userEmail: string | undefined;
    let userRole: string | undefined;
    let adminRole: string | undefined;
    let userExists = false;

    // ── Cache check: skip DB on hot path ──────────────────────────────────
    const cached = getCachedSession(decoded.userId, decoded.userType);
    if (cached) {
      if (!cached.valid) {
        console.warn(`[authMiddleware] 401 Issued | code=USER_INACTIVE | userId=${decoded.userId} | route=${req.originalUrl}`);
        return res.status(401).json({
          success: false,
          code: "USER_INACTIVE",
          message: "User account no longer exists in the database. Please log in again.",
        });
      }
      userExists = true;
      schoolId = cached.schoolId;
      tenantId = cached.tenantId;
      userName = cached.name;
      userEmail = cached.email;
      userRole = cached.role;
      adminRole = cached.adminRole;
    } else {
      // ── DB lookup wrapped in withRetry ──────────────────────────────────
      if (decoded.userType === "ADMIN") {
        const admin = await withRetry(
          () =>
            prisma.admin.findUnique({
              where: { id: decoded.userId },
              include: { schoolAdmins: { where: { active: true }, take: 1 } },
            }),
          "authMiddleware_admin_findUnique"
        );
        if (admin && admin.isActive !== false) {
          userExists = true;
          schoolId = admin.schoolAdmins[0]?.schoolId;
          adminRole = admin.schoolAdmins[0]?.role;
          tenantId = admin.tenantId;
          userName = admin.name;
          userEmail = admin.email;
          userRole = admin.role;
        }
      } else if (decoded.userType === "SUPER_ADMIN") {
        const admin = await withRetry(
          () => prisma.admin.findUnique({ where: { id: decoded.userId } }),
          "authMiddleware_superAdmin_findUnique"
        );
        if (admin && admin.isActive !== false) {
          userExists = true;
          tenantId = admin.tenantId;
          userName = admin.name;
          userEmail = admin.email;
          userRole = admin.role;
        }
      } else if (decoded.userType === "TEACHER") {
        const teacher = await withRetry(
          () => prisma.teacher.findUnique({ where: { id: decoded.userId } }),
          "authMiddleware_teacher_findUnique"
        );
        if (teacher && teacher.isActive !== false) {
          userExists = true;
          const candidateSchoolId =
            (teacher as any).activeSchoolId ||
            (teacher as any).primarySchoolId ||
            (teacher as any).currentSchoolId ||
            (teacher as any).schoolId ||
            undefined;

          if ((teacher as any).isClaimed !== false) {
            const activeSchoolLinks = await withRetry(
              () =>
                prisma.relationshipLink.findMany({
                  where: {
                    linkType: "SCHOOL_TEACHER",
                    status: "ACTIVE",
                    OR: [
                      { leftEntityId: teacher.id, leftEntityType: "TEACHER" },
                      { rightEntityId: teacher.id, rightEntityType: "TEACHER" },
                    ],
                  },
                  select: {
                    schoolId: true,
                    leftEntityType: true,
                    leftEntityId: true,
                    rightEntityType: true,
                    rightEntityId: true,
                  },
                }),
              "authMiddleware_teacher_activeSchoolLinks"
            );

            const linkedSchoolIds = activeSchoolLinks
              .map(
                (l) =>
                  l.schoolId ||
                  (l.leftEntityType === "SCHOOL"
                    ? l.leftEntityId
                    : l.rightEntityType === "SCHOOL"
                      ? l.rightEntityId
                      : null),
              )
              .filter(Boolean) as string[];

            if (candidateSchoolId && linkedSchoolIds.includes(candidateSchoolId)) {
              schoolId = candidateSchoolId;
            } else if (linkedSchoolIds.length > 0) {
              schoolId = linkedSchoolIds[0];
              prisma.teacher
                .update({
                  where: { id: teacher.id },
                  data: { activeSchoolId: schoolId },
                })
                .catch((e) =>
                  console.error(
                    "[authMiddleware] Failed to self-heal teacher activeSchoolId:",
                    e,
                  ),
                );
            } else {
              schoolId = undefined;
              if (candidateSchoolId) {
                prisma.teacher
                  .update({
                    where: { id: teacher.id },
                    data: {
                      activeSchoolId:
                        (teacher as any).activeSchoolId === candidateSchoolId
                          ? null
                          : (teacher as any).activeSchoolId,
                      primarySchoolId:
                        (teacher as any).primarySchoolId === candidateSchoolId
                          ? null
                          : (teacher as any).primarySchoolId,
                      currentSchoolId:
                        (teacher as any).currentSchoolId === candidateSchoolId
                          ? null
                          : (teacher as any).currentSchoolId,
                      schoolId:
                        (teacher as any).schoolId === candidateSchoolId
                          ? null
                          : (teacher as any).schoolId,
                    },
                  })
                  .catch((e) =>
                    console.error(
                      "[authMiddleware] Failed to clear stale teacher school pointers:",
                      e,
                    ),
                  );
              }
            }
          } else {
            schoolId = candidateSchoolId;
          }

          tenantId = (teacher as any).tenantId;
          userName = teacher.name;
          userEmail = teacher.email || undefined;
          userRole = teacher.role;
        }
      } else if (decoded.userType === "STUDENT") {
        const student = await withRetry(
          () => prisma.student.findUnique({ where: { id: decoded.userId } }),
          "authMiddleware_student_findUnique"
        );
        if (student && student.isActive !== false) {
          userExists = true;
          schoolId = student.schoolId || undefined;
          tenantId = student.tenantId;
          userName = student.name;
          userEmail = student.email || undefined;
          userRole = "STUDENT";
        }
      } else if (decoded.userType === "PARENT") {
        const parent = await withRetry(
          () => prisma.parent.findUnique({ where: { id: decoded.userId } }),
          "authMiddleware_parent_findUnique"
        );
        if (parent && parent.isActive !== false) {
          userExists = true;
          tenantId = parent.tenantId;
          userName = parent.fullName;
          userEmail = parent.email || undefined;
          userRole = "PARENT";
        }
      } else {
        const [admin, teacher, student, parent] = await withRetry(
          () =>
            Promise.all([
              prisma.admin.findUnique({ where: { id: decoded.userId } }),
              prisma.teacher.findUnique({ where: { id: decoded.userId } }),
              prisma.student.findUnique({ where: { id: decoded.userId } }),
              prisma.parent.findUnique({ where: { id: decoded.userId } }),
            ]),
          "authMiddleware_multiRole_findUnique"
        );
        const matched = admin || teacher || student || parent;
        userExists = !!(matched && (matched as any).isActive !== false);
        if (matched) {
          userName = (matched as any).name || (matched as any).fullName;
          userEmail = (matched as any).email;
          userRole = (matched as any).role || decoded.userType;
        }
      }

      setCachedSession(decoded.userId, decoded.userType, { valid: userExists, schoolId, tenantId, name: userName, email: userEmail, role: userRole, adminRole });
    }

    if (!userExists) {
      console.warn(`[authMiddleware] 401 Issued | code=USER_INACTIVE | userId=${decoded.userId} (${decoded.userType}) | route=${req.originalUrl}`);
      return res.status(401).json({
        success: false,
        code: "USER_INACTIVE",
        message: "User account no longer exists or has been deactivated. Please log in again.",
      });
    }

    // Require schoolId for Teachers and Students (403 — not a session issue, don't logout)
    if ((decoded.userType === "TEACHER" || decoded.userType === "STUDENT") && !schoolId) {
      const allowedPatterns = [
        "/auth",
        "/links",
        "/subscription",
        "/notifications",
        "/settings",
        "/profile",
        "/schools",
        "/classes",
        "/teacher",
        "/student",
        "/sessions",
        "/grades",
        "/academic",
        "/support",
        "/ai-complaints",
        "/upload",
        "/payment",
        "/finance",
      ];

      const isAllowed = allowedPatterns.some((pattern) =>
        req.originalUrl.includes(pattern)
      );

      if (!isAllowed) {
        console.warn(
          `[authMiddleware] User ID "${decoded.userId}" (${decoded.userType}) has no schoolId on protected route ${req.originalUrl}`
        );
        return res.status(403).json({
          success: false,
          code: "SCHOOL_LINK_REQUIRED",
          message:
            "Your account is not linked to a school yet. Please contact your school admin.",
        });
      }
    }

    // Check if the session/device is still authorized and not revoked
    const deviceModel = req.header("x-device-model");
    let activeSession = null;

    if (deviceModel) {
      activeSession = await withRetry(
        () =>
          prisma.refreshToken.findFirst({
            where: {
              userId: decoded.userId,
              isValid: true,
              deviceModel: deviceModel as string,
            },
            orderBy: { createdAt: "desc" },
          }),
        "authMiddleware_session_findFirst_device"
      );
    }

    // Fallback: Check for any valid active session for this user
    if (!activeSession) {
      activeSession = await withRetry(
        () =>
          prisma.refreshToken.findFirst({
            where: {
              userId: decoded.userId,
              isValid: true,
            },
            orderBy: { createdAt: "desc" },
          }),
        "authMiddleware_session_findFirst_fallback"
      );

      // Opportunistically enrich deviceModel if it was previously Unknown Device
      if (activeSession && deviceModel && (!activeSession.deviceModel || activeSession.deviceModel === "Unknown Device")) {
        prisma.refreshToken
          .update({
            where: { id: activeSession.id },
            data: { deviceModel: String(deviceModel).slice(0, 100) },
          })
          .catch(() => { });
      }
    }

    if (!activeSession) {
      console.warn(`[authMiddleware] 401 Issued | code=NO_SESSION_ROW | userId=${decoded.userId} | route=${req.originalUrl}`);
      return res.status(401).json({
        success: false,
        code: "NO_SESSION_ROW",
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
      adminRole: adminRole || undefined,
    };

    next();
  } catch (error: any) {
    if (error instanceof jwt.TokenExpiredError) {
      console.warn(`[authMiddleware] 401 Issued | code=TOKEN_EXPIRED | userId=${decodedUserId || "unknown"} | route=${req.originalUrl}`);
      return res.status(401).json({
        success: false,
        code: "TOKEN_EXPIRED",
        message: "Session expired, please login again",
      });
    }

    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.NotBeforeError) {
      console.warn(`[authMiddleware] 401 Issued | code=TOKEN_INVALID | userId=${decodedUserId || "unknown"} | route=${req.originalUrl} | reason=${error.message}`);
      return res.status(401).json({
        success: false,
        code: "TOKEN_INVALID",
        message: "Invalid token",
      });
    }

    // Non-auth error (database connection, Prisma, unexpected runtime errors)
    // NEVER return 401 for server/network/DB blips, so clients don't drop user credentials!
    console.error("[authMiddleware] 503 Service Unavailable encountered:", {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      userId: decodedUserId,
      route: req.originalUrl,
      stack: error?.stack,
    });

    return res.status(503).json({
      success: false,
      code: "SERVICE_UNAVAILABLE",
      message: "Temporary error, please retry",
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