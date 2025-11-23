// middleware/adminMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { AdminRole, UserRole } from "generated/prisma";
import prisma from "../../config/database";

// Extend Express Request type to include admin and school
declare global {
  namespace Express {
    interface Request {
      admin?: {
        id: string;
        email: string;
        name: string;
        role: UserRole;
        status: string;
      };
      school?: {
        id: string;
        name: string;
        tenantId: string;
      };
      adminRole?: AdminRole; // Specific role in the school
    }
  }
}

// Middleware to check if user is an admin
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (req.user.userType !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    // Get admin details
    const admin = await prisma.admin.findUnique({
      where: { id: req.user.id },
      include: {
        schoolAdmins: {
          include: {
            school: true,
          },
        },
      },
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (admin.status !== "APPROVED") {
      return res.status(403).json({
        success: false,
        message: "Admin account not approved",
      });
    }

    // Attach admin and school info to request
    req.admin = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      status: admin.status,
    };

    // If admin is associated with a school, attach school info
    if (admin.schoolAdmins.length > 0) {
      req.school = admin.schoolAdmins[0].school;
      req.adminRole = admin.schoolAdmins[0].role;
    }

    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Middleware to check for specific admin roles
export const requireAdminRole = (requiredRoles: AdminRole | AdminRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await requireAdmin(req, res, () => {}); // First check if user is admin

      if (!req.adminRole) {
        return res.status(403).json({
          success: false,
          message: "No school association found",
        });
      }

      const roles = Array.isArray(requiredRoles)
        ? requiredRoles
        : [requiredRoles];

      if (!roles.includes(req.adminRole)) {
        return res.status(403).json({
          success: false,
          message: `Insufficient permissions. Required role: ${roles.join(
            " or "
          )}`,
        });
      }

      next();
    } catch (error) {
      console.error("Admin role middleware error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  };
};

// Specific role middlewares for convenience
export const requireSchoolOwner = requireAdminRole(AdminRole.SCHOOL_OWNER);
export const requirePrincipal = requireAdminRole(AdminRole.PRINCIPAL);
export const requireRegistrar = requireAdminRole(AdminRole.REGISTRAR);
export const requireAccountant = requireAdminRole(AdminRole.ACCOUNTANT);

// Middleware for super admin (system-wide)
export const requireSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await requireAdmin(req, res, () => {}); // First check if user is admin

    const admin = await prisma.admin.findUnique({
      where: { id: req.user!.id },
      include: {
        schoolAdmins: {
          include: {
            school: true,
          },
        },
      },
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Check if admin has SUPER_ADMIN role in any school
    const isSuperAdmin = admin.schoolAdmins.some(
      (sa) => sa.role === AdminRole.SUPER_ADMIN
    );

    if (!isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "Super admin access required",
      });
    }

    next();
  } catch (error) {
    console.error("Super admin middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Middleware to check if admin has access to specific school
export const requireSchoolAccess = (schoolId?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await requireAdmin(req, res, () => {}); // First check if user is admin

      const targetSchoolId =
        schoolId || req.params.schoolId || req.body.schoolId;

      if (!targetSchoolId) {
        return res.status(400).json({
          success: false,
          message: "School ID required",
        });
      }

      // Check if admin has access to this school
      const schoolAccess = await prisma.schoolAdmin.findFirst({
        where: {
          adminId: req.user!.id,
          schoolId: targetSchoolId,
        },
      });

      if (!schoolAccess) {
        return res.status(403).json({
          success: false,
          message: "No access to this school",
        });
      }

      // Update req.school and req.adminRole for this specific school
      const school = await prisma.school.findUnique({
        where: { id: targetSchoolId },
      });

      if (school) {
        req.school = school;
        req.adminRole = schoolAccess.role;
      }

      next();
    } catch (error) {
      console.error("School access middleware error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  };
};
