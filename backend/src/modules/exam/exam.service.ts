import prisma from "../../config/database";
import { enforceExamLimit } from "../subscription/quota.helpers";
import { createNotification } from "../notification/notification.service";
import {
  AssessmentStatus,
  ExamCategory,
  ExamMode,
  QuestionSource,
  QuestionType,
  SubjectPaperStatus,
  GradeStatus,
} from "@prisma/client";
import { validateExamQuestionInput } from "./exam.validation";

export const createExamService = async ({
  title,
  description,
  scope,
  category,
  creationMode,
  mode,
  schoolId,
  classId,
  sessionId,
  durationMinutes,
  aiPrompt,
  instructions,
  startDate,
  allowImmediateResult,
  resultReleaseAt,
  term,
  teacherId,
  endDate,
  departmentIds = [],
}: {
  title: string;
  description?: string;
  scope: any;
  category?: any;
  creationMode: any;
  mode: ExamMode;
  schoolId?: string;
  departmentIds?: string[];
  classId?: string;
  sessionId?: string;
  term?: any;
  durationMinutes?: number;
  aiPrompt?: string;
  instructions?: string;
  startDate?: Date | string;
  allowImmediateResult?: boolean;
  resultReleaseAt?: Date | string;
  endDate?: Date | string;
  teacherId?: string;
}) => {
  if (schoolId) await enforceExamLimit(schoolId);
  console.log("LOG: [createExamService] Data received:", { title, scope, schoolId });
  return prisma.exam.create({
    data: {
      title,
      description: description || null,
      scope,
      category: category || "EXAM",
      creationMode,
      mode,
      schoolId: schoolId || null,
      classId: classId || null,
      sessionId: sessionId || null,
      durationMinutes: durationMinutes || null,
      aiPrompt: aiPrompt || null,
      instructions: instructions || null,
      startDate: startDate ? new Date(startDate) : null,
      allowImmediateResult: allowImmediateResult !== undefined ? allowImmediateResult : true,
      resultReleaseAt: resultReleaseAt ? new Date(resultReleaseAt) : null,
      endDate: endDate ? new Date(endDate) : null,
      term: term || null,
      teacherId: teacherId || null,
      departments: departmentIds.length > 0 ? {
        create: departmentIds.map(id => ({ departmentId: id }))
      } : undefined,
    },
    include: {
      school: true,
      departments: {
        include: { department: true }
      },
      class: true,
      session: true,
      teacher: true,
      subjectExamPapers: true,
    },
  });
};

