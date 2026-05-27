import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import {
  addAIQuestionsToPaperService,
  addManualQuestionsToPaperService,
  createExamService,
  createSubjectPaperService,
  getExamByIdService,
  getExamPapersService,
  getSubjectPaperByIdService,
  publishExamService,
  publishSubjectPaperService,
  updateQuestionService,
  deleteQuestionService,
  validateExamService,
  validateSubjectPaperService,
  updateExamService,
  deleteExamService,
  getSubjectPapersService,
  linkSubjectPaperToExamService,
  getExamsService,
  reorderQuestionsService,
  unpublishExamService,
  unpublishSubjectPaperService,
  deleteSubjectPaperService,
  unlinkSubjectPaperService,
  updateSubjectPaperService,
} from "./exam.service";
import {
  canManageExam,
  canManageSubjectPaper,
} from "./exam.permissions";
import { canTeacherManageSubject } from "../academic/teacher-subject.permissions";

export const getExams = async (req: Request, res: Response) => {
  console.log("LOG: [getExams] Controller Reached", { query: req.query, user: req.user });
  try {
    const { schoolId, sessionId, classId, departmentId, departmentIds, status, term, category, page, limit } = req.query;

    const isPersonal = (schoolId as string) === req.user?.id;
    const effectiveSchoolId = isPersonal ? undefined : ((schoolId as string) || req.user?.schoolId);

    const filters: any = { isPersonal };
    if (effectiveSchoolId) filters.schoolId = effectiveSchoolId;
    if (sessionId) filters.sessionId = sessionId as string;
    if (classId) filters.classId = classId as string;
    
    if (departmentIds) {
      filters.departmentIds = Array.isArray(departmentIds) ? departmentIds : [departmentIds as string];
    } else if (departmentId) {
      filters.departmentIds = [departmentId as string];
    }

    if (status) filters.status = status as any;
    if (term) filters.term = term as any;
    if (category) filters.category = category as any;
    
    if (page) filters.page = Number(page);
    if (limit) filters.limit = Number(limit);

    if (req.user?.userType === UserRole.STUDENT) {
      filters.availableForStudentId = req.user.id;
    } else if (req.user?.userType === UserRole.TEACHER) {
      filters.teacherId = req.user.id;
    }

    console.log("LOG: [getExams] Calling getExamsService with filters:", filters);
    const result = await getExamsService(filters);
    console.log("LOG: [getExams] Success");

    return res.status(200).json({
      success: true,
      data: (result as any).data || result, // Handle both paginated and non-paginated return formats safely
      pagination: (result as any).pagination,
    });
  } catch (error: any) {
    console.error("LOG ERROR: [getExams] controller failed:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch exams",
    });
  }
};

export const getExamById = async (req: Request, res: Response) => {
  try {
    const data = await getExamByIdService(
      req.params.id as string, 
      req.user?.userType === UserRole.STUDENT
    );

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch exam details",
    });
  }
};

export const getExamPapers = async (req: Request, res: Response) => {
  try {
    const data = await getExamPapersService(
      req.params.id as string,
      req.user?.schoolId
    );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch exam papers",
    });
  }
};

export const getSubjectPaperById = async (req: Request, res: Response) => {
  try {
    const data = await getSubjectPaperByIdService(req.params.paperId as string);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Subject paper not found",
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch subject paper details",
    });
  }
};

export const createExam = async (req: Request, res: Response) => {
  try {
    if (!req.user || ![UserRole.ADMIN, UserRole.TEACHER].includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: "Only admins and teachers can create exams",
      });
    }

    const data = await createExamService(req.body);

    return res.status(201).json({
      success: true,
      message: "Exam created successfully",
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create exam",
    });
  }
};

