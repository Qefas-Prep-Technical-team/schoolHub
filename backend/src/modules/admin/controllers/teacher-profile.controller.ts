import { Request, Response } from "express";
import { getSingleString } from "../../../utils/request-utils";
import { handleError } from "../../../utils/error-handler";
import { getTeacherByIdAdminService } from "../services/teacher-profile.service";

export const extractAuthorizedSchoolIds = (req: Request): string[] => {
  const user = req.user as
    | {
        schoolId?: string;
        tenantId?: string;
        schools?: Array<{ schoolId?: string; id?: string }>;
      }
    | undefined;
  if (!user) return [];

  const schoolIds = new Set<string>();
  if (user.schoolId) schoolIds.add(user.schoolId);
  if (user.tenantId) schoolIds.add(user.tenantId);

  if (Array.isArray(user.schools)) {
    for (const s of user.schools) {
      if (s?.schoolId) schoolIds.add(s.schoolId);
      if (s?.id) schoolIds.add(s.id);
    }
  }

  return Array.from(schoolIds);
};

/**
 * Get detailed teacher information by ID (scoped to admin's authorized schools)
 */
export const getTeacherById = async (req: Request, res: Response) => {
  try {
    const id = getSingleString(req.params.id as string | string[] | undefined);
    const result = await getTeacherByIdAdminService(id, {
      adminId: req.user?.id,
      userType: req.user?.userType,
      role: req.user?.role,
      explicitSchoolIds: extractAuthorizedSchoolIds(req),
    });
    return res.status(result.status).json(result.body);
  } catch (error: unknown) {
    return handleError(res, error, "admin.getTeacherById");
  }
};
