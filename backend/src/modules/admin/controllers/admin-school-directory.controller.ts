import { Request, Response } from "express";
import { z } from "zod";
import prisma, { withRetry } from "../../../config/database";
import { handleError } from "../../../utils/error-handler";
import { getSingleString } from "../../../utils/request-utils";
import { resolveSchoolId, validateAdminSchoolAccess } from "../../school/services/school-access.service";
import {
  getSchoolMembersDirectoryService,
  getSchoolStudentsDirectoryService,
  getSchoolTeachersDirectoryService,
} from "../services/admin-school-directory.service";

const schoolIdQuerySchema = z.object({
  schoolId: z.string().min(1, "schoolId is required"),
});

async function hasAuthorizedSchoolAccess(
  req: Request,
  rawSchoolId: string,
): Promise<boolean> {
  if (validateAdminSchoolAccess(req, rawSchoolId)) return true;

  const resolvedId = await resolveSchoolId(rawSchoolId);
  if (!resolvedId) return false;
  if (validateAdminSchoolAccess(req, resolvedId)) return true;

  if (!req.user?.id) return false;

  const schoolAdmin = await withRetry(() =>
    prisma.schoolAdmin.findFirst({
      where: {
        adminId: req.user!.id,
        schoolId: resolvedId,
        active: true,
      },
      select: { id: true },
    }),
  );

  return Boolean(schoolAdmin);
}

export const getSchoolTeachers = async (req: Request, res: Response) => {
  try {
    const schoolId = getSingleString(req.query.schoolId as string | string[] | undefined);
    const parsed = schoolIdQuerySchema.safeParse({ schoolId });
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "schoolId is required",
      });
    }

    const hasAccess = await hasAuthorizedSchoolAccess(req, parsed.data.schoolId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view teachers for this school",
      });
    }

    const result = await getSchoolTeachersDirectoryService({
      schoolId: parsed.data.schoolId,
      search: getSingleString(req.query.search as string | string[] | undefined),
      isClaimed: getSingleString(req.query.isClaimed as string | string[] | undefined),
      page: getSingleString(req.query.page as string | string[] | undefined),
      limit: getSingleString(req.query.limit as string | string[] | undefined),
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: unknown) {
    return handleError(res, error, "admin.getSchoolTeachers");
  }
};

export const getSchoolStudents = async (req: Request, res: Response) => {
  try {
    const schoolId = getSingleString(req.query.schoolId as string | string[] | undefined);
    const parsed = schoolIdQuerySchema.safeParse({ schoolId });
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "schoolId is required",
      });
    }

    const hasAccess = await hasAuthorizedSchoolAccess(req, parsed.data.schoolId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view students for this school",
      });
    }

    const result = await getSchoolStudentsDirectoryService({
      schoolId: parsed.data.schoolId,
      search: getSingleString(req.query.search as string | string[] | undefined),
      classId: getSingleString(req.query.classId as string | string[] | undefined),
      gender: getSingleString(req.query.gender as string | string[] | undefined),
      status: getSingleString(req.query.status as string | string[] | undefined),
      lifecycleStatus: getSingleString(
        req.query.lifecycleStatus as string | string[] | undefined,
      ),
      isClaimed: getSingleString(req.query.isClaimed as string | string[] | undefined),
      departmentId: getSingleString(req.query.departmentId as string | string[] | undefined),
      subjectId: getSingleString(req.query.subjectId as string | string[] | undefined),
      page: getSingleString(req.query.page as string | string[] | undefined),
      limit: getSingleString(req.query.limit as string | string[] | undefined),
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: unknown) {
    return handleError(res, error, "admin.getSchoolStudents");
  }
};

export const getSchoolMembers = async (req: Request, res: Response) => {
  try {
    const schoolId = getSingleString(req.query.schoolId as string | string[] | undefined);
    const parsed = schoolIdQuerySchema.safeParse({ schoolId });
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "schoolId is required",
      });
    }

    const hasAccess = await hasAuthorizedSchoolAccess(req, parsed.data.schoolId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = await getSchoolMembersDirectoryService(parsed.data.schoolId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    return handleError(res, error, "admin.getSchoolMembers");
  }
};

