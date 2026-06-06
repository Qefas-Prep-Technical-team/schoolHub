import prisma from "../../config/database";

export const getStudentAssignmentsService = async (options: {
  studentId: string;
  status?: string;
  page: number;
  limit: number;
}) => {
  const { studentId, status, page, limit } = options;
  const skip = (page - 1) * limit;

  // Find the student's enrollments to know their classes
  const enrollments = await prisma.classEnrollment.findMany({
    where: { studentId },
    select: { classId: true },
  });

  const classIds = enrollments.map((e) => e.classId).filter(Boolean) as string[];

  if (classIds.length === 0) {
    return { assignments: [], total: 0, pages: 0 };
  }

  // Get assignments for those classes
  const whereClause: any = {
    classId: { in: classIds },
    status: "PUBLISHED", // Only show published assignments
  };

  const total = await prisma.assignment.count({ where: whereClause });

  const assignments = await prisma.assignment.findMany({
    where: whereClause,
    include: {
      submissions: {
        where: { studentId },
        take: 1, // At most 1 submission per assignment
      },
      _count: {
        select: { questions: true }
      }
    },
    orderBy: { dueDate: "asc" },
    skip,
    take: limit,
  });

  // Transform and calculate status
  let transformed = assignments.map((a) => {
    const submission = a.submissions[0];
    
    let computedStatus = "pending";
    if (submission) {
      computedStatus = submission.status.toLowerCase();
    } else if (a.dueDate && new Date(a.dueDate) < new Date()) {
      computedStatus = "overdue";
    }

    return {
      id: a.id,
      title: a.title,
      subjectId: a.subjectId,
      instructorId: a.teacherId,
      dueDate: a.dueDate,
      status: computedStatus,
      progress: submission && computedStatus !== "pending" ? 100 : 0,
      grade: submission?.score ? `${submission.score}/${a.totalMarks}` : null,
      submissionDate: submission?.submittedAt,
      totalMarks: a.totalMarks,
      questionCount: a._count.questions
    };
  });

  if (status && status !== "all") {
    transformed = transformed.filter(a => a.status === status);
  }

  return {
    assignments: transformed,
    total: transformed.length,
    pages: Math.ceil(total / limit),
  };
};

export const getAssignmentByIdService = async (studentId: string, assignmentId: string) => {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      questions: true,
      submissions: {
        where: { studentId },
        include: {
          answers: true
        }
      }
    }
  });

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  return assignment;
};

export const getTeacherAssignmentByIdService = async (assignmentId: string, schoolId: string) => {
  const assignment = await prisma.assignment.findFirst({
    where: { id: assignmentId, schoolId },
    include: {
      questions: { orderBy: { order: 'asc' } },
      submissions: {
        include: {
          answers: true
        }
      }
    }
  });

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  return assignment;
};

export const submitAssignmentService = async (
  studentId: string, 
  assignmentId: string, 
  data: { fileUrl?: string; fileName?: string; answers?: Array<{ questionId: string, answer: string }> }
) => {
  // Check if submission already exists
  let submission = await prisma.assignmentSubmission.findFirst({
    where: { studentId, assignmentId }
  });

  if (submission && ["SUBMITTED", "GRADED"].includes(submission.status)) {
    throw new Error("Assignment already submitted");
  }

  if (!submission) {
    submission = await prisma.assignmentSubmission.create({
      data: {
        studentId,
        assignmentId,
        status: "SUBMITTED",
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        submittedAt: new Date(),
      }
    });
  } else {
    submission = await prisma.assignmentSubmission.update({
      where: { id: submission.id },
      data: {
        status: "SUBMITTED",
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        submittedAt: new Date(),
      }
    });
  }

  // Handle specific question answers if provided
  if (data.answers && data.answers.length > 0) {
    const answerPromises = data.answers.map(ans => 
      prisma.assignmentAnswer.create({
        data: {
          submissionId: submission.id,
          questionId: ans.questionId,
          answer: ans.answer,
        }
      })
    );
    await Promise.all(answerPromises);
  }

  return submission;
};

