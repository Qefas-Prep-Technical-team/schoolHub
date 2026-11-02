import { Request, Response } from "express";
import prisma from "../../config/database";
import * as gradeService from "./grade.service";
import { handleError } from "../../utils/error-handler";
import { hasActiveSchoolAccess } from "../../utils/school-access";

export const getGradeHub = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userRole = (req as any).user?.role || (req as any).user?.userType;
    const userId = (req as any).user?.id;
    const userSchoolId = (req as any).user?.schoolId;

    let targetSchoolId = userSchoolId || (req.query.schoolId as string);

    const queryFilters = { ...req.query };
    if (userRole !== 'SUPER_ADMIN') {
      const requestedSchoolId = req.query.schoolId as string | undefined;

      if (userRole === 'TEACHER') {
        // Teachers can teach across multiple linked schools. Validate active connection
        if (requestedSchoolId && requestedSchoolId !== 'all') {
          const hasAccess = await hasActiveSchoolAccess({
            userId,
            userType: userRole,
            schoolId: requestedSchoolId,
          });
          const teacher = !hasAccess ? await prisma.teacher.findUnique({
            where: { id: userId },
            select: { activeSchoolId: true, primarySchoolId: true }
          }) : null;
          const isDirectlyAssociated = teacher?.activeSchoolId === requestedSchoolId || teacher?.primarySchoolId === requestedSchoolId;

          if (!hasAccess && !isDirectlyAssociated) {
            return res.status(403).json({ success: false, message: "You are not authorized to access grades for a different school." });
          }
          targetSchoolId = requestedSchoolId;
        } else {
          targetSchoolId = userSchoolId;
        }
      } else {
        // Strictly enforce connected school boundary for other roles
        if (userSchoolId && requestedSchoolId && userSchoolId !== requestedSchoolId) {
          return res.status(403).json({ success: false, message: "You are not authorized to access grades for a different school." });
        }
        targetSchoolId = userSchoolId || requestedSchoolId;
      }
    }

    if (userRole === 'TEACHER') {
      queryFilters.currentTeacherId = userId;
    }

    const { grades, total } = await gradeService.getGradeHubService(targetSchoolId, queryFilters);
    
    const totalPages = Math.ceil(total / Number(limit));

    res.json({ 
      success: true, 
      data: grades,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages
      }
    });
  } catch (error: any) {
    return handleError(res, error, "grade.getGradeHub");
  }
};

export const createGradeEntry = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role || (req as any).user.userType;
    const grade = await gradeService.createGradeEntryService(req.body, userId, userRole);
    res.json({ success: true, data: grade });
  } catch (error: any) {
    return handleError(res, error, "grade.createGradeEntry");
  }
};

export const updateGradeScore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { score, remarks, status } = req.body;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role || (req as any).user.userType;
    const grade = await gradeService.updateGradeScoreService(id as string, { score, remarks, status }, userId, userRole);
    res.json({ success: true, data: grade });
  } catch (error: any) {
    return handleError(res, error, "grade.updateGradeScore");
  }
};

export const publishGrade = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role || (req as any).user.userType;
    const grade = await gradeService.updateGradeScoreService(id as string, { status: 'PUBLISHED' }, userId, userRole);
    res.json({ success: true, data: grade });
  } catch (error: any) {
    return handleError(res, error, "grade.publishGrade");
  }
};

export const bulkPublishGrades = async (req: Request, res: Response) => {
  try {
    const filters = req.body;
    const count = await gradeService.bulkPublishGradesService(filters);
    res.json({ success: true, count, message: `${count} grades published successfully` });
  } catch (error: any) {
    return handleError(res, error, "grade.bulkPublishGrades");
  }
};

export const processOCR = async (req: Request, res: Response) => {
  try {
    const { imageUrl } = req.body;
    const extractedData = await gradeService.processGradeOCRService(imageUrl);
    res.json({ success: true, data: extractedData });
  } catch (error: any) {
    return handleError(res, error, "grade.processOCR");
  }
};

export const bulkCreateGrades = async (req: Request, res: Response) => {
  try {
    let { schoolId, grades } = req.body;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role || (req as any).user.userType;
    const userSchoolId = (req as any).user?.schoolId;

    if (userRole !== 'SUPER_ADMIN') {
      if (userSchoolId && schoolId && userSchoolId !== schoolId) {
        // If user is a teacher, verify whether they teach in this target school via ClassTeacher, TeacherSubject, or RelationshipLink
        let isAuthorizedAffiliate = false;
        if (userRole === 'TEACHER') {
          const [hasRel, hasSub, hasClass] = await Promise.all([
            prisma.relationshipLink.findFirst({
              where: {
                schoolId,
                status: 'ACTIVE',
                OR: [
                  { leftEntityId: userId, leftEntityType: 'TEACHER' },
                  { rightEntityId: userId, rightEntityType: 'TEACHER' },
                ],
              },
              select: { id: true },
            }),
            prisma.teacherSubject.findFirst({
              where: { teacherId: userId, schoolId },
              select: { id: true },
            }),
            prisma.classTeacher.findFirst({
              where: {
                teacherId: userId,
                class: { schoolId },
              },
              select: { id: true },
            }),
          ]);
          if (hasRel || hasSub || hasClass) {
            isAuthorizedAffiliate = true;
          }
        }

        if (!isAuthorizedAffiliate) {
          return res.status(403).json({ success: false, message: "You are not authorized to record grades for another school." });
        }
      }
      schoolId = schoolId || userSchoolId;
    }

    const result = await gradeService.bulkCreateGradesService(schoolId, grades, userId, userRole);
    res.json({ success: true, data: result });
  } catch (error: any) {
    return handleError(res, error, "grade.bulkCreateGrades");
  }
};

export const deleteGrade = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await gradeService.deleteGradeService(id as string);
    res.json({ success: true, data: result });
  } catch (error: any) {
    return handleError(res, error, "grade.deleteGrade");
  }
};

export const deleteBatchGrades = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const criteria = req.body;
    const result = await gradeService.deleteBatchGradeService(id as string, criteria);
    res.json({ success: true, data: result });
  } catch (error: any) {
    return handleError(res, error, "grade.deleteBatchGrades");
  }
};
