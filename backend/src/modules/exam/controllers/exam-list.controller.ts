import { Request, Response } from "express";
import { AssessmentStatus, ExamCategory, UserRole } from "@prisma/client";
import prisma, { withRetry } from "../../../config/database";
import { getExamsService } from "../exam.service";
import {
  resolveSchoolId,
  validateSchoolAccess,
} from "../../school/services/school-access.service";
import { handleError } from "../../../utils/error-handler";

export const getExams = async (req: Request, res: Response) => {
  try {
    const {
      schoolId,
      sessionId,
      classId,
      departmentId,
      departmentIds,
      status,
      term,
      category,
      page,
      limit,
      availableForStudentId,
      search,
    } = req.query;

    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userTypeStr = String(user.userType || user.role || "").toUpperCase();
    const isSuperAdmin = userTypeStr === "SUPER_ADMIN";

    let isPersonal =
      userTypeStr === UserRole.TEACHER && (schoolId as string) === user.id;
    let effectiveSchoolId: string | undefined;

    if (userTypeStr === UserRole.ADMIN && !isSuperAdmin) {
      // School admins can NEVER query personal teacher exams or unscoped global exams
      isPersonal = false;
      const requestedSchool =
        (schoolId as string) || user.schoolId || user.tenantId;

      if (!requestedSchool || !validateSchoolAccess(req, requestedSchool)) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied: You are not authorized to access exams for this school.",
        });
      }

      const resolved = await resolveSchoolId(requestedSchool);
      if (!resolved) {
        return res.status(200).json({
          success: true,
          data: [],
        });
      }
      effectiveSchoolId = resolved;
    } else if (!isPersonal) {
      const requestedSchool =
        (schoolId as string) || user.schoolId || user.tenantId;
      if (requestedSchool) {
        if (
          !isSuperAdmin &&
          userTypeStr !== UserRole.PARENT &&
          !validateSchoolAccess(req, requestedSchool)
        ) {
          return res.status(403).json({
            success: false,
            message:
              "Access denied: You are not authorized to access exams for this school.",
          });
        }
        effectiveSchoolId =
          (await resolveSchoolId(requestedSchool)) || requestedSchool;
      }
    }

    const filters: Parameters<typeof getExamsService>[0] = { isPersonal };
    if (effectiveSchoolId) filters.schoolId = effectiveSchoolId;
    if (sessionId) filters.sessionId = sessionId as string;
    if (classId) filters.classId = classId as string;

    if (departmentIds) {
      filters.departmentIds = Array.isArray(departmentIds)
        ? (departmentIds as string[])
        : [departmentIds as string];
    } else if (departmentId) {
      filters.departmentIds = [departmentId as string];
    }

    if (status) filters.status = status as AssessmentStatus;
    if (term) filters.term = term as string;
    if (category) filters.category = category as ExamCategory;
    if (search) filters.search = search as string;

    if (page) filters.page = Number(page);
    if (limit) filters.limit = Number(limit);

    if (user.userType === UserRole.STUDENT) {
      filters.availableForStudentId = user.id;
    } else if (user.userType === UserRole.TEACHER) {
      filters.teacherId = user.id;
      filters.currentTeacherId = user.id;
    } else if (user.userType === UserRole.PARENT && availableForStudentId) {
      const targetChildId = availableForStudentId as string;
      const link = await withRetry(
        () =>
          prisma.parentChildLink.findFirst({
            where: { parentId: user.id, studentId: targetChildId },
          }),
        "exam.getExams.verifyParentChildLink",
      );
      if (!link) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied: You can only view exams for your linked children.",
        });
      }
      filters.availableForStudentId = targetChildId;
    }

    const result = await getExamsService(filters);
    const isPaginated =
      result &&
      typeof result === "object" &&
      !Array.isArray(result) &&
      "data" in result;

    return res.status(200).json({
      success: true,
      data: isPaginated ? (result as { data: unknown }).data : result,
      pagination: isPaginated
        ? (result as { pagination?: unknown }).pagination
        : undefined,
    });
  } catch (error: unknown) {
    return handleError(res, error, "exam.getExams");
  }
};