export const getTeacherAssignmentsService = async (options: {
  schoolId: string;
  teacherId?: string; // If provided, filter by teacher. If admin, this might be undefined.
  page: number;
  limit: number;
  status?: string;
}) => {
  const { schoolId, teacherId, page, limit, status } = options;
  const skip = (page - 1) * limit;

  const whereClause: any = { schoolId };
  if (teacherId) {
    whereClause.teacherId = teacherId;
  }
  if (status && status !== "all") {
    whereClause.status = status.toUpperCase();
  }

  const total = await prisma.assignment.count({ where: whereClause });

  const assignments = await prisma.assignment.findMany({
    where: whereClause,
    include: {
      _count: {
        select: { questions: true, submissions: true }
      }
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  });

  // Manually fetch class and subject names
  const classIds = [...new Set(assignments.map(a => a.classId))];
  const subjectIds = [...new Set(assignments.map(a => a.subjectId))];

  const [classes, subjects] = await Promise.all([
    prisma.class.findMany({ 
        where: { id: { in: classIds } }, 
        select: { id: true, name: true, _count: { select: { enrollments: true } } } 
    }),
    prisma.subject.findMany({ where: { id: { in: subjectIds } }, select: { id: true, name: true } })
  ]);

  const classMap = Object.fromEntries(classes.map(c => [c.id, c]));
  const subjectMap = Object.fromEntries(subjects.map(s => [s.id, s]));

  const assignmentsWithNames = assignments.map(a => ({
    ...a,
    class: classMap[a.classId] || null,
    subject: subjectMap[a.subjectId] || null
  }));

  return {
    assignments: assignmentsWithNames,
    total,
    pages: Math.ceil(total / limit),
  };
};

export const createAssignmentService = async (data: {
  title: string;
  schoolId: string;
  teacherId: string;
  classIds: string[];
  subjectId: string;
  instructions?: string;
  dueDate?: Date;
  totalMarks?: number;
  status?: string;
  attachmentUrl?: string;
}) => {
  const { classIds, ...assignmentData } = data;
  
  if (!classIds || classIds.length === 0) {
    throw new Error("At least one class is required to create an assignment.");
  }

  // Create one assignment per class
  const createdAssignments = await Promise.all(
    classIds.map(classId => 
      prisma.assignment.create({
        data: {
          ...assignmentData,
          classId,
          status: (assignmentData.status as any) || "DRAFT"
        }
      })
    )
  );

  return createdAssignments;
};

export const addQuestionToAssignment = async (assignmentId: string, questionData: any) => {
  return prisma.assignmentQuestion.create({
    data: {
      ...questionData,
      assignmentId
    }
  });
};

export const updateAssignmentQuestion = async (questionId: string, data: any) => {
  return prisma.assignmentQuestion.update({ where: { id: questionId }, data });
};

export const deleteAssignmentQuestion = async (questionId: string) => {
  return prisma.assignmentQuestion.delete({ where: { id: questionId } });
};

export const reorderAssignmentQuestions = async (assignmentId: string, reorderedIds: string[]) => {
  return prisma.$transaction(
    reorderedIds.map((id, index) => prisma.assignmentQuestion.update({ where: { id }, data: { order: index } }))
  );
};

export const updateAssignmentStatusService = async (assignmentId: string, schoolId: string, status: "DRAFT" | "PUBLISHED") => {
  // Use updateMany to allow filtering by non-unique fields in the WHERE clause,
  // or first verify it exists and then update it by id.
  const assignment = await prisma.assignment.findFirst({
    where: { id: assignmentId, schoolId }
  });
  if (!assignment) throw new Error("Assignment not found");

  return prisma.assignment.update({
    where: { id: assignmentId },
    data: { status }
  });
};

export const updateAssignmentSettingsService = async (assignmentId: string, schoolId: string, data: any) => {
  const assignment = await prisma.assignment.findFirst({
    where: { id: assignmentId, schoolId }
  });
  if (!assignment) throw new Error("Assignment not found");

  return prisma.assignment.update({
    where: { id: assignmentId },
    data
  });
};
