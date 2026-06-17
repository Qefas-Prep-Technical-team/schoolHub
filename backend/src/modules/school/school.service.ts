import prisma from "../../config/database";
import { LinkEntityType, LinkStatus, LinkType } from "@prisma/client";
import { EntitlementService } from "../subscription/entitlement.service";

/**
 * Resolve a school ID (which might be a UUID or a tenantId) to its canonical UUID.
 */
export const resolveSchoolId = async (
  schoolId: string,
): Promise<string | null> => {
  const school = await prisma.school.findFirst({
    where: {
      OR: [{ id: schoolId }, { tenantId: schoolId }],
    },
    select: { id: true },
  });
  return school ? school.id : null;
};

/**
 * Fetch all teachers linked to a school via active RelationshipLinks
 * @param schoolId The ID of the school
 */
export const getSchoolTeachersService = async (schoolId: string) => {
  const resolvedId = await resolveSchoolId(schoolId);
  if (!resolvedId) return [];

  // Find active school-teacher links from RelationshipLink
  const links = await prisma.relationshipLink.findMany({
    where: {
      linkType: LinkType.SCHOOL_TEACHER,
      status: LinkStatus.ACTIVE,
      OR: [
        {
          leftEntityType: LinkEntityType.SCHOOL,
          leftEntityId: resolvedId,
          rightEntityType: LinkEntityType.TEACHER,
        },
        {
          rightEntityType: LinkEntityType.SCHOOL,
          rightEntityId: resolvedId,
          leftEntityType: LinkEntityType.TEACHER,
        },
      ],
    },
  });

  const linkedTeacherIds = links.map((link) =>
    link.leftEntityType === LinkEntityType.TEACHER
      ? link.leftEntityId
      : link.rightEntityId,
  );

  // We also check for teachers who have a direct school record
  return prisma.teacher.findMany({
    where: {
      OR: [
        { id: { in: linkedTeacherIds } },
        { primarySchoolId: resolvedId },
        { activeSchoolId: resolvedId },
      ],
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
      primarySchoolId: true,
      isClaimed: true,
      teacherSubjects: {
        include: { subject: true }
      },
      classTeachers: {
        include: { class: true }
      }
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
  filters: {
    classId?: string;
    gender?: any;
    verified?: boolean;
    search?: string;
  } = {},
) => {
  const resolvedId = await resolveSchoolId(schoolId);
  if (!resolvedId) return { data: [], total: 0 };

  // Find active school-student links from RelationshipLink
  const links = await prisma.relationshipLink.findMany({
    where: {
      linkType: LinkType.SCHOOL_STUDENT,
      status: LinkStatus.ACTIVE,
      OR: [{ leftEntityId: resolvedId }, { rightEntityId: resolvedId }],
    },
  });

  const linkedStudentIds = links.map((link) =>
    link.leftEntityType === LinkEntityType.STUDENT
      ? link.leftEntityId
      : link.rightEntityId,
  );

  // Also include students from class enrollments
  const enrollments = await prisma.classEnrollment.findMany({
    where: { class: { schoolId: resolvedId } },
    select: { studentId: true },
  });
  const enrolledStudentIds = enrollments.map((e) => e.studentId);

  const where: any = {
    AND: [
      {
        OR: [
          {
            id: {
              in: [...new Set([...linkedStudentIds, ...enrolledStudentIds])],
            },
          },
          { schoolId: resolvedId },
          { originalSchoolId: resolvedId },
        ],
      },
    ],
  };

  if (filters.classId) {
    where.AND.push({
      classes: {
        some: {
          classId: filters.classId,
        },
      },
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
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { studentCode: { contains: filters.search, mode: "insensitive" } },
      ],
    });
  }

  // Also include students with direct schoolId or originalSchoolId
  const [data, total] = await Promise.all([
    prisma.student.findMany({
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
    }),
    prisma.student.count({ where }),
  ]);

  return { data, total };
};

export const getSchoolStatsService = async (schoolId: string) => {
  const resolvedId = await resolveSchoolId(schoolId);
  if (!resolvedId)
    return { students: 0, teachers: 0, classes: 0, exams: 0, subjects: 0 };

  // 1. Fetch all link-related data in parallel
  const [studentLinks, enrollments, teacherLinks, classes, exams, subjects] =
    await Promise.all([
      // A. Student Links
      prisma.relationshipLink.findMany({
        where: {
          linkType: LinkType.SCHOOL_STUDENT,
          status: LinkStatus.ACTIVE,
          OR: [{ leftEntityId: resolvedId }, { rightEntityId: resolvedId }],
        },
        select: {
          leftEntityType: true,
          leftEntityId: true,
          rightEntityId: true,
        },
      }),
      // B. Student Enrollments
      prisma.classEnrollment.findMany({
        where: { class: { schoolId: resolvedId } },
        select: { studentId: true },
      }),
      // C. Teacher Links
      prisma.relationshipLink.findMany({
        where: {
          linkType: LinkType.SCHOOL_TEACHER,
          status: LinkStatus.ACTIVE,
          OR: [{ leftEntityId: resolvedId }, { rightEntityId: resolvedId }],
        },
        select: {
          leftEntityType: true,
          leftEntityId: true,
          rightEntityId: true,
        },
      }),
      // D. Base Counts
      prisma.class.count({ where: { schoolId: resolvedId } }),
      prisma.exam.count({ where: { schoolId: resolvedId } }),
      prisma.subject.count({ where: { schoolId: resolvedId } }),
    ]);

  // 2. Process Student IDs
  const linkedStudentIds = studentLinks.map((link) =>
    link.leftEntityType === LinkEntityType.STUDENT
      ? link.leftEntityId
      : link.rightEntityId,
  );
  const enrolledStudentIds = enrollments.map((e) => e.studentId);
  const studentCount = await prisma.student.count({
    where: {
      OR: [
        {
          id: {
            in: [...new Set([...linkedStudentIds, ...enrolledStudentIds])],
          },
        },
        { schoolId: resolvedId },
        { originalSchoolId: resolvedId },
      ],
    },
  });

  // 3. Process Teacher IDs
  const linkedTeacherIds = teacherLinks.map((link) =>
    link.leftEntityType === LinkEntityType.TEACHER
      ? link.leftEntityId
      : link.rightEntityId,
  );
  const teacherCount = await prisma.teacher.count({
    where: {
      OR: [
        { id: { in: linkedTeacherIds } },
        { primarySchoolId: resolvedId },
        { activeSchoolId: resolvedId },
      ],
    },
  });

  return {
    students: studentCount,
    teachers: teacherCount,
    classes,
    exams,
    subjects,
  };
};

/**
 * Fetch attendance summary across all classes for a school for a specific date (defaults to today).
 * Uses @db.Date-compatible query by converting to a date-only string.
 */
export const getSchoolTodayAttendanceService = async (schoolId: string, dateString?: string) => {
  const resolvedId = await resolveSchoolId(schoolId);
  if (!resolvedId) return [];

  // Build the date at midnight UTC to match @db.Date stored values
  let now = new Date();
  if (dateString) {
    now = new Date(dateString);
  }
  const targetDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const nextDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + 1));

  // Fetch all attendance records for this school's classes in one query for the target date
  const records = await prisma.attendance.findMany({
    where: {
      class: { schoolId: resolvedId },
      date: {
        gte: targetDate,
        lt: nextDate,
      },
    },
    select: {
      classId: true,
      status: true,
      class: {
        select: { name: true, section: true },
      },
    },
  });

  if (records.length === 0) return [];

  // Group by classId
  const grouped = new Map<string, { className: string; present: number; absent: number; late: number; total: number }>();

  for (const r of records) {
    if (!grouped.has(r.classId)) {
      grouped.set(r.classId, {
        className: r.class.section ? `${r.class.name} (${r.class.section})` : r.class.name,
        present: 0,
        absent: 0,
        late: 0,
        total: 0,
      });
    }
    const entry = grouped.get(r.classId)!;
    entry.total++;
    const s = r.status.toLowerCase();
    if (s === 'present') entry.present++;
    else if (s === 'absent') entry.absent++;
    else if (s === 'late') entry.late++;
  }

  return Array.from(grouped.entries()).map(([classId, d]) => ({
    classId,
    className: d.className,
    present: d.present,
    absent: d.absent,
    late: d.late,
    total: d.total,
    rate: d.total > 0 ? Math.round((d.present / d.total) * 100) : 0,
  }));
};


