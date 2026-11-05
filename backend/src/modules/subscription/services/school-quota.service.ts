import prisma, { withRetry } from "../../../config/database";
import { PLAN_LIMITS, DEFAULT_PLAN } from "../plan.constants";
import {
  getActiveSchoolStudentFilter,
  getActiveSchoolTeacherFilter,
} from "../../school/services/school-members.service";

interface PlanFeatureAccessItem {
  enabled: boolean;
  limitValue: number | null;
  feature: {
    name: string;
    featureKey?: string;
    tag?: string;
    label: string;
  };
}

interface SubscriptionPlanRecord {
  id: string;
  name: string;
  maxStudents: number;
  maxExams: number;
  maxClasses: number;
  maxTeachers: number;
  maxStorageGb: number;
  maxAiUsage: number;
  featureAccess?: PlanFeatureAccessItem[];
}

/**
 * Fetches real-time usage stats for a school and compares them against plan limits.
 * @param schoolId The UUID or tenantId of the school
 */
export const getSchoolUsageService = async (schoolId: string) => {
  const school = await withRetry(
    () =>
      prisma.school.findFirst({
        where: {
          OR: [{ id: schoolId }, { tenantId: schoolId }],
        },
      }),
    "quota.getSchoolUsageService.findSchool",
  );

  if (!school) {
    throw new Error(`School not found for ID: ${schoolId}`);
  }

  let subscriptionPlan: SubscriptionPlanRecord | null = null;
  const activePlanId = school.subscriptionPlanId || school.planId;
  if (activePlanId) {
    try {
      subscriptionPlan = (await withRetry(
        () =>
          prisma.subscriptionPlan.findUnique({
            where: { id: activePlanId },
            include: {
              featureAccess: {
                include: {
                  feature: true,
                },
              },
            },
          }),
        "quota.getSchoolUsageService.findPlan",
      )) as unknown as SubscriptionPlanRecord | null;
    } catch (e) {
      console.warn(
        "[QuotaService] Failed to fetch subscriptionPlan by ID:",
        activePlanId,
        e,
      );
    }
  }

  const isExpired =
    school.subscriptionEnd && new Date(school.subscriptionEnd) < new Date();

  const planName = isExpired
    ? DEFAULT_PLAN.toUpperCase()
    : subscriptionPlan?.name || (school.plan || DEFAULT_PLAN).toUpperCase();
  const baseLimits =
    !isExpired && subscriptionPlan
      ? {
        maxStudents: subscriptionPlan.maxStudents,
        maxExams: subscriptionPlan.maxExams,
        maxClasses: subscriptionPlan.maxClasses,
        maxTeachers: subscriptionPlan.maxTeachers,
        maxStorageGb: subscriptionPlan.maxStorageGb,
        maxAiUsage: subscriptionPlan.maxAiUsage,
      }
      : PLAN_LIMITS[planName.toUpperCase()] || PLAN_LIMITS[DEFAULT_PLAN];

  const limits = {
    students:
      (isExpired ? undefined : school.maxStudentsOverride) ??
      baseLimits.maxStudents,
    exams:
      (isExpired ? undefined : school.maxExamsOverride) ?? baseLimits.maxExams,
    classes:
      (isExpired ? undefined : school.maxClassesOverride) ??
      baseLimits.maxClasses,
    teachers:
      (isExpired ? undefined : school.maxTeachersOverride) ??
      baseLimits.maxTeachers,
    storageGb:
      (isExpired ? undefined : school.maxStorageGbOverride) ??
      baseLimits.maxStorageGb,
    aiUsage:
      (isExpired ? undefined : school.maxAiUsageOverride) ??
      baseLimits.maxAiUsage,
  };

  const planFeatures = isExpired
    ? []
    : subscriptionPlan?.featureAccess
      ?.filter((fa) => fa.enabled)
      .map((fa) => ({
        name: fa.feature.name,
        tag: fa.feature.featureKey || fa.feature.tag,
        label: fa.feature.label,
        enabled: fa.enabled,
        limit: fa.limitValue,
        isUnlimited:
          fa.enabled &&
          (fa.limitValue === null ||
            fa.limitValue === undefined ||
            fa.limitValue <= 0),
        usageCount: 0,
      })) || [];

  const [
    studentWhere,
    teacherWhere,
    examCount,
    classCount,
    storageMetric,
    adminCount,
    schoolAdminsList,
  ] = await Promise.all([
    getActiveSchoolStudentFilter(school.id),
    getActiveSchoolTeacherFilter(school.id),
    withRetry(
      () => prisma.exam.count({ where: { schoolId: school.id } }),
      "quota.school.examCount",
    ),
    withRetry(
      () => prisma.class.count({ where: { schoolId: school.id } }),
      "quota.school.classCount",
    ),
    withRetry(
      () =>
        prisma.fileMetric.aggregate({
          where: { schoolId: school.id },
          _sum: { fileSize: true },
        }),
      "quota.school.storage",
    ),
    withRetry(
      () =>
        prisma.schoolAdmin.count({
          where: { schoolId: school.id, active: true },
        }),
      "quota.school.adminCount",
    ),
    withRetry(
      () =>
        prisma.schoolAdmin.findMany({
          where: { schoolId: school.id, active: true },
          select: { adminId: true },
        }),
      "quota.school.adminsList",
    ),
  ]);

  const [schoolTeachersList, schoolStudentsList] = await Promise.all([
    withRetry(
      () =>
        prisma.teacher.findMany({
          where: teacherWhere,
          select: { id: true },
        }),
      "quota.school.teachersList",
    ),
    withRetry(
      () =>
        prisma.student.findMany({
          where: studentWhere,
          select: { id: true },
        }),
      "quota.school.studentsList",
    ),
  ]);

  const studentCount = schoolStudentsList.length;
  const teacherCount = schoolTeachersList.length;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const schoolUserIds = [
    ...schoolAdminsList.map((a) => a.adminId),
    ...schoolTeachersList.map((t) => t.id),
    ...schoolStudentsList.map((s) => s.id),
  ];

  const aiUsageCount =
    schoolUserIds.length > 0
      ? await withRetry(
        () =>
          prisma.aiUsageLog.count({
            where: {
              userId: { in: schoolUserIds },
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
          }),
        "quota.school.aiUsageCount",
      )
      : 0;

  const storageBytes = Number(storageMetric._sum.fileSize || 0);
  const storageGb = Number((storageBytes / (1024 * 1024 * 1024)).toFixed(3));

  const usage = {
    students: studentCount,
    exams: examCount,
    classes: classCount,
    teachers: teacherCount,
    storageGb,
    aiUsage: aiUsageCount,
  };

  const percentages = {
    students: Math.min(
      Math.round((usage.students / (limits.students || 1)) * 100),
      100,
    ),
    exams: Math.min(
      Math.round((usage.exams / (limits.exams || 1)) * 100),
      100,
    ),
    classes: Math.min(
      Math.round((usage.classes / (limits.classes || 1)) * 100),
      100,
    ),
    teachers: Math.min(
      Math.round((usage.teachers / (limits.teachers || 1)) * 100),
      100,
    ),
    storage: Math.min(
      Math.round((usage.storageGb / (limits.storageGb || 1)) * 100),
      100,
    ),
    aiUsage: Math.min(
      Math.round((usage.aiUsage / (limits.aiUsage || 1)) * 100),
      100,
    ),
  };

  planFeatures.forEach((pf) => {
    if (pf.tag === "linkingHub") {
      pf.usageCount = Math.max(0, adminCount - 1);
    }
  });

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

