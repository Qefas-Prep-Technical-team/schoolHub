import prisma from "../../config/database";
import { PLAN_LIMITS, DEFAULT_PLAN } from "./plan.constants";

/**
 * Fetches real-time usage stats for a school and compares them against plan limits.
 * @param schoolId The UUID of the school
 */
export const getSchoolUsageService = async (schoolId: string) => {
  // 1. Fetch the school by ID or TenantID
  const school = await prisma.school.findFirst({
    where: { 
      OR: [
        { id: schoolId },
        { tenantId: schoolId }
      ]
    },
    include: {
      subscriptionPlan: true,
    },
  });

  if (!school) {
    throw new Error(`School not found for ID: ${schoolId}`);
  }

  // 2. Resolve limits - normalize to consistent internal names
  const planName = (school.plan || DEFAULT_PLAN).toUpperCase();
  const rawLimits = school.subscriptionPlan 
    ? {
        maxStudents: school.subscriptionPlan.maxStudents,
        maxExams: school.subscriptionPlan.maxExams,
        maxClasses: school.subscriptionPlan.maxClasses,
        maxStorageGb: school.subscriptionPlan.maxStorageGb,
      }
    : (PLAN_LIMITS[planName] || PLAN_LIMITS[DEFAULT_PLAN]);

  const limits = {
    students: rawLimits.maxStudents,
    exams: rawLimits.maxExams,
    classes: rawLimits.maxClasses,
    storageGb: rawLimits.maxStorageGb,
  };

  // 3. Fetch real-time usage stats in parallel using the resolved UUID
  const [studentCount, examCount, classCount, storageMetric] = await Promise.all([
    prisma.student.count({ where: { schoolId: school.id } }),
    prisma.exam.count({ where: { schoolId: school.id } }),
    prisma.class.count({ where: { schoolId: school.id } }),
    prisma.fileMetric.aggregate({
      where: { schoolId: school.id },
      _sum: { fileSize: true },
    }),
  ]);

  const storageBytes = Number(storageMetric._sum.fileSize || 0);
  const storageGb = Number((storageBytes / (1024 * 1024 * 1024)).toFixed(3));

  const usage = {
    students: studentCount,
    exams: examCount,
    classes: classCount,
    storageGb,
  };

  // 4. Calculate percentages
  const percentages = {
    students: Math.min(Math.round((usage.students / limits.students) * 100), 100),
    exams: Math.min(Math.round((usage.exams / limits.exams) * 100), 100),
    classes: Math.min(Math.round((usage.classes / limits.classes) * 100), 100),
    storage: Math.min(Math.round((usage.storageGb / limits.storageGb) * 100), 100),
  };

  return {
    planName,
    limits,
    usage,
    percentages,
    isTrial: school.isTrialActive,
  };
};