export const getSchoolProfileService = async (schoolId: string) => {
  const resolvedId = await resolveSchoolId(schoolId);
  if (!resolvedId) return null;

  return await prisma.school.findUnique({
    where: { id: resolvedId },
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
      subscriptionPlan: true,
    },
  });
};

/**
 * Update school profile
 */
export const updateSchoolProfileService = async (
  schoolId: string,
  data: any,
) => {
  const resolvedId = await resolveSchoolId(schoolId);
  if (!resolvedId) throw new Error("School not found");

  return await prisma.school.update({
    where: { id: resolvedId },
    data,
  });
};

export const getSchoolSettingsService = async (schoolId: string) => {
  console.log(
    `[SchoolService] getSchoolSettings: Starting for schoolId: ${schoolId}`,
  );

  // Resolve the school by either its UUID `id` or its `tenantId` string
  const school = await prisma.school.findFirst({
    where: {
      OR: [{ id: schoolId }, { tenantId: schoolId }],
    },
    select: { id: true, name: true },
  });

  if (!school) {
    console.error(
      `[SchoolService] getSchoolSettings: School NOT FOUND for id/tenantId: ${schoolId}`,
    );
    throw new Error(
      `School record not found for the provided ID: "${schoolId}". Settings cannot be fetched or created.`,
    );
  }

  // Use the canonical school.id (UUID) for all further lookups
  const resolvedId = school.id;
  console.log(
    `[SchoolService] getSchoolSettings: School verified: "${school.name}" (resolved ID: ${resolvedId})`,
  );

  let settings = await prisma.schoolSetting.findUnique({
    where: { schoolId: resolvedId },
  });

  if (!settings) {
    console.log(
      `[SchoolService] getSchoolSettings: No settings found. Creating default settings...`,
    );
    try {
      settings = await prisma.schoolSetting.create({
        data: { schoolId: resolvedId },
      });
      console.log(
        `[SchoolService] getSchoolSettings: Default settings created successfully.`,
      );
    } catch (createError: any) {
      console.error(
        `[SchoolService] getSchoolSettings: FAILED to create settings:`,
        createError,
      );
      throw new Error(
        `Database error while creating school settings: ${createError.message}`,
      );
    }
  } else {
    console.log(
      `[SchoolService] getSchoolSettings: Settings record retrieved.`,
    );
  }

  return settings;
};

