import prisma from "../../config/database";
import { EntitlementService } from "./entitlement.service";
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
  try {
    await EntitlementService.validateSchoolQuota(schoolId, "students", 1);
  } catch (error: any) {
    // If it throws, it means limit reached. 
    // Legacy behavior: trigger notifications
    await triggerQuotaNotifications(schoolId, "Student", 100);
    throw error;
  }
};

export const enforceExamLimit = async (schoolId: string) => {
  try {
    await EntitlementService.validateSchoolQuota(schoolId, "exams", 1);
  } catch (error: any) {
    await triggerQuotaNotifications(schoolId, "Exam", 100);
    throw error;
  }
};

export const enforceClassLimit = async (schoolId: string) => {
  try {
    await EntitlementService.validateSchoolQuota(schoolId, "classes", 1);
  } catch (error: any) {
    await triggerQuotaNotifications(schoolId, "Class", 100);
    throw error;
  }
};

export const enforceStorageLimit = async (schoolId: string, newFileSize: number) => {
  const newFileSizeGb = newFileSize / (1024 * 1024 * 1024);
  try {
    await EntitlementService.validateSchoolQuota(schoolId, "storageGb", newFileSizeGb);
  } catch (error: any) {
    await triggerQuotaNotifications(schoolId, "Storage", 100);
    throw error;
  }
};
