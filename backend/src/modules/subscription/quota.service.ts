import prisma from "../../config/database";
import { PLAN_LIMITS, DEFAULT_PLAN } from "./plan.constants";

/**
 * Fetches real-time usage stats for a school and compares them against plan limits.
 * @param schoolId The UUID of the school
 */
export const getSchoolUsageService = async (schoolId: string) => {
  // 1. Fetch the school base data
  const school = await prisma.school.findFirst({
    where: { 
      OR: [
        { id: schoolId },
        { tenantId: schoolId }
      ]
    }
  });

  if (!school) {
    throw new Error(`School not found for ID: ${schoolId}`);
  }

  // 2. Resolve the full Subscription Plan details manually to bypass relation sync issues
  let subscriptionPlan = null;
  const activePlanId = (school as any).subscriptionPlanId || (school as any).planId;
  
  if (activePlanId) {
    try {
      subscriptionPlan = await (prisma as any).subscriptionPlan.findUnique({
        where: { id: activePlanId },
        include: {
          featureAccess: {
            include: {
              feature: true
            }
          }
        }
      });
    } catch (e) {
      console.warn("[QuotaService] Failed to fetch subscriptionPlan by ID:", activePlanId, e);
    }
  }

  // 3. Resolve limits and descriptive plan name
  const planName = subscriptionPlan?.name || (school.plan || DEFAULT_PLAN).toUpperCase();
  const baseLimits = subscriptionPlan 
    ? {
        maxStudents: subscriptionPlan.maxStudents,
        maxExams: subscriptionPlan.maxExams,
        maxClasses: subscriptionPlan.maxClasses,
        maxTeachers: subscriptionPlan.maxTeachers,
        maxStorageGb: subscriptionPlan.maxStorageGb,
        maxAiUsage: subscriptionPlan.maxAiUsage,
      }
    : (PLAN_LIMITS[planName.toUpperCase()] || PLAN_LIMITS[DEFAULT_PLAN]);

  const limits = {
    students: (school as any).maxStudentsOverride ?? baseLimits.maxStudents,
    exams: (school as any).maxExamsOverride ?? baseLimits.maxExams,
    classes: (school as any).maxClassesOverride ?? baseLimits.maxClasses,
    teachers: (school as any).maxTeachersOverride ?? baseLimits.maxTeachers,
    storageGb: (school as any).maxStorageGbOverride ?? baseLimits.maxStorageGb,
    aiUsage: (school as any).maxAiUsageOverride ?? baseLimits.maxAiUsage,
  };

  // 4. Resolve Feature-Specific Access and Limits
  const planFeatures = subscriptionPlan?.featureAccess?.filter((fa: any) => fa.enabled).map((fa: any) => ({
    name: fa.feature.name,
    label: fa.feature.label,
    enabled: fa.enabled,
    limit: fa.limitValue,
    isUnlimited: fa.enabled && (fa.limitValue === null || fa.limitValue === undefined || fa.limitValue <= 0)
  })) || [];

  // 3. Fetch robust real-time usage stats (Aligning with school.service.ts)
  const [studentLinks, studentEnrollments, teacherLinks, examCount, classCount, storageMetric] = await Promise.all([
    // A. Student Links
    prisma.relationshipLink.findMany({
      where: {
        linkType: "SCHOOL_STUDENT",
        status: "ACTIVE",
        OR: [{ leftEntityId: school.id }, { rightEntityId: school.id }],
      },
      select: { leftEntityType: true, leftEntityId: true, rightEntityId: true }
    }),
    // B. Student Enrollments
    prisma.classEnrollment.findMany({
      where: { class: { schoolId: school.id } },
      select: { studentId: true }
    }),
    // C. Teacher Links
    prisma.relationshipLink.findMany({
      where: {
        linkType: "SCHOOL_TEACHER",
        status: "ACTIVE",
        OR: [{ leftEntityId: school.id }, { rightEntityId: school.id }],
      },
      select: { leftEntityType: true, leftEntityId: true, rightEntityId: true }
    }),
    // D. Direct counts
    prisma.exam.count({ where: { schoolId: school.id } }),
    prisma.class.count({ where: { schoolId: school.id } }),
    prisma.fileMetric.aggregate({
      where: { schoolId: school.id },
      _sum: { fileSize: true },
    }),
  ]);

  // Robust Student Count
  const linkedStudentIds = studentLinks.map(l => l.leftEntityType === "STUDENT" ? l.leftEntityId : l.rightEntityId);
  const enrolledStudentIds = studentEnrollments.map(e => e.studentId);
  const studentCount = await prisma.student.count({
    where: {
      OR: [
        { id: { in: [...new Set([...linkedStudentIds, ...enrolledStudentIds])] } },
        { schoolId: school.id },
        { originalSchoolId: school.id }
      ]
    }
  });

  // Robust Teacher Count
  const linkedTeacherIds = teacherLinks.map(l => l.leftEntityType === "TEACHER" ? l.leftEntityId : l.rightEntityId);
  const teacherCount = await prisma.teacher.count({
    where: {
      OR: [
        { id: { in: linkedTeacherIds } },
        { primarySchoolId: school.id },
        { activeSchoolId: school.id }
      ]
    }
  });

  const storageBytes = Number(storageMetric._sum.fileSize || 0);
  const storageGb = Number((storageBytes / (1024 * 1024 * 1024)).toFixed(3));

  const usage = {
    students: studentCount,
    exams: examCount,
    classes: classCount,
    teachers: teacherCount,
    storageGb,
    aiUsage: 0, // Placeholder for AI usage tracking
  };

  // 4. Calculate percentages
  const percentages = {
    students: Math.min(Math.round((usage.students / limits.students) * 100), 100),
    exams: Math.min(Math.round((usage.exams / limits.exams) * 100), 100),
    classes: Math.min(Math.round((usage.classes / limits.classes) * 100), 100),
    teachers: Math.min(Math.round((usage.teachers / limits.teachers) * 100), 100),
    storage: Math.min(Math.round((usage.storageGb / limits.storageGb) * 100), 100),
    aiUsage: Math.min(Math.round((usage.aiUsage / limits.aiUsage) * 100), 100),
  };

  return {
    planName,
    subscriptionStatus: school.subscriptionStatus,
    limits,
    usage,
    percentages,
    planFeatures,
    isTrial: school.isTrialActive,
  };

};