export const getExamsService = async (filters: {
  schoolId?: string;
  sessionId?: string;
  classId?: string;
  departmentIds?: string[];
  term?: any;
  status?: AssessmentStatus;
  category?: ExamCategory;
  availableForStudentId?: string;
  teacherId?: string;
  isPersonal?: boolean;
  page?: number;
  limit?: number;
  teacherClassesOnly?: string;
  currentTeacherId?: string;
}) => {
  const where: any = {};
  const studentId = filters.availableForStudentId;
  const teacherId = filters.teacherId;

  if (filters.isPersonal) {
    where.schoolId = null;
  } else if (filters.schoolId) {
    where.schoolId = filters.schoolId;
  }
  if (filters.sessionId) where.sessionId = filters.sessionId;
  if (filters.term) where.term = filters.term;
  if (filters.category) where.category = filters.category;
  
  // For students, we strictly enforce PUBLISHED status and multi-criteria targeting
  if (studentId) {
    // ... student logic remains same ...
    console.log("LOG: [getExamsService] Fetching student info for filtering:", studentId);
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { classes: true },
    });

    if (!student) throw new Error("Student not found");
    
    where.status = AssessmentStatus.PUBLISHED;
    const classIds = student.classes.map((c) => c.classId);
    
    const orConditions: any[] = [
      {
        schoolId: student.schoolId,
        classId: null,
        departments: { none: {} },
      }
    ];

    if (classIds.length > 0) {
      orConditions.push({
        classId: { in: classIds },
        departments: { none: {} },
      });
    }

    if (student.departmentId) {
      orConditions.push({
        classId: null,
        departments: { some: { departmentId: student.departmentId } } 
      });
    }

    if (classIds.length > 0 && student.departmentId) {
      orConditions.push({
        classId: { in: classIds },
        departments: { some: { departmentId: student.departmentId } } 
      });
    }
    
    where.OR = orConditions;
  } else {
    // Admin/Teacher filters
    if (filters.status) where.status = filters.status;
    if (filters.classId) where.classId = filters.classId;

    if (teacherId) {
      // Find subjects assigned to the teacher in the current context
      // Note: We use schoolId from filters to find the specific subjects the teacher manages in that school.
      const assignedSubjects = await prisma.teacherSubject.findMany({
        where: { 
          teacherId,
          schoolId: filters.isPersonal ? null : (filters.schoolId || undefined)
        },
        select: { subjectId: true }
      });
      const subjectIds = assignedSubjects.map(s => s.subjectId);

      const teacherOrConditions: any[] = [];

      if (subjectIds.length > 0) {
        teacherOrConditions.push(
          { subjectId: { in: subjectIds } },
          { subjectExamPapers: { some: { subjectPaper: { subjectId: { in: subjectIds } } } } }
        );
      }

      // Check if they are assigned to any class directly (as form teacher or otherwise)
      const assignedClasses = await prisma.classTeacher.findMany({
        where: { teacherId },
        select: { classId: true }
      });
      const classIds = assignedClasses.map(c => c.classId);

      if (classIds.length > 0) {
        teacherOrConditions.push({ classId: { in: classIds } });
      }
      
      // They can also always see exams they created
      teacherOrConditions.push({ teacherId });

      if (teacherOrConditions.length > 0) {
        where.AND = [{ OR: teacherOrConditions }];
      } else {
        where.AND = [{ id: "none" }]; // no access to any exams
      }

      // Implement teacherClassesOnly scoping
      const isTeacherClassesOnly = filters.teacherClassesOnly === 'true';
      if (isTeacherClassesOnly) {
        if (filters.classId) {
          if (!classIds.includes(filters.classId)) {
            where.classId = "none";
          }
        } else {
          where.classId = { in: classIds };
        }
      }

      // If it's a teacher, we also usually only want to show their own creations if in personal context
      if (filters.isPersonal) {
        where.AND.push({ teacherId: filters.teacherId });
      }
    }

    if (filters.departmentIds && filters.departmentIds.length > 0) {
      where.departments = {
        some: { departmentId: { in: filters.departmentIds } }
      };
    }
  }

  const exams = await prisma.exam.findMany({
    where,
    include: {
      school: true,
      departments: {
        include: { department: true }
      },
      class: true,
      session: true,
      subjectExamPapers: {
        include: {
          subjectPaper: {
            include: {
              subject: true,
              teacher: true,
              questions: {
                orderBy: { order: "asc" },
              },
            }
          }
        },
      },
      // Include student's attempt if studentId is filtered
      examAttempts: studentId ? {
        where: { studentId },
        take: 1, // Only need the most recent/unique attempt
        orderBy: { updatedAt: 'desc' }
      } : false,
      _count: {
        select: { examAttempts: true }
      }
    },
    orderBy: {
      createdAt: "desc",
    },
    ...(filters.page && filters.limit ? {
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    } : {}),
  });

  const total = filters.page && filters.limit ? await prisma.exam.count({ where }) : exams.length;

  const formattedExams = (exams as any[]).map(exam => {
    const papers = exam.subjectExamPapers.map((link: any) => ({
      ...link.subjectPaper,
      examId: link.examId
    }));
    
    return {
      ...exam,
      subjectExamPapers: papers,
      totalPapers: papers.length,
      totalQuestions: papers.reduce((sum: number, p: any) => sum + (p.questions?.length || 0), 0)
    };
  });

  // If filtered for a student, enforce result visibility logic
  if (studentId) {
    const studentExams = formattedExams.map(exam => {
      const attempt = exam.examAttempts?.[0];
      if (attempt && !exam.allowImmediateResult) {
        const released = exam.resultReleaseAt && new Date() >= new Date(exam.resultReleaseAt);
        if (!released) {
          // Hide score-related data
          return {
            ...exam,
            examAttempts: [{
              ...attempt,
              totalScore: null,
              score: null // If any subject score exists
            }]
          };
        }
      }
      return exam;
    });
    
    return filters.page && filters.limit ? {
      data: studentExams,
      pagination: {
        total,
        pages: Math.ceil(total / filters.limit),
        page: filters.page,
        limit: filters.limit
      }
    } : studentExams;
  }

  return filters.page && filters.limit ? {
    data: formattedExams,
    pagination: {
      total,
      pages: Math.ceil(total / filters.limit),
      page: filters.page,
      limit: filters.limit
    }
  } : formattedExams;
};

export const getExamByIdService = async (id: string, excludeCorrectAnswers: boolean = false) => {
  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      school: true,
      departments: {
        include: { department: true }
      },
      class: true,
      session: true,
      subjectExamPapers: {
        include: {
          subjectPaper: {
            include: {
              subject: true,
              teacher: true,
              questions: {
                orderBy: { order: "asc" },
              },
            }
          }
        },
      },
    },
  });

  if (!exam) return null;

  const formattedExam = {
    ...exam,
    subjectExamPapers: (exam as any).subjectExamPapers.map((link: any) => ({
      ...link.subjectPaper,
      examId: link.examId
    }))
  };

  if (excludeCorrectAnswers) {
    formattedExam.subjectExamPapers.forEach((paper: any) => {
      paper.questions = paper.questions.map((q: any) => ({
        ...q,
        correctAnswer: "", // Scrub sensitive data
        explanation: ""
      })) as any;
    });
  }

  return formattedExam;
};

