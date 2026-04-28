import { LinkEntityType, LinkStatus, LinkType } from "@prisma/client";
import prisma from "../../config/database";

/**
 * Fetch all teachers linked to a school via active RelationshipLinks
 * @param schoolId The ID of the school
 */
export const getSchoolTeachersService = async (schoolId: string) => {
  // Find active school-teacher links from RelationshipLink
  const links = await prisma.relationshipLink.findMany({
    where: {
      linkType: LinkType.SCHOOL_TEACHER,
      status: LinkStatus.ACTIVE,
      OR: [
        {
          leftEntityType: LinkEntityType.SCHOOL,
          leftEntityId: schoolId,
          rightEntityType: LinkEntityType.TEACHER,
        },
        {
          rightEntityType: LinkEntityType.SCHOOL,
          rightEntityId: schoolId,
          leftEntityType: LinkEntityType.TEACHER,
        },
      ],
    },
  });

  const linkedTeacherIds = links.map((link) => 
    link.leftEntityType === LinkEntityType.TEACHER ? link.leftEntityId : link.rightEntityId
  );

  // We also check for teachers who have a direct school record
  return prisma.teacher.findMany({
    where: {
      OR: [
        { id: { in: linkedTeacherIds } },
        { primarySchoolId: schoolId },
        { activeSchoolId: schoolId }
      ]
    },
    select: {
      id: true,
      name: true,
      email: true,
      teacherCode: true,
      authProvider: true,
      verified: true,
      role: true,
      gender: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

/**
 * Fetch all students linked to a school via active RelationshipLinks or direct schoolId
 * @param schoolId The ID of the school
 */
export const getSchoolStudentsService = async (
  schoolId: string,
  filters: { classId?: string; gender?: any; verified?: boolean; search?: string } = {}
) => {
  // 0. Resolve canonical school UUID
  const school = await prisma.school.findFirst({
    where: {
      OR: [
        { id: schoolId },
        { tenantId: schoolId }
      ]
    },
    select: { id: true }
  });
  
  if (!school) return { data: [], total: 0 };
  const resolvedId = school.id;

  // Find active school-student links from RelationshipLink
  const links = await prisma.relationshipLink.findMany({
    where: {
      linkType: LinkType.SCHOOL_STUDENT,
      status: LinkStatus.ACTIVE,
      OR: [
        { leftEntityId: resolvedId },
        { rightEntityId: resolvedId },
      ],
    },
  });

  const linkedStudentIds = links.map((link) => 
    link.leftEntityType === LinkEntityType.STUDENT ? link.leftEntityId : link.rightEntityId
  );

  // Also include students from class enrollments
  const enrollments = await prisma.classEnrollment.findMany({
    where: { class: { schoolId: resolvedId } },
    select: { studentId: true }
  });
  const enrolledStudentIds = enrollments.map(e => e.studentId);

  const where: any = {
    AND: [
      {
        OR: [
          { id: { in: [...new Set([...linkedStudentIds, ...enrolledStudentIds])] } },
          { schoolId: resolvedId },
          { originalSchoolId: resolvedId }
        ]
      }
    ]
  };

  if (filters.classId) {
    where.AND.push({
      classes: {
        some: {
          classId: filters.classId
        }
      }
    });
  }

  if (filters.gender) {
    where.AND.push({ gender: filters.gender });
  }

  if (filters.verified !== undefined) {
    where.AND.push({ verified: filters.verified });
  }

  if (filters.search) {
    where.AND.push({
      OR: [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { studentCode: { contains: filters.search, mode: 'insensitive' } },
      ]
    });
  }

  // Also include students with direct schoolId or originalSchoolId
  return prisma.student.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      studentCode: true,
      authProvider: true,
      verified: true,
      role: true,
      gender: true,
      profileImage: true,
      bannerImage: true,
      classes: {
        include: {
          class: true,
        },
      },
      department: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

export const getSchoolStatsService = async (schoolId: string) => {
  // 0. Resolve canonical school UUID (schoolId could be tenantId or id)
  const school = await prisma.school.findFirst({
    where: {
      OR: [
        { id: schoolId },
        { tenantId: schoolId }
      ]
    },
    select: { id: true }
  });
  
  if (!school) return { students: 0, teachers: 0, classes: 0, exams: 0, subjects: 0 };
  const resolvedId = school.id;

  // 1. Gather all student IDs associated with this school
  // A. From RelationshipLinks
  const studentLinks = await prisma.relationshipLink.findMany({
    where: {
      linkType: LinkType.SCHOOL_STUDENT,
      status: LinkStatus.ACTIVE,
      OR: [
        { leftEntityId: resolvedId },
        { rightEntityId: resolvedId },
      ],
    },
    select: { leftEntityType: true, leftEntityId: true, rightEntityId: true }
  });
  const linkedStudentIds = studentLinks.map((link) => 
    link.leftEntityType === LinkEntityType.STUDENT ? link.leftEntityId : link.rightEntityId
  );

  // B. From Class Enrollments
  const enrollments = await prisma.classEnrollment.findMany({
    where: { class: { schoolId: resolvedId } },
    select: { studentId: true }
  });
  const enrolledStudentIds = enrollments.map(e => e.studentId);

  // C. Final Student Count (Direct + Linked + Enrolled)
  const studentCount = await prisma.student.count({
    where: {
      OR: [
        { id: { in: [...new Set([...linkedStudentIds, ...enrolledStudentIds])] } },
        { schoolId: resolvedId },
        { originalSchoolId: resolvedId }
      ]
    }
  });

  // 2. Count Teachers (Direct + Linked)
  const teacherLinks = await prisma.relationshipLink.findMany({
    where: {
      linkType: LinkType.SCHOOL_TEACHER,
      status: LinkStatus.ACTIVE,
      OR: [
        { leftEntityId: resolvedId },
        { rightEntityId: resolvedId },
      ],
    },
    select: { leftEntityType: true, leftEntityId: true, rightEntityId: true }
  });
  const linkedTeacherIds = teacherLinks.map((link) => 
    link.leftEntityType === LinkEntityType.TEACHER ? link.leftEntityId : link.rightEntityId
  );

  const teacherCount = await prisma.teacher.count({
    where: {
      OR: [
        { id: { in: linkedTeacherIds } },
        { primarySchoolId: resolvedId },
        { activeSchoolId: resolvedId }
      ]
    }
  });

  const classes = await prisma.class.count({ where: { schoolId: resolvedId } });
  const exams = await prisma.exam.count({ where: { schoolId: resolvedId } });
  const subjects = await prisma.subject.count({ where: { schoolId: resolvedId } });

  return {
    students: studentCount,
    teachers: teacherCount,
    classes,
    exams,
    subjects,
  };
};

/**
 * Fetch detailed school profile
 */
export const getSchoolProfileService = async (schoolId: string) => {
  return await prisma.school.findUnique({
    where: { id: schoolId },
    include: {
      admins: {
        include: {
          admin: true,
        },
      },
      sessions: {
        orderBy: {
          startDate: "desc",
        },
        take: 1,
      },
    },
  });
};

/**
 * Update school profile
 */
export const updateSchoolProfileService = async (schoolId: string, data: any) => {
  return await prisma.school.update({
    where: { id: schoolId },
    data,
  });
};

export const getSchoolSettingsService = async (schoolId: string) => {
  console.log(`[SchoolService] getSchoolSettings: Starting for schoolId: ${schoolId}`);
  
  // Resolve the school by either its UUID `id` or its `tenantId` string
  const school = await prisma.school.findFirst({
    where: {
      OR: [
        { id: schoolId },
        { tenantId: schoolId }
      ]
    },
    select: { id: true, name: true }
  });

  if (!school) {
    console.error(`[SchoolService] getSchoolSettings: School NOT FOUND for id/tenantId: ${schoolId}`);
    throw new Error(`School record not found for the provided ID: "${schoolId}". Settings cannot be fetched or created.`);
  }

  // Use the canonical school.id (UUID) for all further lookups
  const resolvedId = school.id;
  console.log(`[SchoolService] getSchoolSettings: School verified: "${school.name}" (resolved ID: ${resolvedId})`);

  let settings = await prisma.schoolSetting.findUnique({
    where: { schoolId: resolvedId },
  });

  if (!settings) {
    console.log(`[SchoolService] getSchoolSettings: No settings found. Creating default settings...`);
    try {
      settings = await prisma.schoolSetting.create({
        data: { schoolId: resolvedId },
      });
      console.log(`[SchoolService] getSchoolSettings: Default settings created successfully.`);
    } catch (createError: any) {
      console.error(`[SchoolService] getSchoolSettings: FAILED to create settings:`, createError);
      throw new Error(`Database error while creating school settings: ${createError.message}`);
    }
  } else {
    console.log(`[SchoolService] getSchoolSettings: Settings record retrieved.`);
  }

  return settings;
};

export const updateSchoolSettingsService = async (schoolId: string, data: any) => {
  console.log(`[SchoolService] updateSchoolSettings: Received update request for schoolId: ${schoolId}`);
  
  // Resolve the canonical school.id
  const school = await prisma.school.findFirst({
    where: {
      OR: [
        { id: schoolId },
        { tenantId: schoolId }
      ]
    },
    select: { id: true }
  });

  if (!school) {
    throw new Error(`Cannot update settings: school not found for ID "${schoolId}".`);
  }

  const resolvedId = school.id;

  try {
    const updatePayload: any = {};
    if (data.showComingSoon !== undefined) updatePayload.showComingSoon = !!data.showComingSoon;
    if (data.themeColor !== undefined) updatePayload.themeColor = String(data.themeColor);
    if (data.defaultSession !== undefined) updatePayload.defaultSession = data.defaultSession || null;
    if (data.defaultTerm !== undefined) updatePayload.defaultTerm = data.defaultTerm || null;
    if (data.enableEmailNotifications !== undefined) updatePayload.enableEmailNotifications = !!data.enableEmailNotifications;
    if (data.enablePushNotifications !== undefined) updatePayload.enablePushNotifications = !!data.enablePushNotifications;
    if (data.enableMaintenanceMode !== undefined) updatePayload.enableMaintenanceMode = !!data.enableMaintenanceMode;
    if (data.allowTeacherDigitalSignature !== undefined) updatePayload.allowTeacherDigitalSignature = !!data.allowTeacherDigitalSignature;
    if (data.lockSettings !== undefined) updatePayload.lockSettings = !!data.lockSettings;

    console.log(`[SchoolService] updateSchoolSettings: Payload:`, JSON.stringify(updatePayload));

    const updated = await prisma.schoolSetting.update({
      where: { schoolId: resolvedId },
      data: updatePayload,
    });
    console.log(`[SchoolService] updateSchoolSettings: SUCCESS`);
    return updated;
  } catch (updateError: any) {
    console.error(`[SchoolService] updateSchoolSettings: FAILED:`, updateError);
    if (updateError.code === 'P2025') {
      throw new Error(`Settings record not found to update. Try refreshing the page.`);
    }
    throw new Error(`Prisma Error [${updateError.code || 'UNKNOWN'}]: ${updateError.message}`);
  }
};

/**
 * Perform a high-level performance analysis for the entire school
 */
export const getSchoolPerformanceAnalysisService = async (schoolId: string) => {
  const [grades, examAttempts] = await Promise.all([
    prisma.grade.findMany({
      where: { schoolId },
      select: {
        score: true,
        maxMarks: true,
        subject: true,
      },
    }),
    prisma.examAttempt.findMany({
      where: {
        exam: { schoolId: schoolId },
        status: 'SCORED',
      },
      select: {
        totalScore: true,
        totalMarks: true,
      },
    }),
  ]);

  const totalAssessments = grades.length + examAttempts.length;

  if (totalAssessments === 0) {
    return {
      averageScore: 0,
      totalAssessments: 0,
      subjectBreakdown: [],
      insight: "Gathering institutional metrics to generate strategic performance insights...",
      letterGrade: "N/A",
    };
  }

  // Calculate weighted average
  let sumPercentage = 0;
  grades.forEach(g => {
      const gMax = g.maxMarks || 100;
      sumPercentage += ((g.score || 0) / gMax) * 100;
  });
  examAttempts.forEach(e => {
      const eMax = e.totalMarks || 100;
      sumPercentage += ((e.totalScore || 0) / eMax) * 100;
  });
  
  const averageScore = Math.round(sumPercentage / totalAssessments);

  // Group by subject (Grades usually have subject, attempts don't in the top level but we'll use grades for breakdown)
  const subjectMap: Record<string, { total: number; count: number }> = {};
  grades.forEach((g) => {
    if (!subjectMap[g.subject]) subjectMap[g.subject] = { total: 0, count: 0 };
    subjectMap[g.subject].total += (g.score / g.maxMarks) * 100;
    subjectMap[g.subject].count += 1;
  });

  const subjectBreakdown = Object.entries(subjectMap).map(([name, data]) => ({
    name,
    average: Math.round(data.total / data.count),
  }));

  // Determine Letter Grade
  let letterGrade = "F";
  if (averageScore >= 90) letterGrade = "A+";
  else if (averageScore >= 80) letterGrade = "A";
  else if (averageScore >= 70) letterGrade = "B+";
  else if (averageScore >= 60) letterGrade = "B";
  else if (averageScore >= 50) letterGrade = "C";
  else if (averageScore >= 40) letterGrade = "D";

  const strongestSubject = [...subjectBreakdown].sort((a, b) => b.average - a.average)[0];

  let insight = `The institution is maintaining a solid ${letterGrade} standing with an average mastery of ${averageScore}%. `;
  if (strongestSubject) {
    insight += `Academic excellence is most prominent in ${strongestSubject.name}. `;
  }
  if (averageScore < 60) {
    insight += "AI suggests immediate faculty review of current assessment methodologies to boost performance metrics.";
  } else {
    insight += "Current trajectory indicates consistent academic growth across all departments.";
  }

  return {
    averageScore,
    totalAssessments,
    subjectBreakdown,
    insight,
    letterGrade,
  };
};

/**
 * Fetch a summary of recent institutional activity for the Admin Dashboard
 */
export const getDashboardRecentActivityService = async (schoolId: string) => {
  const [recentExams, unassignedTeachers, classes] = await Promise.all([
    // 1. Fetch 5 most recent exams
    prisma.exam.findMany({
      where: { schoolId },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        class: true,
        teacher: true,
      }
    }),
    
    // 2. Find teachers not linked to any class (simplified logic)
    prisma.teacher.findMany({
      where: {
        OR: [
          { primarySchoolId: schoolId },
          { activeSchoolId: schoolId }
        ],
        classTeachers: { none: {} }
      },
      select: { id: true, name: true }
    }),

    // 3. Fetch all classes for context
    prisma.class.findMany({
      where: { schoolId },
      include: {
        _count: {
          select: { enrollments: true, teachers: true }
        }
      }
    })
  ]);

  return {
    recentExams,
    unassignedCount: unassignedTeachers.length,
    unassignedTeachers: unassignedTeachers.slice(0, 3), // Return a few names
    classesSummary: classes.map(c => ({
      id: c.id,
      name: c.name,
      studentCount: (c as any)._count.enrollments,
      teacherCount: (c as any)._count.teachers,
    }))
  };
};
/**
 * Fetch consolidated billing data for a school
 */
export const getSchoolBillingService = async (schoolId: string, page = 1, limit = 5) => {
  // Resolve school by UUID or tenantId (frontend may pass either)
  const school = await prisma.school.findFirst({
    where: {
      OR: [
        { id: schoolId },
        { tenantId: schoolId },
      ]
    },
    select: {
      id: true,
      plan: true,
      planId: true,
      subscriptionStatus: true,
      subscriptionEnd: true,
      isTrialActive: true,
      lastPaymentDate: true,
      paystackCustomerCode: true,
      billingCycle: true,
      subscriptionPlanId: true,
    }
  });

  if (!school) {
    throw new Error(`School not found for ID: "${schoolId}". Billing data cannot be fetched.`);
  }

  const resolvedId = school.id;
  const skip = (page - 1) * limit;

  // Fetch billing data sequentially to minimize concurrent connections
  const stats = await getSchoolStatsService(resolvedId);
  const transactions = await prisma.transaction.findMany({
    where: { schoolId: resolvedId },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  });
  const totalTransactions = await prisma.transaction.count({
    where: { schoolId: resolvedId }
  });
  const storageMetric = await prisma.fileMetric.aggregate({
    where: { schoolId: resolvedId },
    _sum: { fileSize: true }
  });

  // Always fetch the absolute latest transaction for cycle/status reliability
  const absoluteLatestTransaction = await prisma.transaction.findFirst({
    where: { schoolId: resolvedId },
    orderBy: { createdAt: "desc" }
  });

    const subscriptionPlan = school.subscriptionPlanId 
    ? await prisma.subscriptionPlan.findUnique({ where: { id: school.subscriptionPlanId } })
    : null;

    return {
        subscription: {
            plan: (school.isTrialActive && subscriptionPlan) ? subscriptionPlan.type : school.plan,
            planId: school.planId,
            subscriptionStatus: school.isTrialActive ? 'TRIAL' : school.subscriptionStatus,
            subscriptionEnd: school.subscriptionEnd,
            isTrialActive: school.isTrialActive,
            lastPaymentDate: school.lastPaymentDate,
            paystackCustomerCode: school.paystackCustomerCode,
            billingCycle: school.billingCycle || absoluteLatestTransaction?.billingCycle || 'monthly',
            features: subscriptionPlan?.features || [],
        },
    usage: {
      ...stats,
      storageBytes: storageMetric._sum.fileSize ? Number(storageMetric._sum.fileSize) : 0,
    },
    transactions,
    totalTransactions,
  };
};
