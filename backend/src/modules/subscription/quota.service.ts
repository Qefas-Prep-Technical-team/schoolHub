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

  // 2. Resolve limits and descriptive plan name
  const planName = school.subscriptionPlan?.name || (school.plan || DEFAULT_PLAN).toUpperCase();
  const baseLimits = school.subscriptionPlan 
    ? {
        maxStudents: school.subscriptionPlan.maxStudents,
        maxExams: school.subscriptionPlan.maxExams,
        maxClasses: school.subscriptionPlan.maxClasses,
        maxTeachers: school.subscriptionPlan.maxTeachers,
        maxStorageGb: school.subscriptionPlan.maxStorageGb,
      }
    : (PLAN_LIMITS[planName.toUpperCase()] || PLAN_LIMITS[DEFAULT_PLAN]);

  const limits = {
    students: (school as any).maxStudentsOverride ?? baseLimits.maxStudents,
    exams: (school as any).maxExamsOverride ?? baseLimits.maxExams,
    classes: (school as any).maxClassesOverride ?? baseLimits.maxClasses,
    teachers: (school as any).maxTeachersOverride ?? baseLimits.maxTeachers,
    storageGb: (school as any).maxStorageGbOverride ?? baseLimits.maxStorageGb,
  };

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
  };

  // 4. Calculate percentages
  const percentages = {
    students: Math.min(Math.round((usage.students / limits.students) * 100), 100),
    exams: Math.min(Math.round((usage.exams / limits.exams) * 100), 100),
    classes: Math.min(Math.round((usage.classes / limits.classes) * 100), 100),
    teachers: Math.min(Math.round((usage.teachers / limits.teachers) * 100), 100),
    storage: Math.min(Math.round((usage.storageGb / limits.storageGb) * 100), 100),
  };

  return {
    planName,
    subscriptionStatus: school.subscriptionStatus,
    limits,
    usage,
    percentages,
    isTrial: school.isTrialActive,
  };
};