export const getExamPapersService = async (examId: string, schoolId?: string) => {
  const links = await prisma.examSubjectPaper.findMany({
    where: { 
      examId,
      exam: schoolId ? { schoolId } : undefined
    },
    include: {
      subjectPaper: {
        include: {
          subject: true,
          teacher: true,
          questions: {
            select: { id: true },
          },
        }
      },
    },
  });

  return links.map(link => ({
    ...link.subjectPaper,
    examId: link.examId, // Keep for backward compatibility if possible
  }));
};

export const getSubjectPapersService = async (filters: { 
  teacherId?: string, 
  unlinkedOnly?: boolean,
  schoolId?: string,
  isPersonal?: boolean,
  sessionId?: string,
  term?: any,
  classId?: string,
  departmentIds?: string[],
  status?: string,
  page?: number,
  limit?: number,
  teacherClassesOnly?: string,
  currentTeacherId?: string,
}) => {
  const where: any = {};
  
  // 1. Filter by teacher (creator) or their assigned context
  if (filters.teacherId) {
    const assignedSubjects = await prisma.teacherSubject.findMany({
      where: { 
        teacherId: filters.teacherId,
        schoolId: filters.isPersonal ? null : filters.schoolId || undefined
      },
      select: { subjectId: true }
    });
    const subjectIds = assignedSubjects.map(s => s.subjectId);

    const teacherOrConditions: any[] = [];

    // They can see their own papers
    teacherOrConditions.push({ teacherId: filters.teacherId });

    // They can see papers for their assigned subjects
    if (subjectIds.length > 0) {
      teacherOrConditions.push({ subjectId: { in: subjectIds } });
    }

    // Check if they are assigned to any classes
    const assignedClasses = await prisma.classTeacher.findMany({
      where: { teacherId: filters.teacherId },
      select: { classId: true }
    });
    const classIds = assignedClasses.map(c => c.classId);

    if (classIds.length > 0) {
      // They can see papers linked to exams that are assigned to their classes
      teacherOrConditions.push({ exams: { some: { exam: { classId: { in: classIds } } } } });
    }

    if (filters.isPersonal) {
      where.teacherId = filters.teacherId;
    } else {
      if (teacherOrConditions.length > 0) {
        where.AND = [{ OR: teacherOrConditions }];
      } else {
        where.AND = [{ id: "none" }];
      }

      // Implement teacherClassesOnly scoping
      const isTeacherClassesOnly = filters.teacherClassesOnly === 'true';
      if (isTeacherClassesOnly) {
        if (filters.classId) {
          if (!classIds.includes(filters.classId)) {
            where.id = "none";
          }
        } else {
          const classSubjects = await prisma.classSubject.findMany({
            where: { classId: { in: classIds } },
            select: { subjectId: true }
          });
          const classSubjectIds = classSubjects.map((cs: any) => cs.subjectId);
          
          if (!where.AND) where.AND = [];
          where.AND.push({
            OR: [
              { subjectId: { in: classSubjectIds } },
              { exams: { some: { exam: { classId: { in: classIds } } } } },
              { teacherId: filters.teacherId }
            ]
          });
        }
      }
    }
  }

  // 3. Filter by school or personal context
  if (filters.isPersonal) {
    where.schoolId = null;
  } else if (filters.schoolId) {
    where.schoolId = filters.schoolId;
  }

  if (filters.unlinkedOnly) {
    where.exams = { none: {} };
  } else if (filters.sessionId || filters.term || filters.classId || (filters.departmentIds && filters.departmentIds.length > 0)) {
    const examFilters: any = {};
    if (filters.sessionId) examFilters.sessionId = filters.sessionId;
    if (filters.term) examFilters.term = filters.term;
    if (filters.classId) examFilters.classId = filters.classId;
    if (filters.departmentIds && filters.departmentIds.length > 0) {
      examFilters.departments = {
        some: { departmentId: { in: filters.departmentIds } }
      };
    }

    if (filters.classId) {
      const classSubjects = await prisma.classSubject.findMany({
        where: { classId: filters.classId },
        select: { subjectId: true }
      });
      const classSubjectIds = classSubjects.map((cs: any) => cs.subjectId);

      where.OR = [
        { subjectId: { in: classSubjectIds } },
        { exams: { some: { exam: examFilters } } }
      ];
    } else {
      // Advanced filtering via linked exams
      where.exams = {
        some: {
          exam: examFilters
        }
      };
    }
  }

  if (filters.status) {
    where.status = filters.status;
  }

  const papers = await prisma.subjectExamPaper.findMany({
    where,
    include: {
      subject: true,
      teacher: true,
      exams: {
        include: { exam: true }
      },
      questions: {
        select: { id: true }
      },
      _count: {
        select: { examAttempts: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    ...(filters.page && filters.limit ? {
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    } : {}),
  });

  const total = filters.page && filters.limit ? await prisma.subjectExamPaper.count({ where }) : papers.length;

  return filters.page && filters.limit ? {
    data: papers,
    pagination: {
      total,
      pages: Math.ceil(total / filters.limit),
      page: filters.page,
      limit: filters.limit
    }
  } : papers;
};

export const linkSubjectPaperToExamService = async (subjectPaperId: string, examId: string) => {
  return prisma.examSubjectPaper.upsert({
    where: {
      examId_subjectPaperId: {
        examId,
        subjectPaperId,
      },
    },
    update: {},
    create: {
      examId,
      subjectPaperId,
    },
  });
};

export const unlinkSubjectPaperService = async (subjectPaperId: string, examId?: string) => {
  if (examId) {
    return prisma.examSubjectPaper.delete({
      where: {
        examId_subjectPaperId: {
          examId,
          subjectPaperId,
        },
      },
    });
  } else {
    // If no examId provided, unlink from ALL exams (optional behavior, let's keep it safe)
    return prisma.examSubjectPaper.deleteMany({
      where: { subjectPaperId }
    });
  }
};

export const getSubjectPaperByIdService = async (id: string) => {
  return prisma.subjectExamPaper.findUnique({
    where: { id },
    include: {
      exams: {
        include: { exam: true }
      },
      subject: true,
      teacher: true,
      school: {
        include: {
          settings: true
        }
      },
      questions: {
        orderBy: { order: "asc" },
      },
      examAttempts: {
        include: {
          examAttempt: {
            include: {
              student: true
            }
          }
        }
      },
      grades: {
        include: {
          student: true
        }
      }
    },
  });
};

export const createSubjectPaperService = async ({
  examId,
  subjectId,
  teacherId,
  schoolId,
  title,
  instructions,
  durationMinutes,
  readingContent,
  images,
  imageLabels,
  creationMode,
}: {
  examId?: string;
  subjectId?: string;
  schoolId?: string;
  teacherId?: string;
  title?: string;
  instructions?: string;
  durationMinutes?: number;
  readingContent?: string;
  images?: string[];
  imageLabels?: string[];
  creationMode?: "MANUAL" | "AI" | "OMR";
}) => {
  return prisma.subjectExamPaper.create({
    data: {
      subjectId: subjectId || null,
      schoolId: schoolId || null,
      teacherId: teacherId || null,
      title: title || null,
      instructions: instructions || null,
      durationMinutes: durationMinutes || null,
      readingContent: readingContent || null,
      images: images || [],
      imageLabels: imageLabels || [],
      creationMode: (creationMode || "MANUAL") as any,
      exams: examId && examId !== 'none' ? {
        create: {
          examId
        }
      } : undefined,
    },
    include: {
      exams: {
        include: { exam: true }
      },
      subject: true,
      school: true,
      teacher: true,
    },
  });
};

export const updateSubjectPaperService = async (paperId: string, data: {
  title?: string;
  instructions?: string;
  durationMinutes?: number;
  readingContent?: string;
  images?: string[];
  imageLabels?: string[];
  subjectId?: string;
  teacherId?: string;
}) => {
  return prisma.subjectExamPaper.update({
    where: { id: paperId },
    data: {
      title: data.title || undefined,
      instructions: data.instructions || undefined,
      durationMinutes: data.durationMinutes !== undefined ? data.durationMinutes : undefined,
      readingContent: data.readingContent === "" ? null : (data.readingContent || undefined),
      images: data.images !== undefined ? data.images : undefined,
      imageLabels: data.imageLabels !== undefined ? data.imageLabels : undefined,
      subjectId: data.subjectId === "" ? null : (data.subjectId || undefined),
      teacherId: data.teacherId === "" ? null : (data.teacherId || undefined),
      updatedAt: new Date(),
    },
  });
};

export const addManualQuestionsToPaperService = async ({
  subjectPaperId,
  questions,
}: {
  subjectPaperId: string;
  questions: Array<{
    type: QuestionType;
    question: string;
    optionA?: string;
    optionB?: string;
    optionC?: string;
    optionD?: string;
    correctAnswer: string;
    explanation?: string;
    images?: string[];
    imageLabels?: string[];
    marks?: number;
  }>;
}) => {
  const paper = await prisma.subjectExamPaper.findUnique({
    where: { id: subjectPaperId },
  });

  if (!paper) throw new Error("Subject paper not found");
  if (paper.status === SubjectPaperStatus.PUBLISHED) {
    throw new Error("You cannot edit a published paper");
  }

  for (const q of questions) {
    validateExamQuestionInput({ ...q, marks: q.marks || 1 });
  }

  const existingCount = await prisma.subjectExamQuestion.count({
    where: { subjectPaperId },
  });

  await prisma.subjectExamQuestion.createMany({
    data: questions.map((q, index) => ({
      subjectPaperId,
      type: q.type,
      source: QuestionSource.MANUAL,
      question: q.question,
      optionA: q.optionA || null,
      optionB: q.optionB || null,
      optionC: q.optionC || null,
      optionD: q.optionD || null,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || null,
      images: q.images || [],
      imageLabels: q.imageLabels || [],
      marks: q.marks || 1,
      order: existingCount + index,
    })),
  });

  const all = await prisma.subjectExamQuestion.findMany({
    where: { subjectPaperId },
  });

  const totalMarks = all.reduce((sum, q) => sum + Number(q.marks || 0), 0);

  return prisma.subjectExamPaper.update({
    where: { id: subjectPaperId },
    data: { totalMarks },
    include: { questions: true },
  });
};

export const addAIQuestionsToPaperService = async ({
  subjectPaperId,
  questions,
}: {
  subjectPaperId: string;
  questions: Array<{
    type: QuestionType;
    question: string;
    optionA?: string;
    optionB?: string;
    optionC?: string;
    optionD?: string;
    correctAnswer: string;
    explanation?: string;
    images?: string[];
    imageLabels?: string[];
    marks?: number;
  }>;
}) => {
  const paper = await prisma.subjectExamPaper.findUnique({
    where: { id: subjectPaperId },
  });

  if (!paper) throw new Error("Subject paper not found");
  if (paper.status === SubjectPaperStatus.PUBLISHED) {
    throw new Error("You cannot edit a published paper");
  }

  for (const q of questions) {
    validateExamQuestionInput({ ...q, marks: q.marks || 1 });
  }

  const existingCount = await prisma.subjectExamQuestion.count({
    where: { subjectPaperId },
  });

  await prisma.subjectExamQuestion.createMany({
    data: questions.map((q, index) => ({
      subjectPaperId,
      type: q.type,
      source: QuestionSource.AI,
      question: q.question,
      optionA: q.optionA || null,
      optionB: q.optionB || null,
      optionC: q.optionC || null,
      optionD: q.optionD || null,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || null,
      images: q.images || [],
      imageLabels: q.imageLabels || [],
      marks: q.marks || 1,
      order: existingCount + index,
    })),
  });

  const all = await prisma.subjectExamQuestion.findMany({
    where: { subjectPaperId },
  });

  const totalMarks = all.reduce((sum, q) => sum + Number(q.marks || 0), 0);

  return prisma.subjectExamPaper.update({
    where: { id: subjectPaperId },
    data: { totalMarks },
    include: { questions: true },
  });
};

export const validateSubjectPaperService = async (subjectPaperId: string) => {
  const paper = await prisma.subjectExamPaper.findUnique({
    where: { id: subjectPaperId },
    include: { questions: true },
  });

  if (!paper) throw new Error("Subject paper not found");
  if (!paper.questions.length) {
    throw new Error("Subject paper must have at least one question");
  }

  for (const q of paper.questions) {
    validateExamQuestionInput({
      type: q.type,
      question: q.question,
      optionA: q.optionA || undefined,
      optionB: q.optionB || undefined,
      optionC: q.optionC || undefined,
      optionD: q.optionD || undefined,
      correctAnswer: q.correctAnswer,
      marks: Number(q.marks),
    });
  }

  // Final check of questions
  const paperWithQuestions = await prisma.subjectExamPaper.findUnique({
    where: { id: subjectPaperId },
    include: { 
      questions: true, 
      exams: { include: { exam: true } }, 
      subject: true 
    }
  });

  if (!paperWithQuestions) throw new Error("Subject paper not found");

  const updated = await prisma.subjectExamPaper.update({
    where: { id: subjectPaperId },
    data: {
      status: SubjectPaperStatus.APPROVED,
      validatedAt: new Date(),
    },
    include: { 
      questions: true, 
      exams: { include: { exam: true } }, 
      subject: true 
    },
  });

  // Notify school admins for each linked exam
  for (const link of updated.exams) {
    if (link.exam?.schoolId) {
      const schoolAdmins = await prisma.schoolAdmin.findMany({
        where: {
          schoolId: link.exam.schoolId,
          active: true,
        },
      });

      Promise.all(
        schoolAdmins.map((sa) =>
          createNotification({
            recipientType: "ADMIN",
            recipientId: sa.adminId,
            type: "GENERAL",
            title: "Subject Paper Validated!",
            message: `A subject paper for "${updated.subject?.name || "Unknown"}" in exam "${link.exam?.title || "Unknown"}" has been validated and is ready for publishing.`,
            link: `/dashboard/admin/exams/${link.examId}/papers/${updated.id}`,
            meta: { examId: link.examId, paperId: updated.id },
          })
        )
      ).catch((err) => console.error("Failed to notify admins of paper validation:", err));
    }
  }

  return updated;
};

export const publishSubjectPaperService = async (subjectPaperId: string) => {
  const paper = await prisma.subjectExamPaper.findUnique({
    where: { id: subjectPaperId },
    include: { questions: true },
  });

  if (!paper) throw new Error("Subject paper not found");
  if (!paper.questions.length) {
    throw new Error("Subject paper must have at least one question");
  }

  // Perform validation checks before publishing
  for (const q of paper.questions) {
    validateExamQuestionInput({
      type: q.type,
      question: q.question,
      optionA: q.optionA || undefined,
      optionB: q.optionB || undefined,
      optionC: q.optionC || undefined,
      optionD: q.optionD || undefined,
      correctAnswer: q.correctAnswer,
      marks: Number(q.marks),
    });
  }

  const updatedPaper = await prisma.subjectExamPaper.update({
    where: { id: subjectPaperId },
    data: {
      status: SubjectPaperStatus.PUBLISHED,
      validatedAt: paper.validatedAt || new Date(),
      publishedAt: new Date(),
    },
    include: { questions: true },
  });

  if (updatedPaper.schoolId) {
    createNotification({
      recipientType: "SCHOOL",
      recipientId: updatedPaper.schoolId,
      type: "GENERAL",
      title: "Subject Paper Published",
      message: `A new subject paper "${updatedPaper.title}" has been published by a teacher.`,
    }).catch((err) => console.error("Failed to notify school of paper publication:", err));
  }

  return updatedPaper;
};

export const validateExamService = async (examId: string) => {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      subjectExamPapers: {
        include: { subjectPaper: true }
      },
    },
  });

  if (!exam) throw new Error("Exam not found");
  if (!exam.subjectExamPapers.length) {
    throw new Error("Exam must have at least one subject paper");
  }

  const papers = exam.subjectExamPapers.map(link => link.subjectPaper);

  const unpublished = papers.filter(
    (paper) => paper.status !== SubjectPaperStatus.PUBLISHED
  );

  if (unpublished.length) {
    throw new Error("All subject papers must be published before exam validation");
  }

  const totalMarks = papers.reduce(
    (sum: number, p: any) => sum + Number(p.totalMarks || 0),
    0
  );

  return prisma.exam.update({
    where: { id: examId },
    data: {
      totalMarks,
      validatedAt: new Date(),
    },
    include: {
      subjectExamPapers: {
        include: { subjectPaper: true }
      },
    },
  });
};