export const createSubjectPaper = async (req: Request, res: Response) => {
  try {
    const { subjectId, teacherId: bodyTeacherId, title, instructions, durationMinutes, readingContent, schoolId: bodySchoolId, creationMode } = req.body;
    
    const isPersonal = (bodySchoolId as string) === req.user?.id;
    const schoolId = isPersonal ? null : (bodySchoolId || req.user?.schoolId);
    // Security: If teacher, always use their own id as teacherId
    const teacherId = req.user?.userType === UserRole.TEACHER ? req.user.id : bodyTeacherId;

    if (!req.params.id && !schoolId && !isPersonal) {
       throw new Error("schoolId is required for standalone papers");
    }

    if (!req.user || ![UserRole.ADMIN, UserRole.TEACHER].includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: "Only admins and teachers can create subject papers",
      });
    }

    if (req.user.userType === UserRole.TEACHER) {
      // Standalone paper check: if no exam ID, we skip canManageExam but still check subject permissions
      if (req.params.id && req.params.id !== 'none') {
        const examAllowed = await canManageExam({
          userId: req.user.id,
          userType: req.user.userType,
          examId: req.params.id as string,
        });

        if (!examAllowed) {
          return res.status(403).json({
            success: false,
            message: "You are not allowed to manage this exam",
          });
        }
      }

      if (subjectId) {
        const canManageSubject = await canTeacherManageSubject({
          teacherId: req.user.id,
          subjectId,
          schoolId: schoolId || undefined,
        });

        if (!canManageSubject) {
          return res.status(403).json({
            success: false,
            message: "You are not allowed to create a paper for this subject",
          });
        }
      }
    }

    const data = await createSubjectPaperService({
      examId: req.params.id === 'none' || !req.params.id ? undefined : req.params.id as string,
      subjectId,
      schoolId,
      teacherId,
      title,
      instructions,
      durationMinutes,
      readingContent,
      creationMode,
    });

    return res.status(201).json({
      success: true,
      message: "Subject paper created successfully",
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create subject paper",
    });
  }
};

export const updateSubjectPaper = async (req: Request, res: Response) => {
  try {
    const { paperId } = req.params;
    const { title, instructions, durationMinutes, readingContent, subjectId, teacherId } = req.body;

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const allowed = await canManageSubjectPaper({
      userId: req.user.id,
      userType: req.user.userType,
      subjectPaperId: paperId as string,
    });

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to manage this subject paper",
      });
    }

    const data = await updateSubjectPaperService(paperId as string, {
      title,
      instructions,
      durationMinutes,
      readingContent,
      subjectId,
      teacherId,
    });

    return res.status(200).json({
      success: true,
      message: "Subject paper updated successfully",
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update subject paper",
    });
  }
};

export const addManualQuestionsToPaper = async (req: Request, res: Response) => {
  try {
    if (!req.user || ![UserRole.ADMIN, UserRole.TEACHER].includes(req.user.userType)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const allowed = await canManageSubjectPaper({
      userId: req.user.id,
      userType: req.user.userType,
      subjectPaperId: req.params.paperId as string,
    });

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to manage this subject paper",
      });
    }

    const data = await addManualQuestionsToPaperService({
      subjectPaperId: req.params.paperId as string,
      questions: req.body.questions || [],
    });

    return res.status(200).json({
      success: true,
      message: "Manual questions added successfully",
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to add manual questions",
    });
  }
};

export const addAIQuestionsToPaper = async (req: Request, res: Response) => {
  try {
    if (!req.user || ![UserRole.ADMIN, UserRole.TEACHER].includes(req.user.userType)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const allowed = await canManageSubjectPaper({
      userId: req.user.id,
      userType: req.user.userType,
      subjectPaperId: req.params.paperId as string,
    });

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to manage this subject paper",
      });
    }

    const data = await addAIQuestionsToPaperService({
      subjectPaperId: req.params.paperId as string,
      questions: req.body.questions || [],
    });

    return res.status(200).json({
      success: true,
      message: "AI questions added successfully",
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to add AI questions",
    });
  }
};