export const updateSchoolSettingsService = async (
  schoolId: string,
  data: any,
) => {
  console.log(
    `[SchoolService] updateSchoolSettings: Received update request for schoolId: ${schoolId}`,
  );

  // Resolve the canonical school.id
  const school = await prisma.school.findFirst({
    where: {
      OR: [{ id: schoolId }, { tenantId: schoolId }],
    },
    select: { id: true },
  });

  if (!school) {
    throw new Error(
      `Cannot update settings: school not found for ID "${schoolId}".`,
    );
  }

  const resolvedId = school.id;

  try {
    const updatePayload: any = {};
    if (data.showComingSoon !== undefined)
      updatePayload.showComingSoon = !!data.showComingSoon;
    if (data.themeColor !== undefined)
      updatePayload.themeColor = String(data.themeColor);
    if (data.defaultSession !== undefined)
      updatePayload.defaultSession = data.defaultSession || null;
    if (data.defaultTerm !== undefined)
      updatePayload.defaultTerm = data.defaultTerm || null;
    if (data.enableEmailNotifications !== undefined)
      updatePayload.enableEmailNotifications = !!data.enableEmailNotifications;
    if (data.enablePushNotifications !== undefined)
      updatePayload.enablePushNotifications = !!data.enablePushNotifications;
    if (data.enableMaintenanceMode !== undefined)
      updatePayload.enableMaintenanceMode = !!data.enableMaintenanceMode;
    if (data.allowTeacherDigitalSignature !== undefined)
      updatePayload.allowTeacherDigitalSignature =
        !!data.allowTeacherDigitalSignature;
    if (data.lockSettings !== undefined)
      updatePayload.lockSettings = !!data.lockSettings;

    console.log(
      `[SchoolService] updateSchoolSettings: Payload:`,
      JSON.stringify(updatePayload),
    );

    const updated = await prisma.schoolSetting.update({
      where: { schoolId: resolvedId },
      data: updatePayload,
    });
    console.log(`[SchoolService] updateSchoolSettings: SUCCESS`);
    return updated;
  } catch (updateError: any) {
    console.error(`[SchoolService] updateSchoolSettings: FAILED:`, updateError);
    if (updateError.code === "P2025") {
      throw new Error(
        `Settings record not found to update. Try refreshing the page.`,
      );
    }
    throw new Error(
      `Prisma Error [${updateError.code || "UNKNOWN"}]: ${updateError.message}`,
    );
  }
};