export const publishExamService = async (examId: string) => {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      subjectExamPapers: {
        include: { subjectPaper: true }
      },
    },
  });

  if (!exam) throw new Error("Exam not found");
  if (!exam.subjectExamPapers.length) {
    throw new Error("Exam must have at least one subject paper");
  }

  const papers = exam.subjectExamPapers.map(link => link.subjectPaper);

  const unpublished = papers.filter(
    (paper) => paper.status !== SubjectPaperStatus.PUBLISHED
  );

  if (unpublished.length) {
    throw new Error("All subject papers must be published before publishing exam");
  }

  const totalMarks = papers.reduce(
    (sum: number, p: any) => sum + Number(p.totalMarks || 0),
    0
  );

  const updatedExam = await prisma.exam.update({
    where: { id: examId },
    data: {
      status: AssessmentStatus.PUBLISHED,
      validatedAt: exam.validatedAt || new Date(),
      publishedAt: new Date(),
      totalMarks,
    },
    include: { subjectExamPapers: true },
  });

  if (updatedExam.schoolId) {
    createNotification({
      recipientType: "SCHOOL",
      recipientId: updatedExam.schoolId,
      type: "GENERAL",
      title: "New Exam Published",
      message: `The exam "${updatedExam.title}" has been published by a teacher.`,
    }).catch((err) => console.error("Failed to notify school of exam publication:", err));
  }

  // SCATTER NOTIFICATIONS based on scope and targeting
  const notifyStudents = async () => {
    try {
      let recipientStudentIds: string[] = [];

      if (updatedExam.classId) {
        // Option A: Specific Class
        const enrollments = await prisma.classEnrollment.findMany({
          where: { classId: updatedExam.classId },
          select: { studentId: true },
        });

        const studentIdsInClass = enrollments.map(e => e.studentId);
        
        // Fetch specific departments if selected
        const examDepts = await prisma.examDepartment.findMany({
          where: { examId: updatedExam.id },
          select: { departmentId: true }
        });
        const deptIds = examDepts.map(ed => ed.departmentId);

        if (deptIds.length > 0) {
          // Only notify students in those departments
          const studentsInDepts = await prisma.student.findMany({
            where: {
              id: { in: studentIdsInClass },
              departmentId: { in: deptIds }
            },
            select: { id: true }
          });
          recipientStudentIds = studentsInDepts.map(s => s.id);
        } else {
          // General exam for the class
          recipientStudentIds = studentIdsInClass;
        }
      } else if (updatedExam.schoolId) {
        // School-wide or Department-wide (if no class is set)
        const examDepts = await prisma.examDepartment.findMany({
          where: { examId: updatedExam.id },
          select: { departmentId: true }
        });
        const deptIds = examDepts.map(ed => ed.departmentId);

        if (deptIds.length > 0) {
          const studentsInDepts = await prisma.student.findMany({
            where: {
              schoolId: updatedExam.schoolId,
              departmentId: { in: deptIds },
              verified: true
            },
            select: { id: true }
          });
          recipientStudentIds = studentsInDepts.map(s => s.id);
        } else {
          // School-wide
          const studentsInSchool = await prisma.student.findMany({
            where: { 
              schoolId: updatedExam.schoolId,
              verified: true 
            },
            select: { id: true },
          });
          recipientStudentIds = studentsInSchool.map(s => s.id);
        }
      }

      // Remove duplicates just in case
      const uniqueIds = Array.from(new Set(recipientStudentIds));

      if (uniqueIds.length > 0) {
        await Promise.all(
          uniqueIds.map((studentId) =>
            createNotification({
              recipientType: "STUDENT",
              recipientId: studentId,
              type: "GENERAL",
              title: "New Exam Published!",
              message: `A new exam "${updatedExam.title}" matches your target and is now available.`,
              link: `/dashboard/student/exams/${updatedExam.id}`,
              meta: { examId: updatedExam.id },
            })
          )
        );
      }
    } catch (err) {
      console.error("Failed to scatter exam notifications:", err);
    }
  };

  // Run notifications in background (don't block the response)
  notifyStudents();

  return updatedExam;
};