/**
 * Fetches real-time usage stats for an individual user based on their role.
 */
export const getUserUsageService = async (userId: string, role: string) => {
  // 1. Fetch user by role and ID
  let user: any = null;
  if (!role) {
    throw new Error(`Role is required for getUserUsageService. User ID: ${userId}`);
  }
  const roleKey = role.toLowerCase();
  const prismaModel = (prisma as any)[roleKey];
  
  if (prismaModel) {
    user = await prismaModel.findUnique({ where: { id: userId } });
  }

  if (!user) {
    throw new Error(`User not found for ID: ${userId} with role: ${role}`);
  }

  // 2. Resolve Subscription Plan details manually
  let subscriptionPlan = null;
  const activePlanId = (user as any).subscriptionPlanId || (user as any).planId;
  
  if (activePlanId) {
    try {
      subscriptionPlan = await (prisma as any).subscriptionPlan.findUnique({
        where: { id: activePlanId },
        include: {
          featureAccess: {
            include: {
              feature: true
            }
          }
        }
      });
    } catch (e) {
      console.warn("[QuotaService] Failed to fetch user subscriptionPlan:", e);
    }
  }

  // 3. Resolve limits and descriptive plan name
  const planName = subscriptionPlan?.name || (user.plan || DEFAULT_PLAN).toUpperCase();
  const baseLimits = subscriptionPlan 
    ? {
        maxStudents: subscriptionPlan.maxStudents,
        maxExams: subscriptionPlan.maxExams,
        maxClasses: subscriptionPlan.maxClasses,
        maxTeachers: subscriptionPlan.maxTeachers,
        maxStorageGb: subscriptionPlan.maxStorageGb,
        maxAiUsage: subscriptionPlan.maxAiUsage,
      }
    : (PLAN_LIMITS[planName.toUpperCase()] || PLAN_LIMITS[DEFAULT_PLAN]);

  const limits = {
    students: (user as any).maxStudentsOverride ?? baseLimits.maxStudents,
    exams: (user as any).maxExamsOverride ?? baseLimits.maxExams,
    classes: (user as any).maxClassesOverride ?? baseLimits.maxClasses,
    teachers: (user as any).maxTeachersOverride ?? baseLimits.maxTeachers,
    storageGb: (user as any).maxStorageGbOverride ?? baseLimits.maxStorageGb,
    aiUsage: (user as any).maxAiUsageOverride ?? baseLimits.maxAiUsage,
  };

  // 4. Resolve Feature-Specific Access (Metrics vs Chips)
  const planFeatures = subscriptionPlan?.featureAccess?.filter((fa: any) => fa.enabled).map((fa: any) => ({
    name: fa.feature.name,
    label: fa.feature.label,
    enabled: fa.enabled,
    limit: fa.limitValue,
    isUnlimited: fa.enabled && (fa.limitValue === null || fa.limitValue === undefined || fa.limitValue <= 0)
  })) || [];

  // 5. Fetch Role-Specific Usage
  let usage = {
    students: 0,
    exams: 0,
    classes: 0,
    teachers: 0,
    storageGb: 0,
    aiUsage: 0,
  };

  // Metric Calculation Logic per Role
  // For parents, exams usage = total attempts by all their linked children
  let parentChildIds: string[] = [];
  if (role === 'PARENT') {
    const links = await (prisma as any).parentChildLink?.findMany({
      where: { parentId: userId },
      select: { studentId: true }
    }) || [];
    parentChildIds = links.map((l: any) => l.studentId);
  }

  const [examCount, classCount, storageMetric, studentCount] = await Promise.all([
    role === 'TEACHER' 
      ? prisma.exam.count({ where: { teacherId: userId } }) 
      : role === 'STUDENT' 
        ? prisma.examAttempt.count({ where: { studentId: userId } })
        : role === 'PARENT'
          ? prisma.examAttempt.count({ where: { studentId: { in: parentChildIds } } })
          : Promise.resolve(0),
    role === 'TEACHER' 
      ? prisma.classTeacher.count({ where: { teacherId: userId } }) 
      : role === 'STUDENT' 
        ? prisma.classEnrollment.count({ where: { studentId: userId } })
        : Promise.resolve(0),
    prisma.fileMetric.aggregate({
      where: roleKey === 'teacher' ? { teacherId: userId } : roleKey === 'student' ? { studentId: userId } : { parentId: userId },
      _sum: { fileSize: true },
    }),
    role === 'PARENT'
      ? ((prisma as any).parentChildLink?.count({ where: { parentId: userId } }) || Promise.resolve(0))
      : Promise.resolve(0)
  ]);

  const storageBytes = Number(storageMetric._sum.fileSize || 0);
  usage.exams = examCount;
  usage.classes = classCount;
  usage.students = studentCount;
  usage.storageGb = Number((storageBytes / (1024 * 1024 * 1024)).toFixed(3));

  // 6. Calculate percentages
  const percentages = {
    students: Math.min(Math.round((usage.students / (limits.students || 1)) * 100), 100),
    exams: Math.min(Math.round((usage.exams / (limits.exams || 1)) * 100), 100),
    classes: Math.min(Math.round((usage.classes / (limits.classes || 1)) * 100), 100),
    teachers: Math.min(Math.round((usage.teachers / (limits.teachers || 1)) * 100), 100),
    storage: Math.min(Math.round((usage.storageGb / (limits.storageGb || 1)) * 100), 100),
    aiUsage: Math.min(Math.round((usage.aiUsage / (limits.aiUsage || 1)) * 100), 100),
  };

  return {
    planName,
    subscriptionStatus: user.subscriptionStatus,
    limits,
    usage,
    percentages,
    planFeatures,
    isTrial: user.isTrialActive,
  };
};
