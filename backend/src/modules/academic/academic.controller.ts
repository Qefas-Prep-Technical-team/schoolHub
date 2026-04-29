import { Request, Response } from "express";
import {
  AssessmentCreationMode,
  AssessmentScope,
  QuestionType,
  UserRole,
} from "@prisma/client";
import prisma from "../../config/database";
import {
  attachSubjectToDepartmentService,
  createDepartmentService,
  createExamService,
  createQuizService,
  createSubjectService,
  getDepartmentsService,
  getExamsService,
  getQuizzesService,
  getSubjectsService,
} from "./academic.service";
import { hasActiveSchoolAccess } from "../../utils/school-access";

const ensureAdminForSchool = async (adminId: string, schoolId?: string) => {
  if (!schoolId) return true;

  const schoolAdmin = await prisma.schoolAdmin.findFirst({
    where: {
      adminId,
      schoolId,
      active: true,
    },
  });

  return !!schoolAdmin;
};

const ensureTeacherCanWorkInSchool = async (
  teacherId: string,
  schoolId?: string,
) => {
  if (!schoolId) return true;

  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
  });

  return !!teacher &&
    (teacher.activeSchoolId === schoolId || teacher.primarySchoolId === schoolId);
};

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const { name, code, description, schoolId, scope } = req.body;

    if (
      !req.user ||
      ![UserRole.ADMIN, UserRole.TEACHER].includes(req.user.userType)
    ) {
      return res.status(403).json({
        success: false,
        message: "Only admins and teachers can create departments",
      });
    }

    const department = await createDepartmentService({
      currentUserId: req.user.id,
      currentUserType: req.user.userType,
      name,
      code,
      description,
      schoolId,
      scope,
    });

    return res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: department,
    });
  } catch (error: any) {
    console.error("createDepartment error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create department",
    });
  }
};

export const createSubject = async (req: Request, res: Response) => {
  try {
    const { name, code, description, schoolId, scope } = req.body;

    if (
      !req.user ||
      ![UserRole.ADMIN, UserRole.TEACHER].includes(req.user.userType)
    ) {
      return res.status(403).json({
        success: false,
        message: "Only admins and teachers can create subjects",
      });
    }

    const subject = await createSubjectService({
      currentUserId: req.user.id,
      currentUserType: req.user.userType,
      name,
      code,
      description,
      schoolId,
      scope,
    });

    return res.status(201).json({
      success: true,
      message: "Subject created successfully",
      data: subject,
    });
  } catch (error: any) {
    console.error("createSubject error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create subject",
    });
  }
};

export const attachSubjectsToDepartment = async (
  req: Request,
  res: Response,
) => {
  try {
    const { departmentId, subjectIds } = req.body;

    if (
      !req.user ||
      ![UserRole.ADMIN, UserRole.TEACHER].includes(req.user.userType)
    ) {
      return res.status(403).json({
        success: false,
        message: "Only admins and teachers can attach subjects to departments",
      });
    }

    const item = await attachSubjectToDepartmentService({
      departmentId,
      subjectIds,
      currentUserId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Subjects attached to department successfully",
      data: item,
    });
  } catch (error: any) {
    console.error("attachSubjectsToDepartment error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to attach subjects to department",
    });
  }
};

export const createQuiz = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      scope,
      creationMode,
      schoolId,
      departmentId,
      classId,
      subjectId,
      selectedSubjectIds,
      durationMinutes,
      status,
      aiPrompt,
      instructions,
      questions,
    } = req.body;

    if (
      !req.user ||
      ![UserRole.ADMIN, UserRole.TEACHER].includes(req.user.userType)
    ) {
      return res.status(403).json({
        success: false,
        message: "Only admins and teachers can create quizzes",
      });
    }

    if (!Object.values(AssessmentScope).includes(scope as AssessmentScope)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assessment scope",
      });
    }

    if (
      !Object.values(AssessmentCreationMode).includes(
        creationMode as AssessmentCreationMode,
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid creation mode",
      });
    }

    if (req.user.userType === UserRole.ADMIN) {
      const allowed = await ensureAdminForSchool(req.user.id, schoolId);
      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to create quizzes in this school",
        });
      }
    }

    if (req.user.userType === UserRole.TEACHER) {
      const allowed = await ensureTeacherCanWorkInSchool(req.user.id, schoolId);
      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to create quizzes in this school",
        });
      }
    }

    const quiz = await createQuizService({
      title,
      description,
      scope,
      creationMode,
      schoolId,
      departmentId,
      classId,
      subjectId,
      selectedSubjectIds,
      durationMinutes,
      status,
      aiPrompt,
      instructions,
      questions,
    });

    return res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      data: quiz,
    });
  } catch (error: any) {
    console.error("createQuiz error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create quiz",
    });
  }
};

