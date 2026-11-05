import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { handleError } from "../../../utils/error-handler";
import {
  adminIdParamsSchema,
  approveAdminBodySchema,
  checkAdminStatusParamsSchema,
  rejectAdminBodySchema,
  updateAdminRoleBodySchema,
} from "../schemas/admin-team.schemas";
import {
  approveAdminService,
  checkAdminStatusService,
  getPendingAdminsService,
  rejectAdminService,
} from "../services/admin-team.service";
import {
  getSchoolAdminsService,
  removeAdminService,
  transferOwnershipService,
  updateAdminRoleService,
} from "../services/admin-team-members.service";

function hasValidAdminToken(req: Request, targetEmail: string): boolean {
  try {
    const authHeader = req.header("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : undefined;
    const token = bearerToken || req.cookies?.token;
    if (!token || !process.env.JWT_ACCESS_SECRET) return false;

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET) as {
      userId?: string;
      userType?: string;
      email?: string;
    };

    if (decoded.userType !== "ADMIN" && decoded.userType !== "SUPER_ADMIN") {
      return false;
    }

    if (decoded.userType === "SUPER_ADMIN") return true;
    if (decoded.email && decoded.email.toLowerCase() === targetEmail.toLowerCase()) {
      return true;
    }

    return Boolean(decoded.userId);
  } catch {
    return false;
  }
}

export const checkAdminStatus = async (req: Request, res: Response) => {
  try {
    const parsedParams = checkAdminStatusParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json({
        success: false,
        message: parsedParams.error.issues[0]?.message || "Invalid email parameter",
      });
    }

    const isAuthenticatedCaller =
      Boolean(req.user) || hasValidAdminToken(req, parsedParams.data.email);
    const data = await checkAdminStatusService(parsedParams.data.email, isAuthenticatedCaller);

    return res.status(200).json({ success: true, message: "Status retrieved successfully", data });
  } catch (error: unknown) {
    return handleError(res, error, "admin.checkAdminStatus");
  }
};

export const getPendingAdmins = async (req: Request, res: Response) => {
  try {
    const schoolId = req.school?.id;
    if (!schoolId) {
      return res.status(403).json({
        success: false,
        message: "No active school association found for your account.",
      });
    }

    const data = await getPendingAdminsService(schoolId);
    return res.status(200).json({
      success: true,
      message: "Pending admins retrieved successfully",
      data,
    });
  } catch (error: unknown) {
    return handleError(res, error, "admin.getPendingAdmins");
  }
};

export const approveAdmin = async (req: Request, res: Response) => {
  try {
    const parsedParams = adminIdParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json({
        success: false,
        message: parsedParams.error.issues[0]?.message || "Invalid admin ID",
      });
    }

    const parsedBody = approveAdminBodySchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({
        success: false,
        message: parsedBody.error.issues[0]?.message || "Invalid role",
      });
    }

    const schoolId = req.school?.id;
    if (!schoolId) {
      return res.status(403).json({
        success: false,
        message: "No active school association found for your account.",
      });
    }

    const data = await approveAdminService({
      schoolId,
      adminId: parsedParams.data.adminId,
      role: parsedBody.data.role,
    });

    return res.status(200).json({
      success: true,
      message: `Admin approved and assigned role: ${parsedBody.data.role}`,
      data,
    });
  } catch (error: unknown) {
    return handleError(res, error, "admin.approveAdmin");
  }
};

export const rejectAdmin = async (req: Request, res: Response) => {
  try {
    const parsedParams = adminIdParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json({
        success: false,
        message: parsedParams.error.issues[0]?.message || "Invalid admin ID",
      });
    }

    const parsedBody = rejectAdminBodySchema.safeParse(req.body ?? {});
    if (!parsedBody.success) {
      return res.status(400).json({
        success: false,
        message: parsedBody.error.issues[0]?.message || "Invalid request payload",
      });
    }

    const schoolId = req.school?.id;
    if (!schoolId) {
      return res.status(403).json({
        success: false,
        message: "No active school association found for your account.",
      });
    }

    const data = await rejectAdminService({
      schoolId,
      adminId: parsedParams.data.adminId,
      reason: parsedBody.data.reason,
    });

    return res.status(200).json({ success: true, message: "Admin registration rejected", data });
  } catch (error: unknown) {
    return handleError(res, error, "admin.rejectAdmin");
  }
};

export const getSchoolAdmins = async (req: Request, res: Response) => {
  try {
    const schoolId = req.school?.id;
    if (!schoolId) {
      return res.status(403).json({
        success: false,
        message: "No active school association found for your account.",
      });
    }

    const data = await getSchoolAdminsService(schoolId);
    return res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    return handleError(res, error, "admin.getSchoolAdmins");
  }
};

export const updateAdminRole = async (req: Request, res: Response) => {
  try {
    const parsedParams = adminIdParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json({
        success: false,
        message: parsedParams.error.issues[0]?.message || "Invalid admin ID",
      });
    }

    const parsedBody = updateAdminRoleBodySchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({
        success: false,
        message: parsedBody.error.issues[0]?.message || "Invalid role",
      });
    }

    const schoolId = req.school?.id;
    const currentAdminId = req.user?.id;
    if (!schoolId || !currentAdminId) {
      return res.status(403).json({
        success: false,
        message: "No active school association found for your account.",
      });
    }

    const { role } = await updateAdminRoleService({
      schoolId,
      currentAdminId,
      targetAdminId: parsedParams.data.adminId,
      role: parsedBody.data.role,
    });

    return res.status(200).json({ success: true, message: `Role updated to ${role}` });
  } catch (error: unknown) {
    return handleError(res, error, "admin.updateAdminRole");
  }
};

export const transferOwnership = async (req: Request, res: Response) => {
  try {
    const parsedParams = adminIdParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json({
        success: false,
        message: parsedParams.error.issues[0]?.message || "Invalid admin ID",
      });
    }

    const schoolId = req.school?.id;
    const currentAdminId = req.user?.id;
    if (!schoolId || !currentAdminId) {
      return res.status(403).json({
        success: false,
        message: "No active school association found for your account.",
      });
    }

    const { newOwnerName } = await transferOwnershipService({
      schoolId,
      currentAdminId,
      targetAdminId: parsedParams.data.adminId,
    });

    return res.status(200).json({
      success: true,
      message: `Ownership successfully transferred to ${newOwnerName}. You are now a Principal.`,
    });
  } catch (error: unknown) {
    return handleError(res, error, "admin.transferOwnership");
  }
};

export const removeAdmin = async (req: Request, res: Response) => {
  try {
    const parsedParams = adminIdParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json({
        success: false,
        message: parsedParams.error.issues[0]?.message || "Invalid admin ID",
      });
    }

    const schoolId = req.school?.id;
    const currentAdminId = req.user?.id;
    if (!schoolId || !currentAdminId) {
      return res.status(403).json({
        success: false,
        message: "No active school association found for your account.",
      });
    }

    await removeAdminService({
      schoolId,
      currentAdminId,
      targetAdminId: parsedParams.data.adminId,
    });

    return res.status(200).json({
      success: true,
      message: "Admin removed from school and sessions revoked",
    });
  } catch (error: unknown) {
    return handleError(res, error, "admin.removeAdmin");
  }
};