/**
 * Perform a high-level performance analysis for the entire school
 */
export const getSchoolPerformanceAnalysisService = async (
  schoolId: string,
  userId: string,
) => {
  const canonicalId = await resolveSchoolId(schoolId);
  if (!canonicalId) return null;

  const [grades, examAttempts] = await Promise.all([
    prisma.grade.findMany({
      where: { schoolId: canonicalId },
      select: {
        score: true,
        maxMarks: true,
        subject: true,
      },
    }),
    prisma.examAttempt.findMany({
      where: {
        exam: { schoolId: canonicalId },
        status: "SCORED",
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
      insight:
        "No assessment data yet. Add grades and exam scores to see AI-powered insights.",
      letterGrade: "N/A",
      isPremium: false,
    };
  }

  // Calculate weighted average
  let sumPercentage = 0;
  grades.forEach((g) => {
    const gMax = g.maxMarks || 100;
    sumPercentage += ((g.score || 0) / gMax) * 100;
  });
  examAttempts.forEach((e) => {
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

  const strongestSubject = [...subjectBreakdown].sort(
    (a, b) => b.average - a.average,
  )[0];

  let insight = `The institution is maintaining a solid ${letterGrade} standing with an average mastery of ${averageScore}%. `;
  if (strongestSubject) {
    insight += `Academic excellence is most prominent in ${strongestSubject.name}. `;
  }
  if (averageScore < 60) {
    insight +=
      "AI suggests immediate faculty review of current assessment methodologies to boost performance metrics.";
  } else {
    insight +=
      "Current trajectory indicates consistent academic growth across all departments.";
  }

  // if (!hasAiAccess) {
  //   // Access already verified by requireFeatureAccess middleware — this block is intentionally disabled.
  //   // insight = "Unlock premium AI-driven institutional insights...";
  // }

  return {
    averageScore,
    totalAssessments,
    subjectBreakdown,
    insight,
    letterGrade,
    isPremium: false,
  };
};

/**
 * Fetch a summary of recent institutional activity for the Admin Dashboard
 */
export const getDashboardRecentActivityService = async (schoolId: string) => {
  const resolvedId = await resolveSchoolId(schoolId);
  if (!resolvedId)
    return {
      recentExams: [],
      unassignedCount: 0,
      unassignedTeachers: [],
      classesSummary: [],
    };

  const [recentExams, unassignedTeachers, classes] = await Promise.all([
    // 1. Fetch 5 most recent exams
    prisma.exam.findMany({
      where: { schoolId: resolvedId },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        class: true,
        teacher: true,
      },
    }),

    // 2. Find teachers not linked to any class (simplified logic)
    prisma.teacher.findMany({
      where: {
        OR: [{ primarySchoolId: resolvedId }, { activeSchoolId: resolvedId }],
        classTeachers: { none: {} },
      },
      select: { id: true, name: true },
    }),

    // 3. Fetch all classes for context
    prisma.class.findMany({
      where: { schoolId: resolvedId },
      include: {
        _count: {
          select: { enrollments: true, teachers: true },
        },
      },
    }),
  ]);

  return {
    recentExams,
    unassignedCount: unassignedTeachers.length,
    unassignedTeachers: unassignedTeachers.slice(0, 3), // Return a few names
    classesSummary: classes.map((c) => ({
      id: c.id,
      name: c.name,
      studentCount: (c as any)._count.enrollments,
      teacherCount: (c as any)._count.teachers,
    })),
  };
};
/**
 * Fetch consolidated billing data for a school
 */
export const getSchoolBillingService = async (
  schoolId: string,
  page = 1,
  limit = 5,
) => {
  // Resolve school by UUID or tenantId (frontend may pass either)
  const school = await prisma.school.findFirst({
    where: {
      OR: [{ id: schoolId }, { tenantId: schoolId }],
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
    },
  });

  if (!school) {
    throw new Error(
      `School not found for ID: "${schoolId}". Billing data cannot be fetched.`,
    );
  }

  const resolvedId = school.id;
  const skip = (page - 1) * limit;

  // Fetch billing data in parallel now that connection limit is increased
  const [
    stats,
    transactions,
    totalTransactions,
    storageMetric,
    absoluteLatestTransaction,
  ] = await Promise.all([
    getSchoolStatsService(resolvedId),
    prisma.transaction.findMany({
      where: { schoolId: resolvedId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.transaction.count({
      where: { schoolId: resolvedId },
    }),
    prisma.fileMetric.aggregate({
      where: { schoolId: resolvedId },
      _sum: { fileSize: true },
    }),
    prisma.transaction.findFirst({
      where: { schoolId: resolvedId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const subscriptionPlan = school.subscriptionPlanId
    ? await prisma.subscriptionPlan.findUnique({
        where: { id: school.subscriptionPlanId },
      })
    : null;

  const isExpired = school.subscriptionEnd && new Date(school.subscriptionEnd) < new Date();

  return {
    subscription: {
      plan: isExpired ? "FREE" : (
        school.isTrialActive && subscriptionPlan
          ? subscriptionPlan.type
          : school.plan
      ),
      planId: school.planId,
      subscriptionStatus: school.isTrialActive
        ? "TRIAL"
        : (isExpired ? "EXPIRED" : school.subscriptionStatus),
      subscriptionEnd: school.subscriptionEnd,
      isTrialActive: school.isTrialActive,
      lastPaymentDate: school.lastPaymentDate,
      paystackCustomerCode: school.paystackCustomerCode,
      subscriptionPlanId: school.subscriptionPlanId,
      billingCycle:
        school.billingCycle ||
        absoluteLatestTransaction?.billingCycle ||
        "monthly",
      amount: isExpired ? 0 : (
        school.billingCycle === "yearly"
          ? subscriptionPlan?.yearlyPrice || 0
          : subscriptionPlan?.monthlyPrice || 0
      ),
      features: isExpired ? [] : (subscriptionPlan?.features || []),
    },
    usage: {
      ...stats,
      storageBytes: storageMetric._sum.fileSize
        ? Number(storageMetric._sum.fileSize)
        : 0,
    },
    transactions,
    totalTransactions,
  };
};

export const getSchoolLandingPageService = async (schoolId: string) => {
  const resolvedId = await resolveSchoolId(schoolId);
  if (!resolvedId) throw new Error("School not found");

  const landingPage = await prisma.schoolLandingPage.upsert({
    where: { schoolId: resolvedId },
    update: {},
    create: {
      schoolId: resolvedId,
    },
  });

  return landingPage;
};

export const getSchoolLandingPageBySubdomainService = async (
  subdomain: string,
) => {
  const school = await prisma.school.findUnique({
    where: { subdomain },
  });
  console.log("subdomain, school", subdomain, school);
  if (!school) return null;

  const landingPage = await prisma.schoolLandingPage.upsert({
    where: { schoolId: school.id },
    update: {},
    create: {
      schoolId: school.id,
    },
  });

  return {
    landingPage,
    schoolName: school.name,
    schoolLogo: school.logo,
    schoolMotto: school.motto,
  };
};

export const updateSchoolLandingPageService = async (
  schoolId: string,
  data: any,
) => {
  const resolvedId = await resolveSchoolId(schoolId);
  if (!resolvedId) throw new Error("School not found");

  const isDraft = data.isDraft === true;

  if (isDraft) {
    // Save only to draftData
    const currentData = await prisma.schoolLandingPage.findUnique({
      where: { schoolId: resolvedId },
    });
    const existingDraft = (currentData?.draftData as any) || {};

    const newDraftData = {
      ...existingDraft,
    };
    if (data.heroTitle !== undefined) newDraftData.heroTitle = data.heroTitle;
    if (data.heroSubtitle !== undefined)
      newDraftData.heroSubtitle = data.heroSubtitle;
    if (data.heroImage !== undefined) newDraftData.heroImage = data.heroImage;
    if (data.aboutTitle !== undefined)
      newDraftData.aboutTitle = data.aboutTitle;
    if (data.aboutText !== undefined) newDraftData.aboutText = data.aboutText;
    if (data.aboutImage !== undefined) newDraftData.aboutImage = data.aboutImage;
    if (data.primaryColor !== undefined)
      newDraftData.primaryColor = data.primaryColor;
    if (data.features !== undefined) newDraftData.features = data.features;
    if (data.testimonials !== undefined)
      newDraftData.testimonials = data.testimonials;
    if (data.gallery !== undefined) newDraftData.gallery = data.gallery;
    if (data.contactInfo !== undefined) newDraftData.contactInfo = data.contactInfo;
    if (data.customPages !== undefined)
      newDraftData.customPages = data.customPages;

    return await prisma.schoolLandingPage.upsert({
      where: { schoolId: resolvedId },
      update: { draftData: newDraftData },
      create: {
        schoolId: resolvedId,
        draftData: newDraftData,
      },
    });
  }

  // Publish mode: Update main fields and clear draftData
  const updateData: any = {};
  if (data.heroTitle !== undefined) updateData.heroTitle = data.heroTitle;
  if (data.heroSubtitle !== undefined)
    updateData.heroSubtitle = data.heroSubtitle;
  if (data.heroImage !== undefined) updateData.heroImage = data.heroImage;
  if (data.aboutTitle !== undefined) updateData.aboutTitle = data.aboutTitle;
  if (data.aboutText !== undefined) updateData.aboutText = data.aboutText;
  if (data.aboutImage !== undefined) updateData.aboutImage = data.aboutImage;
  if (data.primaryColor !== undefined)
    updateData.primaryColor = data.primaryColor;
  if (data.features !== undefined) updateData.features = data.features;
  if (data.testimonials !== undefined)
    updateData.testimonials = data.testimonials;
  if (data.gallery !== undefined) updateData.gallery = data.gallery;
  if (data.contactInfo !== undefined) updateData.contactInfo = data.contactInfo;
  if (data.customPages !== undefined) updateData.customPages = data.customPages;

  updateData.draftData = null; // Clear draft data upon publish

  return await prisma.schoolLandingPage.upsert({
    where: { schoolId: resolvedId },
    update: updateData,
    create: {
      schoolId: resolvedId,
      ...updateData,
    },
  });
};
