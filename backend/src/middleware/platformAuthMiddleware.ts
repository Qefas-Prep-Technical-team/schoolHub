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

    const token = bearerToken || req.cookies.platform_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Platform access token required",
      });
    }

    const secret = process.env.JWT_PLATFORM_SECRET || process.env.JWT_ACCESS_SECRET!;
    const decoded: any = jwt.verify(token, secret);
    
    // Safety check: Ensure this token belongs to a platform staff (Step E requirement)
    if (!decoded.isPlatformStaff || !decoded.staffId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Not a platform staff token",
      });
    }

    // Verify staff exists and is active in the separate PlatformStaff table
    const staff = await prisma.platformStaff.findUnique({
      where: { id: decoded.staffId },
    });

    if (!staff || !staff.isActive) {
      return res.status(401).json({
        success: false,
        message: "Staff account not found or deactivated",
      });
    }

    // Attach staff context to request (isolated from req.user)
    (req as any).staff = {
      id: staff.id,
      email: staff.email,
      fullName: staff.fullName,
      role: staff.role,
    };

    next();
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
