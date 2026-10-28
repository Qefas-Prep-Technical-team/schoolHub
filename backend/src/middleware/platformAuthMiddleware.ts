import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/database";

/**
 * Middleware to authenticate and guard Internal Platform Staff only.
 * Isolated from normal school tenant authentication.
 */
export const authenticatePlatformStaff = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.header("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : undefined;

    const token = bearerToken || req.cookies?.platform_token || req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Platform access token required",
      });
    }

    let decoded: any = null;
    const secret = process.env.JWT_PLATFORM_SECRET || process.env.JWT_ACCESS_SECRET!;
    try {
      decoded = jwt.verify(token, secret);
    } catch {
      // Fallback to ACCESS_SECRET if different
      const fallbackSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_PLATFORM_SECRET!;
      decoded = jwt.verify(token, fallbackSecret);
    }

    // Case 1: Standard PlatformStaff token
    if (decoded.isPlatformStaff && decoded.staffId) {
      const staff = await prisma.platformStaff.findUnique({
        where: { id: decoded.staffId },
      });

      if (!staff || !staff.isActive) {
        return res.status(401).json({
          success: false,
          message: "Staff account not found or deactivated",
        });
      }

      const socialObj = (staff.socialLinks && typeof staff.socialLinks === "object") ? (staff.socialLinks as Record<string, any>) : {};
      const agentDisplayName = (staff as any).displayName || socialObj.displayName || socialObj.agentDisplayName || staff.fullName;

      (req as any).staff = {
        id: staff.id,
        email: staff.email,
        fullName: staff.fullName,
        displayName: agentDisplayName,
        role: staff.role,
      };

      return next();
    }

    // Case 2: Platform staff matched by email or userId
    if (decoded.email) {
      const staff = await prisma.platformStaff.findFirst({
        where: { email: decoded.email, isActive: true },
      });
      if (staff) {
        const socialObj = (staff.socialLinks && typeof staff.socialLinks === "object") ? (staff.socialLinks as Record<string, any>) : {};
        const agentDisplayName = (staff as any).displayName || socialObj.displayName || socialObj.agentDisplayName || staff.fullName;

        (req as any).staff = {
          id: staff.id,
          email: staff.email,
          fullName: staff.fullName,
          displayName: agentDisplayName,
          role: staff.role,
        };
        return next();
      }
    }

    // Case 3: Super Admin / Admin account from schoolHub Admin table
    const adminId = decoded.userId || decoded.id;
    if (adminId) {
      const admin = await prisma.admin.findUnique({
        where: { id: adminId },
      });
      if (admin) {
        (req as any).staff = {
          id: admin.id,
          email: admin.email,
          fullName: admin.name,
          displayName: (admin as any).displayName || admin.name,
          role: "OWNER", // Treat system administrator as OWNER with full support privileges
        };
        return next();
      }
    }

    return res.status(403).json({
      success: false,
      message: "Forbidden: Not an authorized platform staff or administrator",
    });
  } catch (error: any) {
    console.error("LOG ERROR: [platformAuthMiddleware] failure:", error);
    const message = error.name === "TokenExpiredError" ? "Platform session expired" : "Invalid platform token";
    return res.status(401).json({
      success: false,
      message,
    });
  }
};

/**
 * Role-based guard for specific platform roles
 */
export const authorizePlatformRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const staffRole = (req as any).staff?.role;
    
    if (!staffRole || !roles.includes(staffRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires one of the following roles: ${roles.join(", ")}`,
      });
    }
    
    next();
  };
};
