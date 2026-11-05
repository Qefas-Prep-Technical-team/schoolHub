import { Request, Response, NextFunction } from "express";
import { AdminRole, UserRole } from "@prisma/client";
import prisma from "../../config/database";
import { handleError } from "../../utils/error-handler";

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
      adminRole?: AdminRole;
    }
  }
}

interface LoadedAdmin {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: string;
  schoolAdmins: Array<{
    schoolId: string;
    role: AdminRole;
    school: { id: string; name: string; tenantId: string };
  }>;
}

async function loadAndValidateAdmin(
  req: Request,
  res: Response,
): Promise<{ admin: LoadedAdmin } | null> {
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

  req.admin = {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    status: admin.status,
  };

  const requestedSchoolId =
    (typeof req.params?.schoolId === "string" ? req.params.schoolId : undefined) ||
    (typeof req.query?.schoolId === "string" ? req.query.schoolId : undefined) ||
    (typeof req.body?.schoolId === "string" ? req.body.schoolId : undefined);

  if (requestedSchoolId) {
    const matchedAssociation = admin.schoolAdmins.find(
      (sa) =>
        sa.schoolId === requestedSchoolId ||
        sa.school.id === requestedSchoolId ||
        sa.school.tenantId === requestedSchoolId,
    );

    if (!matchedAssociation) {
      const isSuperAdmin = admin.schoolAdmins.some(
        (sa) => sa.role === AdminRole.SUPER_ADMIN,
      );

      if (!isSuperAdmin) {
        res.status(403).json({
          success: false,
          message: "You do not have administrative access to this school.",
        });
        return null;
      }
    } else {
      req.school = matchedAssociation.school;
      req.adminRole = matchedAssociation.role;
    }
  } else if (admin.schoolAdmins.length > 0) {
    req.school = admin.schoolAdmins[0].school;
    req.adminRole = admin.schoolAdmins[0].role;
  }

  return { admin };
}

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await loadAndValidateAdmin(req, res);
    if (!result) return;
    next();
  } catch (error) {
    return handleError(res, error, "admin.requireAdmin");
  }
};

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
      return next();
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

export const requireAdminRole = (requiredRoles: AdminRole | AdminRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await loadAndValidateAdmin(req, res);
      if (!result) return;

      if (!req.adminRole || !req.school?.id) {
        return res.status(403).json({
          success: false,
          message: "No active school association found for your account.",
        });
      }

      if (req.adminRole === AdminRole.PENDING) {
        return res.status(403).json({
          success: false,
          message: "Your role has not been assigned yet. Please wait for approval.",
          code: "ADMIN_PENDING",
        });
      }

      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

      if (
        req.adminRole !== AdminRole.SUPER_ADMIN &&
        !roles.includes(req.adminRole)
      ) {
        return res.status(403).json({
          success: false,
          message: `Access denied. This action requires one of the following roles: ${roles.filter((r) => r !== AdminRole.PENDING).join(", ")}.`,
        });
      }

      next();
    } catch (error) {
      return handleError(res, error, "admin.requireAdminRole");
    }
  };
};

export const requireSchoolOwner = requireAdminRole(AdminRole.SCHOOL_OWNER);
export const requirePrincipal = requireAdminRole(AdminRole.PRINCIPAL);
export const requireRegistrar = requireAdminRole(AdminRole.REGISTRAR);
export const requireAccountant = requireAdminRole(AdminRole.ACCOUNTANT);

export const requireSchoolOwnerOrPrincipal = requireAdminRole([
  AdminRole.SCHOOL_OWNER,
  AdminRole.PRINCIPAL,
]);

export const requireSchoolOwnerPrincipalOrRegistrar = requireAdminRole([
  AdminRole.SCHOOL_OWNER,
  AdminRole.PRINCIPAL,
  AdminRole.REGISTRAR,
]);

export const requireSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await loadAndValidateAdmin(req, res);
    if (!result) return;

    const isSuperAdmin = result.admin.schoolAdmins.some(
      (sa) => sa.role === AdminRole.SUPER_ADMIN,
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

export const requireSchoolAccess = (schoolId?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await loadAndValidateAdmin(req, res);
      if (!result) return;

      const targetSchoolId = schoolId || req.params.schoolId || req.body.schoolId;
      if (!targetSchoolId) {
        return res.status(400).json({ success: false, message: "School ID required" });
      }

      const schoolAccess = await prisma.schoolAdmin.findFirst({
        where: { adminId: req.user!.id, schoolId: targetSchoolId, active: true },
      });

      if (!schoolAccess) {
        return res.status(403).json({ success: false, message: "No access to this school" });
      }

      const school = await prisma.school.findUnique({ where: { id: targetSchoolId } });
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