export const createExam = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      scope,
      creationMode,
      schoolId,
      classId,
      subjectId,
      selectedSubjectIds,
      durationMinutes,
      status,
      aiPrompt,
      instructions,
      departmentIds,
    } = req.body;

    if (
      !req.user ||
      ![UserRole.ADMIN, UserRole.TEACHER].includes(req.user.userType)
    ) {
      return res.status(403).json({
        success: false,
        message: "Only admins and teachers can create exams",
      });
    }

    if (!Object.values(AssessmentScope).includes(scope as AssessmentScope)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assessment scope",
      });
    }

    if (
      !Object.values(AssessmentCreationMode).includes(
        creationMode as AssessmentCreationMode,
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid creation mode",
      });
    }

    if (req.user.userType === UserRole.ADMIN) {
      const allowed = await ensureAdminForSchool(req.user.id, schoolId);
      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to create exams in this school",
        });
      }
    }

    if (req.user.userType === UserRole.TEACHER) {
      const allowed = await ensureTeacherCanWorkInSchool(req.user.id, schoolId);
      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to create exams in this school",
        });
      }
    }

    const exam = await createExamService({
      title,
      description,
      scope,
      creationMode,
      schoolId,
      departmentIds: departmentIds || [],
      classId,
      subjectId,
      selectedSubjectIds,
      durationMinutes,
      status,
      aiPrompt,
      instructions,
    });

    return res.status(201).json({
      success: true,
      message: "Exam created successfully",
      data: exam,
    });
  } catch (error: any) {
    console.error("createExam error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create exam",
    });
  }
};

export const getDepartments = async (req: Request, res: Response) => {
  try {
    const schoolId = (req.query.schoolId as string) || req.user?.schoolId;
    const classId = req.query.classId as string | undefined;

    const items = await getDepartmentsService({
      currentUserId: req.user!.id,
      currentUserType: req.user!.userType,
      schoolId: schoolId,
      classId: classId,
    });
    return res.status(200).json({
      success: true,
      message: "Departments fetched successfully",
      count: items.length,
      data: items,
    });
  } catch (error: any) {
    console.error("getDepartments error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch departments",
    });
  }
};

export const getSubjects = async (req: Request, res: Response) => {
  try {
    const schoolId = (req.query.schoolId as string) || req.user?.schoolId;

    const items = await getSubjectsService({
      currentUserId: req.user!.id,
      currentUserType: req.user!.userType,
      schoolId: schoolId,
    });

    return res.status(200).json({
      success: true,
      message: "Subjects fetched successfully",
      count: items.length,
      data: items,
    });
  } catch (error: any) {
    console.error("getSubjects error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch subjects",
    });
  }
};

export const getQuizzes = async (req: Request, res: Response) => {
  try {
    const schoolId = (req.query.schoolId as string) || req.user?.schoolId;
    const items = await getQuizzesService({
      schoolId: schoolId,
      departmentId: req.query.departmentId as string | undefined,
      classId: req.query.classId as string | undefined,
    });

    return res.status(200).json({
      success: true,
      message: "Quizzes fetched successfully",
      count: items.length,
      data: items,
    });
  } catch (error: any) {
    console.error("getQuizzes error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch quizzes",
    });
  }
};

export const getExams = async (req: Request, res: Response) => {
  try {
    const schoolIdFromQuery = req.query.schoolId as string | undefined;
    const schoolId = schoolIdFromQuery || req.user?.schoolId;
    const { sessionId, classId, departmentId, departmentIds, status, term, category } = req.query;

    const filters: any = {};
    if (schoolId) filters.schoolId = schoolId;
    if (sessionId) filters.sessionId = sessionId as string;
    if (classId) filters.classId = classId as string;
    
    // Support both single and multiple department selection in query
    if (departmentIds) {
      filters.departmentIds = Array.isArray(departmentIds) ? departmentIds : [departmentIds as string];
    } else if (departmentId) {
      filters.departmentIds = [departmentId as string];
    }

    if (status) filters.status = status as any;
    if (term) filters.term = term as any;
    if (category) filters.category = category as any;

    if (req.user?.userType === UserRole.STUDENT) {
      filters.availableForStudentId = req.user.id;
    }

    if (req.user?.userType === UserRole.TEACHER) {
      filters.availableForTeacherId = req.user.id;
    }

    const items = await getExamsService(filters);

    return res.status(200).json({
      success: true,
      message: "Exams fetched successfully",
      count: items.length,
      data: items,
    });
  } catch (error: any) {
    console.error("getExams error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch exams",
    });
  }
};