export const updateQuestionService = async (
  questionId: string,
  data: {
    type?: QuestionType;
    question?: string;
    optionA?: string;
    optionB?: string;
    optionC?: string;
    optionD?: string;
    correctAnswer?: string;
    explanation?: string;
    images?: string[];
    imageLabels?: string[];
    marks?: number;
  }
) => {
  const existing = await prisma.subjectExamQuestion.findUnique({
    where: { id: questionId },
    include: { subjectPaper: true },
  });

  if (!existing) throw new Error("Question not found");
  if (existing.subjectPaper.status === SubjectPaperStatus.PUBLISHED) {
    throw new Error("You cannot edit questions in a published paper");
  }

  // Validate if we have enough info to validate the full question
  const merged = {
    type: data.type || existing.type,
    question: data.question || existing.question,
    optionA: data.optionA !== undefined ? data.optionA : (existing.optionA || undefined),
    optionB: data.optionB !== undefined ? data.optionB : (existing.optionB || undefined),
    optionC: data.optionC !== undefined ? data.optionC : (existing.optionC || undefined),
    optionD: data.optionD !== undefined ? data.optionD : (existing.optionD || undefined),
    correctAnswer: data.correctAnswer || existing.correctAnswer,
    marks: data.marks !== undefined ? data.marks : Number(existing.marks),
    imageLabels: data.imageLabels !== undefined ? data.imageLabels : (existing.imageLabels || []),
  };

  validateExamQuestionInput(merged);

  const updated = await prisma.subjectExamQuestion.update({
    where: { id: questionId },
    data: {
      type: data.type,
      question: data.question,
      optionA: data.optionA,
      optionB: data.optionB,
      optionC: data.optionC,
      optionD: data.optionD,
      correctAnswer: data.correctAnswer,
      explanation: data.explanation,
      images: data.images,
      imageLabels: data.imageLabels,
      marks: data.marks,
    },
  });

  // Update total marks for the paper
  const all = await prisma.subjectExamQuestion.findMany({
    where: { subjectPaperId: existing.subjectPaperId },
  });
  const totalMarks = all.reduce((sum, q) => sum + Number(q.marks || 0), 0);
  await prisma.subjectExamPaper.update({
    where: { id: existing.subjectPaperId },
    data: { totalMarks },
  });

  return updated;
};