export const validateSubjectPaper = async (req: Request, res: Response) => {
  try {
    const { paperId } = req.params;

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    // Fetch paper to check ownership/permissions
    const paper = await getSubjectPaperByIdService(paperId as string);
    if (!paper) {
      return res.status(404).json({ success: false, message: "Subject paper not found" });
    }

    // If teacher, must be the assigned teacher
    if (req.user.userType === UserRole.TEACHER && paper.teacherId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to validate this subject paper"
      });
    }

    // Note: Admin from the same school is inherently allowed by current logic, 
    // but we could add more strict school-matching here if needed.

    const data = await validateSubjectPaperService(paperId as string);
    
    return res.status(200).json({
      success: true,
      message: "Subject paper validated successfully",
      data,
    });
  } catch (error: any) {
    console.error("LOG ERROR: [validateSubjectPaper] controller failed:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Validation failed",
    });
  }
};

export const publishSubjectPaper = async (req: Request, res: Response) => {
  try {
    const { paperId } = req.params;

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    // Fetch paper to check ownership/permissions
    const paper = await getSubjectPaperByIdService(paperId as string);
    if (!paper) {
      return res.status(404).json({ success: false, message: "Subject paper not found" });
    }

    // If teacher, must be the assigned teacher
    if (req.user.userType === UserRole.TEACHER && paper.teacherId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to publish this subject paper"
      });
    }

    const data = await publishSubjectPaperService(paperId as string);
    return res.status(200).json({
      success: true,
      message: "Subject paper published successfully",
      data,
    });
  } catch (error: any) {
    console.error("LOG ERROR: [publishSubjectPaper] controller failed:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Publish failed",
    });
  }
};

export const validateExam = async (req: Request, res: Response) => {
  try {
    const data = await validateExamService(req.params.id as string);
    return res.status(200).json({
      success: true,
      message: "Exam validated successfully",
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Exam validation failed",
    });
  }
};

export const publishExam = async (req: Request, res: Response) => {
  try {
    const data = await publishExamService(req.params.id as string);
    return res.status(200).json({
      success: true,
      message: "Exam published successfully",
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Exam publish failed",
    });
  }
};

export const updateQuestion = async (req: Request, res: Response) => {
  try {
    if (!req.user || ![UserRole.ADMIN, UserRole.TEACHER].includes(req.user.userType)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const data = await updateQuestionService(req.params.questionId as string, req.body);

    return res.status(200).json({
      success: true,
      message: "Question updated successfully",
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update question",
    });
  }
};

export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    if (!req.user || ![UserRole.ADMIN, UserRole.TEACHER].includes(req.user.userType)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    await deleteQuestionService(req.params.questionId as string);

    return res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to delete question",
    });
  }
};

export const updateExam = async (req: Request, res: Response) => {
  try {
    if (!req.user || ![UserRole.ADMIN, UserRole.TEACHER].includes(req.user.userType)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const allowed = await canManageExam({
      userId: req.user.id,
      userType: req.user.userType,
      examId: req.params.id as string,
    });

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to manage this exam",
      });
    }

    const data = await updateExamService(req.params.id as string, req.body);

    return res.status(200).json({
      success: true,
      message: "Exam updated successfully",
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update exam",
    });
  }
};

export const reorderQuestions = async (req: Request, res: Response) => {
  try {
    if (!req.user || ![UserRole.ADMIN, UserRole.TEACHER].includes(req.user.userType)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const { paperId } = req.params;
    const { reorderedIds } = req.body;

    if (!Array.isArray(reorderedIds)) {
      return res.status(400).json({ success: false, message: "reorderedIds must be an array" });
    }

    await reorderQuestionsService(paperId as string, reorderedIds);

    return res.status(200).json({
      success: true,
      message: "Questions reordered successfully",
    });
  } catch (error: any) {
    console.error("Reorder error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to reorder questions",
    });
  }
};
export const unpublishExam = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.userType !== UserRole.ADMIN) {
      return res.status(403).json({ success: false, message: "Only admins can unpublish exams" });
    }

    const data = await unpublishExamService(req.params.id as string);
    return res.status(200).json({
      success: true,
      message: "Exam unpublished successfully",
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to unpublish exam",
    });
  }
};

