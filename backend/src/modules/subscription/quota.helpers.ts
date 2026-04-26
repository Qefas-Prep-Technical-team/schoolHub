import prisma from "../../config/database";
import { getSchoolUsageService } from "./quota.service";
import { createNotification } from "../notification/notification.service";

/**
 * Triggers notifications for school admins when usage hits critical levels.
 */
const triggerQuotaNotifications = async (schoolId: string, metric: string, percentage: number) => {
  const schoolAdmins = await prisma.schoolAdmin.findMany({
    where: { schoolId, active: true },
    select: { adminId: true }
  });

  if (schoolAdmins.length === 0) return;

  const title = percentage >= 100 ? `Critical: ${metric} Limit Reached` : `Notice: ${metric} Usage Running Low`;
  const message = percentage >= 100 
    ? `Your school has reached 100% of its ${metric.toLowerCase()} capacity. Capacity enforcement is now active.`
    : `Notice: Your school has reached ${percentage}% of its ${metric.toLowerCase()} capacity. Consider upgrading soon.`;

  await Promise.all(
    schoolAdmins.map(admin => 
      createNotification({
        recipientType: "ADMIN",
        recipientId: admin.adminId,
        type: "GENERAL",
        title,
        message,
        link: "/dashboard/admin/billing"
      }).catch(err => console.error(`[Quota Help] Failed to notify admin ${admin.adminId}:`, err))
    )
  );
};

export const enforceStudentLimit = async (schoolId: string) => {
  const { usage, limits, percentages } = await getSchoolUsageService(schoolId);
  
  if (percentages.students >= 80 && percentages.students < 100) {
    await triggerQuotaNotifications(schoolId, "Student", 80);
  }

  if (usage.students >= limits.students) {
    await triggerQuotaNotifications(schoolId, "Student", 100);
    throw new Error(`Student capacity reached (${limits.students}) for your current subscription plan. Please upgrade to add more students.`);
  }
};

export const enforceExamLimit = async (schoolId: string) => {
  const { usage, limits, percentages } = await getSchoolUsageService(schoolId);

  if (percentages.exams >= 80 && percentages.exams < 100) {
    await triggerQuotaNotifications(schoolId, "Exam", 80);
  }

  if (usage.exams >= limits.exams) {
    await triggerQuotaNotifications(schoolId, "Exam", 100);
    throw new Error(`Exam limit reached (${limits.exams}) for your current subscription plan. Please upgrade to create more exams.`);
  }
};

export const enforceClassLimit = async (schoolId: string) => {
  const { usage, limits, percentages } = await getSchoolUsageService(schoolId);

  if (percentages.classes >= 80 && percentages.classes < 100) {
    await triggerQuotaNotifications(schoolId, "Class", 80);
  }

  if (usage.classes >= limits.classes) {
    await triggerQuotaNotifications(schoolId, "Class", 100);
    throw new Error(`Class limit reached (${limits.classes}) for your current subscription plan. Please upgrade to manage more classes.`);
  }
};

export const enforceStorageLimit = async (schoolId: string, newFileSize: number) => {
  const { usage, limits } = await getSchoolUsageService(schoolId);
  
  const newUsageGb = usage.storageGb + (newFileSize / (1024 * 1024 * 1024));
  const newPercentage = Math.round((newUsageGb / limits.storageGb) * 100);

  if (newPercentage >= 80 && newPercentage < 100) {
    await triggerQuotaNotifications(schoolId, "Storage", 80);
  }

  if (newUsageGb >= limits.storageGb) {
    await triggerQuotaNotifications(schoolId, "Storage", 100);
    throw new Error(`Cloud storage limit reached (${limits.storageGb}GB) for your current plan. Please upgrade to upload more institutional files.`);
  }
};