export const deleteQuestionService = async (questionId: string) => {
  const existing = await prisma.subjectExamQuestion.findUnique({
    where: { id: questionId },
    include: { subjectPaper: true },
  });

  if (!existing) throw new Error("Question not found");
  if (existing.subjectPaper.status === SubjectPaperStatus.PUBLISHED) {
    throw new Error("You cannot delete questions from a published paper");
  }

  await prisma.subjectExamQuestion.delete({
    where: { id: questionId },
  });

  // Update total marks for the paper
  const all = await prisma.subjectExamQuestion.findMany({
    where: { subjectPaperId: existing.subjectPaperId },
  });
  const totalMarks = all.reduce((sum, q) => sum + Number(q.marks || 0), 0);
  await prisma.subjectExamPaper.update({
    where: { id: existing.subjectPaperId },
    data: { totalMarks },
  });

  return { success: true };
};

export const updateExamService = async (
  examId: string,
  data: {
    title?: string;
    description?: string;
    startDate?: Date | string | null;
    durationMinutes?: number;
    allowImmediateResult?: boolean;
    resultReleaseAt?: Date | string | null;
    classId?: string | null;
    departmentIds?: string[];
    sessionId?: string | null;
    term?: any | null;
    teacherId?: string | null;
    endDate?: Date | string | null;
  }
) => {
  const existing = await prisma.exam.findUnique({
    where: { id: examId },
  });

  if (!existing) throw new Error("Exam not found");

  const updateData: any = { ...data };
  delete updateData.departmentIds; // Remove from direct updateData

  if (data.startDate !== undefined) {
    updateData.startDate = data.startDate ? new Date(data.startDate) : null;
  }
  if (data.resultReleaseAt !== undefined) {
    updateData.resultReleaseAt = data.resultReleaseAt ? new Date(data.resultReleaseAt) : null;
  }
  if (data.endDate !== undefined) {
    updateData.endDate = data.endDate ? new Date(data.endDate) : null;
  }

  // Ensure classId is handled if provided
  if (data.classId !== undefined) {
    updateData.classId = data.classId || null;
  }
  
  if (data.sessionId !== undefined) {
    updateData.sessionId = data.sessionId || null;
  }
  if (data.term !== undefined) {
    updateData.term = data.term || null;
  }
  if (data.teacherId !== undefined) {
    updateData.teacherId = data.teacherId || null;
  }

  if (data.departmentIds !== undefined) {
    updateData.departments = {
      deleteMany: {}, // Clear existing
      create: data.departmentIds.map((id) => ({ departmentId: id })), // Recreate
    };
  }

  if (data.allowImmediateResult !== undefined) {
    const gradeStatus = data.allowImmediateResult ? GradeStatus.PUBLISHED : GradeStatus.DRAFT;
    await prisma.grade.updateMany({
      where: { examId },
      data: { status: gradeStatus }
    });
  }

  return prisma.exam.update({
    where: { id: examId },
    data: updateData,
    include: {
      school: true,
      departments: {
        include: { department: true }
      },
      class: true,
      session: true,
      teacher: true,
    },
  });
};

