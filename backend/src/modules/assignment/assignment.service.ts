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
  const enrollments = await prisma.studentEnrollment.findMany({
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
      instructorId: a.teacherId, // Client will resolve name via subject/instructor mapping if needed, or we fetch it here.
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
    whereClause.status = status;
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

  return {
    assignments,
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
