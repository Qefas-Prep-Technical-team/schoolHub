import prisma from "../../config/database";

// Helper: verify teacherId exists in the Teacher table before using as FK
async function resolveTeacherId(teacherId: string | null | undefined): Promise<string | null> {
  if (!teacherId) return null;
  const teacher = await prisma.teacher.findUnique({ where: { id: teacherId }, select: { id: true } });
  return teacher ? teacher.id : null;
}

export const getStudentAssignmentsService = async (options: {
  studentId: string;
  status?: string;
  page: number;
  limit: number;
}) => {
  const { studentId, status, page, limit } = options;
  const skip = (page - 1) * limit;

  // Find the student and their enrollments to know their classes and department
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { departmentId: true, schoolId: true, classes: { select: { classId: true } } },
  });

  if (!student) {
    return { assignments: [], total: 0, pages: 0 };
  }

  const classIds = student.classes.map((e) => e.classId).filter(Boolean) as string[];

  // Resolve schoolId from the student record or from their enrolled class
  const studentEnrollment = await prisma.studentEnrollment.findFirst({
    where: { studentId, status: 'ACTIVE' },
    select: { schoolId: true },
  });
  const resolvedSchoolId = student.schoolId || studentEnrollment?.schoolId || null;

  if (classIds.length === 0 && !resolvedSchoolId) {
    return { assignments: [], total: 0, pages: 0 };
  }

  // Get assignments for those classes, filtering by department if applicable
  // Also include school-wide assignments (no class restriction) for the student's school
  const orConditions: any[] = [];

  if (classIds.length > 0) {
    // Assignments tied to the student's classes, open to all or their dept
    orConditions.push({
      classId: { in: classIds },
      OR: [
        { departmentId: null },
        { departmentId: student.departmentId }
      ]
    });
  }

  const whereClause: any = {
    status: 'PUBLISHED',
    OR: orConditions.length > 0 ? orConditions : undefined,
  };

  // Fallback: if no class and no orConditions, nothing to show
  if (orConditions.length === 0) {
    return { assignments: [], total: 0, pages: 0 };
  }

  const total = await prisma.assignment.count({ where: whereClause });

  const assignments = await prisma.assignment.findMany({
    where: whereClause,
    include: {
      department: { select: { name: true } },
      submissions: {
        where: { studentId },
        include: {
          answers: {
            select: { answer: true }
          }
        },
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

  const subjectIds = [...new Set(assignments.map(a => a.subjectId))];
  const subjects = await prisma.subject.findMany({
    where: { id: { in: subjectIds } },
    select: { id: true, name: true }
  });
  const subjectMap = Object.fromEntries(subjects.map(s => [s.id, s.name]));

  // Transform and calculate status
  let transformed = assignments.map((a) => {
    const submission = a.submissions[0];
    
    let computedStatus = "pending";
    if (submission) {
      if (submission.status === "SUBMITTED") {
        const releaseDate = a.scoreReleaseDate || a.dueDate;
        if (!releaseDate || new Date(releaseDate) <= new Date()) {
          computedStatus = "graded";
          (async () => {
            try {
              await prisma.assignmentSubmission.update({
                where: { id: submission.id },
                data: { status: "GRADED", gradedAt: new Date() }
              });

              // Sync to Grade model
              if (submission.score !== null) {
                const subjectName = subjectMap[a.subjectId] || "Assignment";
                const validTeacherId = await resolveTeacherId(a.teacherId);
                await prisma.grade.upsert({
                  where: { id: `grade-assignment-${submission.id}` },
                  update: {
                    score: submission.score,
                    maxMarks: a.totalMarks,
                    updatedAt: new Date(),
                  },
                  create: {
                    id: `grade-assignment-${submission.id}`,
                    studentId: studentId,
                    schoolId: a.schoolId,
                    teacherId: validTeacherId,
                    classId: a.classId,
                    subject: subjectName,
                    assessmentType: "ASSIGNMENT",
                    score: submission.score,
                    maxMarks: a.totalMarks,
                    remarks: a.title,
                  }
                });
              }
            } catch (err) {
              console.error("Failed to lazily sync grade for assignment:", err);
            }
          })();
        } else {
          computedStatus = "submitted";
        }
      } else {
        computedStatus = submission.status.toLowerCase();
      }
    } else if (a.dueDate && new Date(a.dueDate) < new Date()) {
      computedStatus = "overdue";
    }

    const totalQuestions = a._count.questions;
    const answeredCount = submission && submission.answers 
      ? submission.answers.filter((ans: any) => ans.answer && ans.answer.trim() !== "").length 
      : 0;

    let computedProgress = 0;
    if (submission) {
      if (computedStatus === "submitted" || computedStatus === "graded") {
        computedProgress = 100;
      } else {
        computedProgress = totalQuestions > 0 
          ? Math.round((answeredCount / totalQuestions) * 100) 
          : 0;
      }
    }

    return {
      id: a.id,
      classId: a.classId,
      title: a.title,
      subjectId: a.subjectId,
      subject: subjectMap[a.subjectId],
      departmentId: a.departmentId,
      department: a.department?.name,
      instructorId: a.teacherId,
      dueDate: a.dueDate,
      status: computedStatus,
      progress: computedProgress,
      grade: submission?.score ? `${submission.score}/${a.totalMarks}` : null,
      feedback: submission?.feedback || null,
      submissionDate: submission?.submittedAt,
      totalMarks: a.totalMarks,
      questionCount: a._count.questions,
      attachmentUrl: a.attachmentUrl,
      videoUrl: a.videoUrl,
      referenceUrl: a.referenceUrl,
      instructions: a.instructions,
      createdAt: a.createdAt,
    };
  });

  // Note: 'PUBLISHED' is already enforced at the DB query level (whereClause.status = 'PUBLISHED').
  // The transformed objects use computed statuses: pending/submitted/graded/overdue.
  // Only apply the post-filter for those computed statuses (not for 'PUBLISHED').
  if (status && status !== "all" && status !== "PUBLISHED") {
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

  if (assignment.submissions && assignment.submissions.length > 0) {
    let sub = assignment.submissions[0];
    if (sub.status === "SUBMITTED") {
      const releaseDate = assignment.scoreReleaseDate || assignment.dueDate;
      if (!releaseDate || new Date(releaseDate) <= new Date()) {
        (async () => {
          try {
            await prisma.assignmentSubmission.update({
              where: { id: sub.id },
              data: { status: "GRADED", gradedAt: new Date() }
            });

            if (sub.score !== null) {
              const subject = await prisma.subject.findUnique({ where: { id: assignment.subjectId } });
              const subjectName = subject ? subject.name : "Assignment";
              
                  const validTeacherId = await resolveTeacherId(assignment.teacherId);
                  await prisma.grade.upsert({
                    where: { id: `grade-assignment-${sub.id}` },
                    update: {
                      score: sub.score,
                      maxMarks: assignment.totalMarks,
                      updatedAt: new Date(),
                    },
                    create: {
                      id: `grade-assignment-${sub.id}`,
                      studentId: studentId,
                      schoolId: assignment.schoolId,
                      teacherId: validTeacherId,
                      classId: assignment.classId,
                      subject: subjectName,
                      assessmentType: "ASSIGNMENT",
                      score: sub.score,
                      maxMarks: assignment.totalMarks,
                      remarks: assignment.title,
                    }
                  });
            }
          } catch (err) {
            console.error("Failed to lazily sync grade for assignment:", err);
          }
        })();
        
        sub.status = "GRADED";
        sub.gradedAt = new Date();
      }
    }
  }

  const [classData, subjectData, departmentData, teacherData] = await Promise.all([
    prisma.class.findUnique({ where: { id: assignment.classId }, select: { id: true, name: true } }),
    prisma.subject.findUnique({ where: { id: assignment.subjectId }, select: { id: true, name: true } }),
    assignment.departmentId ? prisma.department.findUnique({ where: { id: assignment.departmentId }, select: { id: true, name: true } }) : Promise.resolve(null),
    prisma.teacher.findUnique({ where: { id: assignment.teacherId }, select: { name: true, profileImage: true } })
  ]);

  return {
    ...assignment,
    grade: assignment.submissions?.[0]?.score ?? null,
    class: classData,
    subject: subjectData,
    department: departmentData,
    teacher: teacherData ? {
      firstName: teacherData.name.split(' ')[0] || '',
      lastName: teacherData.name.split(' ').slice(1).join(' ') || '',
      user: {
        avatarUrl: teacherData.profileImage
      }
    } : null
  };
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

  const [classData, subjectData, departmentData] = await Promise.all([
    prisma.class.findUnique({ where: { id: assignment.classId }, select: { id: true, name: true } }),
    prisma.subject.findUnique({ where: { id: assignment.subjectId }, select: { id: true, name: true } }),
    assignment.departmentId ? prisma.department.findUnique({ where: { id: assignment.departmentId }, select: { id: true, name: true } }) : Promise.resolve(null)
  ]);

  const studentIds = assignment.submissions.map(s => s.studentId);
  const students = await prisma.student.findMany({
    where: { id: { in: studentIds } },
    select: { id: true, name: true, email: true, profileImage: true }
  });
  const studentMap = new Map(students.map(s => [s.id, s]));

  const submissionsWithStudent = assignment.submissions.map(sub => ({
    ...sub,
    student: studentMap.get(sub.studentId) || null
  }));

  return {
    ...assignment,
    submissions: submissionsWithStudent,
    class: classData,
    subject: subjectData,
    department: departmentData
  };
};

export const submitAssignmentService = async (
  studentId: string, 
  assignmentId: string, 
  data: { fileUrl?: string; fileName?: string; answers?: Array<{ questionId: string, answer: string }>; isDraft?: boolean }
) => {
  // Check if submission already exists
  let submission = await prisma.assignmentSubmission.findFirst({
    where: { studentId, assignmentId }
  });

  if (submission && ["SUBMITTED", "GRADED"].includes(submission.status)) {
    throw new Error("Assignment already submitted");
  }

  const finalStatus = data.isDraft ? "PENDING" : "SUBMITTED";
  const finalSubmittedAt = data.isDraft ? null : new Date();

  if (!submission) {
    submission = await prisma.assignmentSubmission.create({
      data: {
        studentId,
        assignmentId,
        status: finalStatus,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        submittedAt: finalSubmittedAt,
      }
    });
  } else {
    submission = await prisma.assignmentSubmission.update({
      where: { id: submission.id },
      data: {
        status: finalStatus,
        fileUrl: data.fileUrl ?? submission.fileUrl,
        fileName: data.fileName ?? submission.fileName,
        submittedAt: finalSubmittedAt ?? submission.submittedAt,
      }
    });
  }

  // Handle specific question answers if provided (upsert each answer to allow updates/draft sync)
  if (data.answers && data.answers.length > 0) {
    const answerPromises = data.answers.map(async (ans) => {
      const existingAnswer = await prisma.assignmentAnswer.findFirst({
        where: {
          submissionId: submission.id,
          questionId: ans.questionId,
        }
      });

      if (existingAnswer) {
        return prisma.assignmentAnswer.update({
          where: { id: existingAnswer.id },
          data: { answer: ans.answer }
        });
      } else {
        return prisma.assignmentAnswer.create({
          data: {
            submissionId: submission.id,
            questionId: ans.questionId,
            answer: ans.answer,
          }
        });
      }
    });
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
    const [classTeachers, subjectTeachers] = await Promise.all([
      prisma.classTeacher.findMany({
        where: { teacherId },
        select: { classId: true }
      }),
      prisma.teacherSubject.findMany({
        where: { teacherId, schoolId: schoolId || undefined },
        select: { subjectId: true }
      })
    ]);
    
    const assignedClassIds = classTeachers.map(ct => ct.classId);
    const assignedSubjectIds = subjectTeachers.map(st => st.subjectId);
    
    whereClause.OR = [
      { classId: { in: assignedClassIds } },
      { teacherId }
    ];
    
    if (assignedSubjectIds.length > 0) {
      whereClause.OR.push({ subjectId: { in: assignedSubjectIds } });
    }
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
  const isValidUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
  const classIds = [...new Set(assignments.map(a => a.classId))].filter(isValidUuid);
  const subjectIds = [...new Set(assignments.map(a => a.subjectId))].filter(isValidUuid);

  const [classes, subjects] = await Promise.all([
    prisma.class.findMany({ 
        where: { id: { in: classIds } }, 
        select: { id: true, name: true, _count: { select: { enrollments: true } } } 
    }),
    prisma.subject.findMany({ where: { id: { in: subjectIds } }, select: { id: true, name: true } })
  ]);

  const classMap = Object.fromEntries(classes.map(c => [c.id, c]));
  const subjectMap = Object.fromEntries(subjects.map(s => [s.id, s]));

  const assignmentsWithNames = await Promise.all(assignments.map(async a => {
    // get class enrollment count for this assignment's department
    const targetStudentsCount = await prisma.classEnrollment.count({
      where: {
        classId: a.classId,
        ...(a.departmentId ? { student: { departmentId: a.departmentId } } : {})
      }
    });

    return {
      ...a,
      class: classMap[a.classId] || null,
      subject: subjectMap[a.subjectId] || null,
      totalTargetedStudents: targetStudentsCount
    };
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
  departmentId?: string;
  instructions?: string;
  dueDate?: Date;
  totalMarks?: number;
  status?: string;
  attachmentUrl?: string;
  videoUrl?: string;
  referenceUrl?: string;
  scoreReleaseDate?: Date;
}) => {
  const { classIds, departmentId, ...assignmentData } = data;
  
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
          departmentId: departmentId || null,
          status: (assignmentData.status as any) || "DRAFT",
          scoreReleaseDate: assignmentData.scoreReleaseDate || null
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

export const updateAssignmentStatusService = async (assignmentId: string, schoolId: string, status: "DRAFT" | "PUBLISHED", userId?: string, userType?: string) => {
  // Use updateMany to allow filtering by non-unique fields in the WHERE clause,
  // or first verify it exists and then update it by id.
  const assignment = await prisma.assignment.findFirst({
    where: { id: assignmentId, schoolId }
  });
  if (!assignment) throw new Error("Assignment not found");

  if (userType !== 'ADMIN' && assignment.teacherId !== userId) {
    throw new Error("Unauthorized: Only the creator or an admin can update the assignment status");
  }

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

  const updateData: any = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.instructions !== undefined) updateData.instructions = data.instructions;
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
  if (data.maxScore !== undefined) updateData.totalMarks = data.maxScore;
  if (data.totalMarks !== undefined) updateData.totalMarks = data.totalMarks;

  return prisma.assignment.update({
    where: { id: assignmentId },
    data: updateData
  });
};

export const deleteAssignmentService = async (assignmentId: string, schoolId: string, userId?: string, userType?: string) => {
  const assignment = await prisma.assignment.findFirst({
    where: { id: assignmentId, schoolId }
  });
  if (!assignment) throw new Error("Assignment not found");

  if (userType !== 'ADMIN' && assignment.teacherId !== userId) {
    throw new Error("Unauthorized: Only the creator or an admin can delete this assignment");
  }

  // First find all submissions for this assignment
  const submissions = await prisma.assignmentSubmission.findMany({
    where: { assignmentId }
  });
  
  if (submissions.length > 0) {
    const submissionIds = submissions.map(s => s.id);
    // Delete all answers associated with these submissions
    await prisma.assignmentAnswer.deleteMany({
      where: { submissionId: { in: submissionIds } }
    });
    // Delete the submissions
    await prisma.assignmentSubmission.deleteMany({
      where: { assignmentId }
    });
  }

  // Then delete related assignment questions
  await prisma.assignmentQuestion.deleteMany({
    where: { assignmentId }
  });

  return prisma.assignment.delete({
    where: { id: assignmentId }
  });
};

export const gradeSubmissionService = async (
  assignmentId: string,
  submissionId: string,
  schoolId: string,
  grades: Array<{ answerId: string; isCorrect: boolean; score: number; maxScore?: number; teacherComment?: string }>
) => {
  // Verify assignment belongs to the school
  const assignment = await prisma.assignment.findFirst({
    where: { id: assignmentId, schoolId },
    include: { questions: true }
  });
  if (!assignment) throw new Error("Assignment not found");

  // Fetch the submission and its answers
  const submission = await prisma.assignmentSubmission.findUnique({
    where: { id: submissionId },
    include: { answers: { include: { question: true } } }
  });

  if (!submission || submission.assignmentId !== assignmentId) {
    throw new Error("Submission not found");
  }

  const answerMap = new Map(submission.answers.map(a => [a.id, a]));

  // Update answers within a transaction
  await prisma.$transaction(async (tx) => {
    let totalScore = 0;
    let questionsUpdated = false;

    for (const grade of grades) {
      const answer = answerMap.get(grade.answerId);
      if (!answer) continue;

      const question = answer.question;
      let currentMaxScore = question.marks || 0;

      if (grade.maxScore !== undefined && grade.maxScore !== null) {
        currentMaxScore = grade.maxScore;
        if (currentMaxScore !== question.marks) {
          await tx.assignmentQuestion.update({
            where: { id: question.id },
            data: { marks: currentMaxScore }
          });
          questionsUpdated = true;
          // Update cached question for total marks recalculation
          const qIndex = assignment.questions.findIndex(q => q.id === question.id);
          if (qIndex > -1) {
            assignment.questions[qIndex].marks = currentMaxScore;
          }
        }
      }

      if (grade.score > currentMaxScore) {
        throw new Error(`Score (${grade.score}) cannot exceed the question's maximum marks (${currentMaxScore})`);
      }

      await tx.assignmentAnswer.update({
        where: { id: grade.answerId },
        data: {
          isCorrect: grade.isCorrect,
          score: grade.score,
          teacherComment: grade.teacherComment
        }
      });
    }

    if (questionsUpdated) {
      const newTotalMarks = assignment.questions.reduce((sum, q) => sum + (q.marks || 0), 0);
      await tx.assignment.update({
        where: { id: assignmentId },
        data: { totalMarks: newTotalMarks }
      });
      assignment.totalMarks = newTotalMarks;
    }

    // Recalculate total score
    const allAnswers = await tx.assignmentAnswer.findMany({
      where: { submissionId }
    });

    totalScore = allAnswers.reduce((sum, ans) => sum + ans.score, 0);

    // Update submission
    await tx.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        score: totalScore,
        status: "GRADED",
        gradedAt: new Date()
      }
    });

    // Sync to Grade model so it appears on the student grades dashboard
    const subject = await tx.subject.findUnique({ where: { id: assignment.subjectId } });
    const subjectName = subject ? subject.name : "Assignment";

    const validTeacherId = await resolveTeacherId(assignment.teacherId);

    await tx.grade.upsert({
      where: { id: `grade-assignment-${submissionId}` },
      update: {
        score: totalScore,
        maxMarks: assignment.totalMarks,
        updatedAt: new Date(),
      },
      create: {
        id: `grade-assignment-${submissionId}`,
        studentId: submission.studentId,
        schoolId: assignment.schoolId,
        teacherId: validTeacherId,
        classId: assignment.classId,
        subject: subjectName,
        assessmentType: "ASSIGNMENT",
        score: totalScore,
        maxMarks: assignment.totalMarks,
        remarks: assignment.title,
      }
    });
  });

  return { success: true };
};