export const reorderQuestionsService = async (
  subjectPaperId: string,
  reorderedIds: string[]
) => {
  const paper = await prisma.subjectExamPaper.findUnique({
    where: { id: subjectPaperId },
  });

  if (!paper) throw new Error("Subject paper not found");
  if (paper.status === SubjectPaperStatus.PUBLISHED) {
    throw new Error("You cannot reorder questions in a published paper");
  }

  // Verify that all IDs belong to this paper
  const questionCount = await prisma.subjectExamQuestion.count({
    where: {
      id: { in: reorderedIds },
      subjectPaperId,
    },
  });

  if (questionCount !== reorderedIds.length) {
    throw new Error("One or more question IDs are invalid or do not belong to this paper");
  }

  // Use a transaction to update all orders
  await prisma.$transaction(
    reorderedIds.map((id, index) =>
      prisma.subjectExamQuestion.update({
        where: { id },
        data: { order: index },
      })
    )
  );

  return { success: true };
};

export const unpublishExamService = async (examId: string) => {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
  });

  if (!exam) throw new Error("Exam not found");
  if (exam.status !== AssessmentStatus.PUBLISHED) {
    throw new Error("Only published exams can be unpublished");
  }

  return prisma.exam.update({
    where: { id: examId },
    data: {
      status: AssessmentStatus.DRAFT,
      publishedAt: null,
    },
  });
};

