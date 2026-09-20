// middleware/adminMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { AdminRole, UserRole } from "@prisma/client";
import prisma from "../../config/database";
import { handleError } from "../../utils/error-handler";

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

// ─── Internal helper: load admin + schoolAdmin from DB ───────────────────────
// Returns null and sends an appropriate HTTP response if validation fails.
// Returns the admin record on success so callers can use it without another DB call.
async function loadAndValidateAdmin(
  req: Request,
  res: Response,
): Promise<{ admin: any } | null> {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Authentication required" });
    return null;
  }

  if (req.user.userType !== UserRole.ADMIN) {
    res.status(403).json({ success: false, message: "Admin access required" });
    return null;
  }

  const admin = await prisma.admin.findUnique({
    where: { id: req.user.id },
    include: {
      schoolAdmins: {
        where: { active: true },
        include: { school: true },
      },
    },
  });

  if (!admin) {
    res.status(404).json({ success: false, message: "Admin not found" });
    return null;
  }

  if (admin.status !== "APPROVED") {
    const message =
      admin.status === "PENDING"
        ? "Your account is awaiting approval from the school administrator."
        : "Your account registration was not approved. Please contact the school.";
    res.status(403).json({ success: false, message });
    return null;
  }

  // Attach admin info to request
  req.admin = {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    status: admin.status,
  };

  // Attach the first active school association
  if (admin.schoolAdmins.length > 0) {
    req.school = admin.schoolAdmins[0].school;
    req.adminRole = admin.schoolAdmins[0].role;
  }

  return { admin };
}

// ─── Middleware: requireAdmin ─────────────────────────────────────────────────
// Verifies the user is an authenticated, APPROVED admin.
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await loadAndValidateAdmin(req, res);
    if (!result) return; // Response already sent
    next();
  } catch (error) {
    return handleError(res, error, "admin.requireAdmin");
  }
};

// ─── Middleware: requireAdminApproval ─────────────────────────────────────────
// Blocks login/access for PENDING or REJECTED admins cleanly.
// Use this at the login layer before issuing tokens.
export const requireAdminApproval = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    if (req.user.userType !== UserRole.ADMIN) {
      return next(); // Not an admin — not our concern
    }

    const admin = await prisma.admin.findUnique({
      where: { id: req.user.id },
      select: { status: true },
    });

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    if (admin.status === "PENDING") {
      return res.status(403).json({
        success: false,
        message: "Your account is awaiting approval from the school administrator.",
        code: "ADMIN_PENDING",
      });
    }

    if (admin.status === "REJECTED") {
      return res.status(403).json({
        success: false,
        message: "Your account registration was not approved. Please contact the school.",
        code: "ADMIN_REJECTED",
      });
    }

    next();
  } catch (error) {
    return handleError(res, error, "admin.requireAdminApproval");
  }
};

// ─── Middleware factory: requireAdminRole ─────────────────────────────────────
// Verifies admin is approved AND holds one of the specified school roles.
export const requireAdminRole = (requiredRoles: AdminRole | AdminRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Step 1: Load and validate admin (handles auth + approval check)
      const result = await loadAndValidateAdmin(req, res);
      if (!result) return; // Response already sent by loadAndValidateAdmin

      // Step 2: Check school association exists
      if (!req.adminRole) {
        return res.status(403).json({
          success: false,
          message: "No active school association found for your account.",
        });
      }

      // Step 3: Block PENDING-role admins (safety net)
      if (req.adminRole === AdminRole.PENDING) {
        return res.status(403).json({
          success: false,
          message: "Your role has not been assigned yet. Please wait for approval.",
          code: "ADMIN_PENDING",
        });
      }

      // Step 4: Check the specific role requirement
      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

      if (!roles.includes(req.adminRole)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. This action requires one of the following roles: ${roles.filter(r => r !== AdminRole.PENDING).join(", ")}.`,
        });
      }

      next();
    } catch (error) {
      return handleError(res, error, "admin.requireAdminRole");
    }
  };
};

// ─── Convenience role middlewares ─────────────────────────────────────────────
export const requireSchoolOwner = requireAdminRole(AdminRole.SCHOOL_OWNER);
export const requirePrincipal   = requireAdminRole(AdminRole.PRINCIPAL);
export const requireRegistrar   = requireAdminRole(AdminRole.REGISTRAR);
export const requireAccountant  = requireAdminRole(AdminRole.ACCOUNTANT);

// SCHOOL_OWNER or PRINCIPAL — can approve/reject admin requests
export const requireSchoolOwnerOrPrincipal = requireAdminRole([
  AdminRole.SCHOOL_OWNER,
  AdminRole.PRINCIPAL,
]);

// SCHOOL_OWNER, PRINCIPAL or REGISTRAR — academics access
export const requireSchoolOwnerPrincipalOrRegistrar = requireAdminRole([
  AdminRole.SCHOOL_OWNER,
  AdminRole.PRINCIPAL,
  AdminRole.REGISTRAR,
]);

// ─── Middleware: requireSuperAdmin ────────────────────────────────────────────
export const requireSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await loadAndValidateAdmin(req, res);
    if (!result) return;

    const isSuperAdmin = result.admin.schoolAdmins.some(
      (sa: any) => sa.role === AdminRole.SUPER_ADMIN,
    );

    if (!isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "Super admin access required",
      });
    }

    next();
  } catch (error) {
    return handleError(res, error, "admin.requireSuperAdmin");
  }
};

// ─── Middleware factory: requireSchoolAccess ──────────────────────────────────
export const requireSchoolAccess = (schoolId?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await loadAndValidateAdmin(req, res);
      if (!result) return;

      const targetSchoolId =
        schoolId || req.params.schoolId || req.body.schoolId;

      if (!targetSchoolId) {
        return res.status(400).json({
          success: false,
          message: "School ID required",
        });
      }

      const schoolAccess = await prisma.schoolAdmin.findFirst({
        where: {
          adminId: req.user!.id,
          schoolId: targetSchoolId,
          active: true,
        },
      });

      if (!schoolAccess) {
        return res.status(403).json({
          success: false,
          message: "No access to this school",
        });
      }

      const school = await prisma.school.findUnique({
        where: { id: targetSchoolId },
      });

      if (school) {
        req.school = school;
        req.adminRole = schoolAccess.role;
      }

      next();
    } catch (error) {
      return handleError(res, error, "admin.requireSchoolAccess");
    }
  };
};