export const unpublishSubjectPaper = async (req: Request, res: Response) => {
  try {
    const { paperId } = req.params;
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const paper = await getSubjectPaperByIdService(paperId as string);
    if (!paper) {
      return res.status(404).json({ success: false, message: "Subject paper not found" });
    }

    // Admins or the assigned teacher can unpublish
    if (req.user.userType === UserRole.TEACHER && paper.teacherId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const data = await unpublishSubjectPaperService(paperId as string);
    return res.status(200).json({
      success: true,
      message: "Subject paper unpublished successfully",
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to unpublish subject paper",
    });
  }
};

export const deleteSubjectPaper = async (req: Request, res: Response) => {
  try {
    const { paperId } = req.params;
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const paper = await getSubjectPaperByIdService(paperId as string);
    if (!paper) {
      return res.status(404).json({ success: false, message: "Subject paper not found" });
    }

    // Admins or the assigned teacher can delete
    if (req.user.userType === UserRole.TEACHER && paper.teacherId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    await deleteSubjectPaperService(paperId as string);
    return res.status(200).json({
      success: true,
      message: "Subject paper deleted successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to delete subject paper",
    });
  }
};

export const deleteExam = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.userType !== UserRole.ADMIN) {
      return res.status(403).json({ success: false, message: "Only admins can delete exams" });
    }

    await deleteExamService(req.params.id as string);
    return res.status(200).json({
      success: true,
      message: "Exam deleted successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to delete exam",
    });
  }
};

export const getSubjectPapers = async (req: Request, res: Response) => {
  try {
    const { unlinkedOnly, schoolId, sessionId, term, classId, departmentId, departmentIds, status, page, limit } = req.query;
    
    const isPersonal = schoolId === req.user?.id;
    const filters: any = {
      unlinkedOnly: unlinkedOnly === 'true',
      schoolId: isPersonal ? undefined : (schoolId as string || req.user?.schoolId),
      isPersonal,
    };

    if (sessionId) filters.sessionId = sessionId as string;
    if (term) filters.term = term as any;
    if (classId) filters.classId = classId as string;
    if (departmentIds) {
      filters.departmentIds = Array.isArray(departmentIds) ? departmentIds : [departmentIds as string];
    } else if (departmentId) {
      filters.departmentIds = [departmentId as string];
    }
    if (status) filters.status = status as string;
    if (page) filters.page = Number(page);
    if (limit) filters.limit = Number(limit);

    if (req.user?.userType === UserRole.TEACHER) {
      filters.teacherId = req.user.id;
    }

    console.log("LOG: [getSubjectPapers] Fetching with filters:", filters);
    const result = await getSubjectPapersService(filters);
    res.status(200).json({ 
      success: true, 
      data: (result as any).data || result, 
      pagination: (result as any).pagination 
    });
  } catch (error: any) {
    console.error("LOG ERROR: [getSubjectPapers]", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const linkSubjectPaperToExam = async (req: Request, res: Response) => {
  try {
    const { paperId } = req.params;
    const { examId } = req.body;

    if (!examId) {
      return res.status(400).json({ message: "examId is required" });
    }

    const data = await linkSubjectPaperToExamService(paperId as string, examId as string);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const unlinkSubjectPaper = async (req: Request, res: Response) => {
  try {
    const { paperId } = req.params;
    const { examId } = req.body || req.query;
    console.log("LOG: [unlinkSubjectPaper] Unlinking paper:", paperId, "from exam:", examId);
    const data = await unlinkSubjectPaperService(paperId as string, examId as string);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error("ERROR: [unlinkSubjectPaper]", error);
    res.status(500).json({ message: error.message });
  }
};
