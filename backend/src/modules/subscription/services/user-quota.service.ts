import prisma, { withRetry } from "../../../config/database";
import { PLAN_LIMITS, DEFAULT_PLAN } from "../plan.constants";

interface UserSubscriptionEntity {
  id: string;
  plan?: string | null;
  planId?: string | null;
  subscriptionPlanId?: string | null;
  subscriptionStatus?: string | null;
  subscriptionEnd?: Date | string | null;
  isTrialActive?: boolean | null;
  maxStudentsOverride?: number | null;
  maxExamsOverride?: number | null;
  maxClassesOverride?: number | null;
  maxTeachersOverride?: number | null;
  maxStorageGbOverride?: number | null;
  maxAiUsageOverride?: number | null;
}

interface UserPlanFeatureAccess {
  enabled: boolean;
  limitValue: number | null;
  feature: {
    name: string;
    label: string;
  };
}

interface UserSubscriptionPlanRecord {
  id: string;
  name: string;
  maxStudents: number;
  maxExams: number;
  maxClasses: number;
  maxTeachers: number;
  maxStorageGb: number;
  maxAiUsage: number;
  featureAccess?: UserPlanFeatureAccess[];
}

/**
 * Fetches real-time usage stats for an individual user based on their role.
 */
export const getUserUsageService = async (userId: string, role: string) => {
  if (!role) {
    throw new Error(
      `Role is required for getUserUsageService. User ID: ${userId}`,
    );
  }
  const roleKey = role.toLowerCase();
  let user: UserSubscriptionEntity | null = null;

  if (roleKey === "teacher") {
    user = await withRetry(
      () => prisma.teacher.findUnique({ where: { id: userId } }),
      "quota.user.teacher",
    );
  } else if (roleKey === "student") {
    user = await withRetry(
      () => prisma.student.findUnique({ where: { id: userId } }),
      "quota.user.student",
    );
  } else if (roleKey === "parent") {
    user = await withRetry(
      () => prisma.parent.findUnique({ where: { id: userId } }),
      "quota.user.parent",
    );
  } else if (roleKey === "admin") {
    user = await withRetry(
      () => prisma.admin.findUnique({ where: { id: userId } }),
      "quota.user.admin",
    );
  }

  if (!user) {
    throw new Error(`User not found for ID: ${userId} with role: ${role}`);
  }

  let subscriptionPlan: UserSubscriptionPlanRecord | null = null;
  const activePlanId = user.subscriptionPlanId || user.planId;

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
        "quota.user.plan",
      )) as unknown as UserSubscriptionPlanRecord | null;
    } catch (e) {
      console.warn("[QuotaService] Failed to fetch user subscriptionPlan:", e);
    }
  }

  const isExpired =
    user.subscriptionEnd && new Date(user.subscriptionEnd) < new Date();

  const planName = isExpired
    ? DEFAULT_PLAN.toUpperCase()
    : subscriptionPlan?.name || (user.plan || DEFAULT_PLAN).toUpperCase();
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
      (isExpired ? undefined : user.maxStudentsOverride) ??
      baseLimits.maxStudents,
    exams:
      (isExpired ? undefined : user.maxExamsOverride) ?? baseLimits.maxExams,
    classes:
      (isExpired ? undefined : user.maxClassesOverride) ?? baseLimits.maxClasses,
    teachers:
      (isExpired ? undefined : user.maxTeachersOverride) ??
      baseLimits.maxTeachers,
    storageGb:
      (isExpired ? undefined : user.maxStorageGbOverride) ??
      baseLimits.maxStorageGb,
    aiUsage:
      (isExpired ? undefined : user.maxAiUsageOverride) ??
      baseLimits.maxAiUsage,
  };

  const planFeatures = isExpired
    ? []
    : subscriptionPlan?.featureAccess
        ?.filter((fa) => fa.enabled)
        .map((fa) => ({
          name: fa.feature.name,
          label: fa.feature.label,
          enabled: fa.enabled,
          limit: fa.limitValue,
          isUnlimited:
            fa.enabled &&
            (fa.limitValue === null ||
              fa.limitValue === undefined ||
              fa.limitValue <= 0),
        })) || [];

  let parentChildIds: string[] = [];
  if (role === "PARENT") {
    const links = await withRetry(
      () =>
        prisma.parentChildLink.findMany({
          where: { parentId: userId },
          select: { studentId: true },
        }),
      "quota.user.parentLinks",
    );
    parentChildIds = links.map((l) => l.studentId);
  }

  const [examCount, classCount, storageMetric, studentCount] =
    await Promise.all([
      role === "TEACHER"
        ? withRetry(
            () => prisma.exam.count({ where: { teacherId: userId } }),
            "quota.user.teacherExams",
          )
        : role === "STUDENT"
          ? withRetry(
              () => prisma.examAttempt.count({ where: { studentId: userId } }),
              "quota.user.studentAttempts",
            )
          : role === "PARENT"
            ? withRetry(
                () =>
                  prisma.examAttempt.count({
                    where: { studentId: { in: parentChildIds } },
                  }),
                "quota.user.parentAttempts",
              )
            : Promise.resolve(0),
      role === "TEACHER"
        ? withRetry(
            () => prisma.classTeacher.count({ where: { teacherId: userId } }),
            "quota.user.teacherClasses",
          )
        : role === "STUDENT"
          ? withRetry(
              () =>
                prisma.classEnrollment.count({ where: { studentId: userId } }),
              "quota.user.studentClasses",
            )
          : Promise.resolve(0),
      withRetry(
        () =>
          prisma.fileMetric.aggregate({
            where:
              roleKey === "teacher"
                ? { teacherId: userId }
                : roleKey === "student"
                  ? { studentId: userId }
                  : { parentId: userId },
            _sum: { fileSize: true },
          }),
        "quota.user.storage",
      ),
      role === "PARENT"
        ? withRetry(
            () => prisma.parentChildLink.count({ where: { parentId: userId } }),
            "quota.user.parentChildrenCount",
          )
        : Promise.resolve(0),
    ]);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const aiUsageCount = await withRetry(
    () =>
      prisma.aiUsageLog.count({
        where: {
          userId,
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),
    "quota.user.aiUsage",
  );

  const storageBytes = Number(storageMetric._sum.fileSize || 0);
  const usage = {
    students: studentCount,
    exams: examCount,
    classes: classCount,
    teachers: 0,
    storageGb: Number((storageBytes / (1024 * 1024 * 1024)).toFixed(3)),
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