export const unpublishSubjectPaperService = async (subjectPaperId: string) => {
  const paper = await prisma.subjectExamPaper.findUnique({
    where: { id: subjectPaperId },
  });

  if (!paper) throw new Error("Subject paper not found");
  
  // Can unpublish if it's APPROVED or PUBLISHED
  if (paper.status !== SubjectPaperStatus.APPROVED && paper.status !== SubjectPaperStatus.PUBLISHED) {
    throw new Error("Only approved or published papers can be unpublished");
  }

  return prisma.subjectExamPaper.update({
    where: { id: subjectPaperId },
    data: {
      status: SubjectPaperStatus.DRAFT,
      publishedAt: null,
      validatedAt: null,
    },
  });
};

export const deleteSubjectPaperService = async (subjectPaperId: string) => {
  const paper = await prisma.subjectExamPaper.findUnique({
    where: { id: subjectPaperId },
    include: {
      questions: true,
      examAttempts: true,
    }
  });

  if (!paper) throw new Error("Subject paper not found");

  if (paper.examAttempts && paper.examAttempts.length > 0) {
    throw new Error("Cannot delete a paper that has student attempts. Try unpublishing it instead.");
  }

  return prisma.subjectExamPaper.delete({
    where: { id: subjectPaperId },
  });
};

export const deleteExamService = async (examId: string) => {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      subjectExamPapers: {
        include: {
          subjectPaper: {
            include: {
              examAttempts: true
            }
          }
        }
      }
    }
  });

  if (!exam) throw new Error("Exam not found");

  // Check if any paper in the exam has attempts
  const hasAttempts = (exam.subjectExamPapers as any[]).some(link => 
    link.subjectPaper.examAttempts && link.subjectPaper.examAttempts.length > 0
  );
  if (hasAttempts) {
    throw new Error("Cannot delete an exam that has student attempts. Try unpublishing it instead.");
  }

  // Deleting the exam will cascade to subject papers and questions because of Prisma schema (if configured)
  // Let's ensure a clean deletion via transaction if needed, but Prisma Cascade is usually enough.
  return prisma.exam.delete({
    where: { id: examId },
  });
};
