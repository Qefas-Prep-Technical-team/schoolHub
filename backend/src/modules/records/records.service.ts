import { PrismaClient, ResultStatus, Term } from "@prisma/client";
import { createNotification } from "../notification/notification.service";

const prisma = new PrismaClient();

export const getClassSubjectResults = async (
  schoolId: string,
  filters: { sessionId?: string; term?: Term; classId?: string; }
) => {
  const whereClause: any = { schoolId, ...filters };

  return await prisma.classSubjectResult.findMany({
    where: whereClause,
    include: {
      session: { select: { name: true } },
      class: { select: { name: true } },
      subject: { select: { name: true } },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getStudentTermResults = async (
  schoolId: string,
  filters: { sessionId?: string; term?: Term; classId?: string; studentId?: string }
) => {
  return await prisma.studentTermResult.findMany({
    where: {
      schoolId,
      ...filters,
    },
    include: {
      student: { select: { name: true, studentCode: true } },
      class: { select: { name: true } },
      session: { select: { name: true } },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const createClassSubjectResult = async (
  schoolId: string,
  data: {
    name: string;
    classId: string;
    subjectId: string;
    sessionId: string;
    term: Term;
    departmentId?: string | null;
    revealDate?: string | null;
    releaseDate?: string | null;
    assignmentMax?: number | null;
    quizMax?: number | null;
    caMax?: number | null;
    examMax?: number | null;
  }
) => {
  return await prisma.classSubjectResult.create({
    data: {
      schoolId,
      name: data.name,
      classId: data.classId,
      subjectId: data.subjectId,
      sessionId: data.sessionId,
      term: data.term,
      departmentId: data.departmentId || null,
      revealDate: data.revealDate ? new Date(data.revealDate) : null,
      releaseDate: data.releaseDate ? new Date(data.releaseDate) : null,
      assignmentMax: data.assignmentMax,
      quizMax: data.quizMax,
      caMax: data.caMax,
      examMax: data.examMax,
    },
  });
};

export const getClassSubjectResultById = async (
  schoolId: string,
  id: string
) => {
  return await prisma.classSubjectResult.findFirst({
    where: {
      id,
      schoolId,
    },
    include: {
      session: { select: { name: true } },
      class: { select: { name: true } },
      subject: { select: { name: true } },
      department: { select: { name: true } },
    },
  });
};

export const updateClassSubjectResult = async (
  schoolId: string,
  id: string,
  data: {
    name?: string;
    revealDate?: string | null;
    releaseDate?: string | null;
    assignmentMax?: number | null;
    quizMax?: number | null;
    caMax?: number | null;
    examMax?: number | null;
    classId?: string | null;
    departmentId?: string | null;
    subjectId?: string | null;
  }
) => {
  const existing = await prisma.classSubjectResult.findFirst({
    where: { id, schoolId },
  });
  if (!existing) {
    throw new Error("Result configuration not found");
  }

  return await prisma.classSubjectResult.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.revealDate !== undefined && { revealDate: data.revealDate ? new Date(data.revealDate) : null }),
      ...(data.releaseDate !== undefined && { releaseDate: data.releaseDate ? new Date(data.releaseDate) : null }),
      ...(data.assignmentMax !== undefined && { assignmentMax: data.assignmentMax }),
      ...(data.quizMax !== undefined && { quizMax: data.quizMax }),
      ...(data.caMax !== undefined && { caMax: data.caMax }),
      ...(data.examMax !== undefined && { examMax: data.examMax }),
      ...(data.classId !== undefined && data.classId !== null && { classId: data.classId }),
      ...(data.departmentId !== undefined && { departmentId: data.departmentId }),
      ...(data.subjectId !== undefined && data.subjectId !== null && { subjectId: data.subjectId }),
    },
  });
};

export const getStudentSubjectResults = async (
  schoolId: string,
  filters: { classId: string; subjectId: string; sessionId: string; term: Term }
) => {
  return await prisma.studentSubjectTermResult.findMany({
    where: {
      schoolId,
      classId: filters.classId,
      subjectId: filters.subjectId,
      sessionId: filters.sessionId,
      term: filters.term,
    },
  });
};

export const bulkUpsertStudentSubjectResults = async (
  schoolId: string,
  data: {
    classId: string;
    subjectId: string;
    sessionId: string;
    term: Term;
    scores: {
      studentId: string;
      assignmentScore?: number | null;
      quizScore?: number | null;
      caScore?: number | null;
      examScore?: number | null;
      scoreSources?: any;
    }[];
  }
) => {
  const operations = data.scores.map((score) => {
    // Calculate total score based on provided scores
    let totalScore = 0;
    if (score.assignmentScore) totalScore += score.assignmentScore;
    if (score.quizScore) totalScore += score.quizScore;
    if (score.caScore) totalScore += score.caScore;
    if (score.examScore) totalScore += score.examScore;

    return prisma.studentSubjectTermResult.upsert({
      where: {
        studentId_subjectId_sessionId_term: {
          studentId: score.studentId,
          subjectId: data.subjectId,
          sessionId: data.sessionId,
          term: data.term,
        },
      },
      update: {
        assignmentScore: score.assignmentScore,
        quizScore: score.quizScore,
        caScore: score.caScore,
        examScore: score.examScore,
        totalScore,
        ...(score.scoreSources !== undefined && { scoreSources: score.scoreSources }),
        updatedAt: new Date(),
      },
      create: {
        schoolId,
        studentId: score.studentId,
        classId: data.classId,
        subjectId: data.subjectId,
        sessionId: data.sessionId,
        term: data.term,
        assignmentScore: score.assignmentScore,
        quizScore: score.quizScore,
        caScore: score.caScore,
        examScore: score.examScore,
        totalScore,
        ...(score.scoreSources !== undefined && { scoreSources: score.scoreSources }),
      },
    });
  });

  return await prisma.$transaction(operations);
};

export const updateClassSubjectResultPaperLinks = async (
  schoolId: string,
  id: string,
  paperLinks: {
    exam?: string[];
    subjectPaper?: string[];
    ca?: string[];
    assignment?: string[];
  }
) => {
  return await prisma.classSubjectResult.update({
    where: { id, schoolId },
    data: { paperLinks },
  });
};

export const calculatePaperSync = async (schoolId: string, id: string, studentIds: string[], category?: 'assignment' | 'ca' | 'quiz' | 'exam') => {
  const resultConfig = await prisma.classSubjectResult.findFirst({
    where: { id, schoolId },
  });
  if (!resultConfig) {
    throw new Error('Result configuration not found');
  }

  const paperLinks: any = resultConfig.paperLinks || {};
  
  const syncResults = studentIds.map(studentId => ({
    studentId,
    assignment: 0,
    quiz: 0,
    ca: 0,
    exam: 0
  }));

  const processSubjectPapers = async (paperIds: string[] | undefined, maxScore: number | null, key: 'ca' | 'quiz' | 'exam') => {
    if (!paperIds || paperIds.length === 0 || maxScore == null) return;
    
    const papers = await prisma.subjectExamPaper.findMany({
      where: { id: { in: paperIds }, schoolId },
      select: { id: true, totalMarks: true }
    });
    const totalPossibleMarks = papers.reduce((sum, p) => sum + (p.totalMarks || 0), 0);
    
    if (totalPossibleMarks === 0) return;

    const grades = await prisma.grade.findMany({
      where: {
        studentId: { in: studentIds },
        subjectPaperId: { in: paperIds },
        subjectExamAttemptId: null // Only get manual grades not linked to an attempt
      }
    });

    const onlineAttempts = await prisma.subjectExamAttempt.findMany({
      where: {
        subjectPaperId: { in: paperIds },
        examAttempt: {
          studentId: { in: studentIds }
        }
      },
      include: {
        examAttempt: true
      }
    });

    for (const res of syncResults) {
      const studentGrades = grades.filter(g => g.studentId === res.studentId);
      const manualScore = studentGrades.reduce((sum, g) => sum + (g.score || 0), 0);
      
      const studentOnline = onlineAttempts.filter(a => a.examAttempt?.studentId === res.studentId);
      const onlineScore = studentOnline.reduce((sum, a) => sum + (a.score || 0), 0);

      const studentTotalScore = manualScore + onlineScore;
      
      const scaledScore = (studentTotalScore / totalPossibleMarks) * maxScore;
      res[key] = parseFloat(scaledScore.toFixed(2));
    }
  };

  const processAssignments = async (assignmentIds: string[] | undefined, maxScore: number | null) => {
    if (!assignmentIds || assignmentIds.length === 0 || maxScore == null) return;

    const assignments = await prisma.assignment.findMany({
      where: { id: { in: assignmentIds }, schoolId },
      select: { id: true, totalMarks: true }
    });
    const totalPossibleMarks = assignments.reduce((sum, a) => sum + (a.totalMarks || 0), 0);

    if (totalPossibleMarks === 0) return;

    const submissions = await prisma.assignmentSubmission.findMany({
      where: {
        studentId: { in: studentIds },
        assignmentId: { in: assignmentIds }
      }
    });

    for (const res of syncResults) {
      const studentSubs = submissions.filter(s => s.studentId === res.studentId);
      const studentTotalScore = studentSubs.reduce((sum, s) => sum + (s.score || 0), 0);
      
      const scaledScore = (studentTotalScore / totalPossibleMarks) * maxScore;
      res.assignment = parseFloat(scaledScore.toFixed(2));
    }
  };

  if (!category || category === 'ca') await processSubjectPapers(paperLinks.ca, resultConfig.caMax, 'ca');
  if (!category || category === 'quiz') await processSubjectPapers(paperLinks.subjectPaper, resultConfig.quizMax, 'quiz');
  if (!category || category === 'exam') await processSubjectPapers(paperLinks.exam, resultConfig.examMax, 'exam');
  if (!category || category === 'assignment') await processAssignments(paperLinks.assignment, resultConfig.assignmentMax);

  // Return only the requested category to avoid overwriting zeroes for skipped categories
  if (category) {
    return syncResults.map(res => ({
      studentId: res.studentId,
      [category]: res[category]
    }));
  }

  return syncResults;
};

export const getStudentScoreBreakdown = async (schoolId: string, id: string, studentId: string) => {
  const resultConfig = await prisma.classSubjectResult.findFirst({
    where: { id, schoolId },
  });
  if (!resultConfig) {
    throw new Error('Result configuration not found');
  }

  const termResult = await prisma.studentSubjectTermResult.findUnique({
    where: {
      studentId_subjectId_sessionId_term: {
        studentId,
        subjectId: resultConfig.subjectId,
        sessionId: resultConfig.sessionId,
        term: resultConfig.term,
      }
    }
  });

  const paperLinks: any = resultConfig.paperLinks || {};
  const breakdown: Record<string, any[]> = {
    ca: [],
    quiz: [],
    exam: [],
    assignment: []
  };

  const processSubjectPapers = async (paperIds: string[] | undefined, key: 'ca' | 'quiz' | 'exam') => {
    if (!paperIds || paperIds.length === 0) return;
    
    const papers = await prisma.subjectExamPaper.findMany({
      where: { id: { in: paperIds }, schoolId },
      select: { id: true, title: true, totalMarks: true }
    });
    
    if (papers.length === 0) return;

    const grades = await prisma.grade.findMany({
      where: {
        studentId,
        subjectPaperId: { in: paperIds },
      }
    });

    for (const paper of papers) {
      const grade = grades.find(g => g.subjectPaperId === paper.id);
      breakdown[key].push({
        paperName: paper.title || 'Untitled',
        score: grade?.score ?? null,
        maxScore: paper.totalMarks ?? 0
      });
    }
  };

  const processAssignments = async (assignmentIds: string[] | undefined) => {
    if (!assignmentIds || assignmentIds.length === 0) return;

    const assignments = await prisma.assignment.findMany({
      where: { id: { in: assignmentIds }, schoolId },
      select: { id: true, title: true, totalMarks: true }
    });

    if (assignments.length === 0) return;

    const submissions = await prisma.assignmentSubmission.findMany({
      where: {
        studentId,
        assignmentId: { in: assignmentIds }
      }
    });

    for (const assignment of assignments) {
      const sub = submissions.find(s => s.assignmentId === assignment.id);
      breakdown.assignment.push({
        paperName: assignment.title || 'Untitled',
        score: sub?.score ?? null,
        maxScore: assignment.totalMarks ?? 0
      });
    }
  };

  await processSubjectPapers(paperLinks.ca, 'ca');
  await processSubjectPapers(paperLinks.subjectPaper, 'quiz');
  await processSubjectPapers(paperLinks.exam, 'exam');
  await processAssignments(paperLinks.assignment);

  return {
    breakdown,
    sources: termResult?.scoreSources || {}
  };
};

export const publishClassSubjectResult = async (
  schoolId: string,
  id: string
) => {
  const result = await prisma.classSubjectResult.findFirst({
    where: { id, schoolId },
    include: {
      session: true,
      class: true,
      subject: true,
    }
  });

  if (!result) throw new Error("Result configuration not found");

  // Update status to PUBLISHED
  await prisma.classSubjectResult.update({
    where: { id },
    data: { status: "PUBLISHED" }
  });

  // Update all student results
  const studentResults = await prisma.studentSubjectTermResult.findMany({
    where: {
      schoolId,
      classId: result.classId,
      subjectId: result.subjectId,
      sessionId: result.sessionId,
      term: result.term
    },
    include: {
      student: true
    }
  });

  if (studentResults.length > 0) {
    await prisma.studentSubjectTermResult.updateMany({
      where: {
        schoolId,
        classId: result.classId,
        subjectId: result.subjectId,
        sessionId: result.sessionId,
        term: result.term
      },
      data: { status: "PUBLISHED" }
    });
  }

  // Find teachers for this subject
  const teacherSubjects = await prisma.teacherSubject.findMany({
    where: {
      schoolId: schoolId,
      subjectId: result.subjectId
    },
    include: { teacher: true }
  });
  const teacherIds = teacherSubjects.map(ts => ts.teacherId).filter(Boolean) as string[];

  // Notify admin (SCHOOL)
  await createNotification({
    recipientType: "SCHOOL",
    recipientId: schoolId,
    type: "ACADEMIC",
    title: "Result Published",
    message: `Final result for ${result.class?.name} - ${result.subject?.name} (${result.session?.name}, ${result.term}) has been published.`,
  });

  // Notify teachers
  for (const tid of Array.from(new Set(teacherIds))) {
    await createNotification({
      recipientType: "TEACHER",
      recipientId: tid,
      type: "ACADEMIC",
      title: "Result Published",
      message: `Final result for your subject ${result.subject?.name} in ${result.class?.name} has been published.`,
    });
  }

  // Notify students
  for (const sr of studentResults) {
    await createNotification({
      recipientType: "STUDENT",
      recipientId: sr.studentId,
      type: "ACADEMIC",
      title: "Final Result Published",
      message: `Your final result for ${result.session?.name} and ${result.term} has been published.`,
    });
  }

  return { success: true };
};

export const unpublishClassSubjectResult = async (
  schoolId: string,
  id: string
) => {
  const result = await prisma.classSubjectResult.findFirst({
    where: { id, schoolId }
  });

  if (!result) throw new Error("Result configuration not found");

  // Update status to DRAFT
  await prisma.classSubjectResult.update({
    where: { id },
    data: { status: "DRAFT" }
  });

  // Update all student results
  await prisma.studentSubjectTermResult.updateMany({
    where: {
      schoolId,
      classId: result.classId,
      subjectId: result.subjectId,
      sessionId: result.sessionId,
      term: result.term
    },
    data: { status: "DRAFT" }
  });

  return { success: true };
};
