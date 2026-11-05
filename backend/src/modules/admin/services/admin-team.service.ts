import { AdminRole } from "@prisma/client";
import prisma, { withRetry } from "../../../config/database";
import { AppError } from "../../../utils/app-error";
import {
  sendAdminApprovalEmail,
  sendAdminRejectionEmail,
  sendNewAdminJoinedEmail,
} from "../../auth/auth.service";
import { createNotification } from "../../notification/notification.service";
import { getSchoolUsageService } from "../../subscription/quota.service";

function formatRoleLabel(role: AdminRole): string {
  return role
    .replace(/_/g, " ")
    .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

/**
 * Check an admin's registration status by email.
 * If `isAuthenticatedCaller` is false (public check), sensitive internal IDs
 * and school directory mappings are stripped to prevent unauthenticated enumeration.
 */
export const checkAdminStatusService = async (
  email: string,
  isAuthenticatedCaller: boolean,
) => {
  const admin = await withRetry(() =>
    prisma.admin.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        verified: true,
        createdAt: true,
        schoolAdmins: {
          where: { active: true },
          include: {
            school: { select: { id: true, name: true } },
          },
        },
      },
    }),
  );

  if (!admin) {
    throw new AppError("Admin not found", 404);
  }

  if (!isAuthenticatedCaller) {
    return {
      email: admin.email,
      status: admin.status,
      verified: admin.verified,
      adminRole: admin.schoolAdmins[0]?.role ?? null,
    };
  }

  return {
    ...admin,
    adminRole: admin.schoolAdmins[0]?.role ?? null,
  };
};

/**
 * Get pending admin join requests strictly scoped to `schoolId`.
 */
export const getPendingAdminsService = async (schoolId: string) => {
  if (!schoolId) {
    throw new AppError("Active school association is required", 403);
  }

  const pendingAdmins = await withRetry(() =>
    prisma.schoolAdmin.findMany({
      where: {
        schoolId,
        active: true,
        OR: [{ role: AdminRole.PENDING }, { admin: { status: "PENDING" } }],
      },
      include: {
        admin: {
          select: { id: true, name: true, email: true, createdAt: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  );

  return pendingAdmins
    .filter((m) => m.admin.status === "PENDING" || m.role === AdminRole.PENDING)
    .map((m) => ({
      id: m.admin.id,
      name: m.admin.name,
      email: m.admin.email,
      requestedAt: m.createdAt,
      status: m.admin.status,
    }));
};

/**
 * Approve a pending admin and assign a role within `schoolId`.
 */
export const approveAdminService = async (params: {
  schoolId: string;
  adminId: string;
  role: AdminRole;
}) => {
  const { schoolId, adminId, role } = params;
  if (!schoolId) {
    throw new AppError("Active school association is required", 403);
  }

  const schoolAdmin = await withRetry(() =>
    prisma.schoolAdmin.findFirst({
      where: { adminId, schoolId },
      include: { school: { select: { name: true } } },
    }),
  );

  if (!schoolAdmin) {
    throw new AppError("Admin not found in your school", 404);
  }

  const schoolUsage = await getSchoolUsageService(schoolId);
  const linkingFeature = schoolUsage.planFeatures.find(
    (f: { tag?: string }) => f.tag === "linkingHub",
  );

  if (
    linkingFeature &&
    linkingFeature.enabled &&
    !linkingFeature.isUnlimited &&
    linkingFeature.limit !== null &&
    linkingFeature.usageCount >= linkingFeature.limit
  ) {
    throw new AppError(
      "Approval blocked: Admin slot filled on your current plan. Please upgrade to add more admins.",
      403,
    );
  }

  const [updatedAdmin] = await withRetry(() =>
    prisma.$transaction([
      prisma.admin.update({
        where: { id: adminId },
        data: { status: "APPROVED", verified: true },
        select: { id: true, name: true, email: true, status: true, verified: true },
      }),
      prisma.schoolAdmin.update({
        where: { adminId_schoolId: { adminId, schoolId } },
        data: { role, active: true },
      }),
    ]),
  );

  const frontendUrl = process.env.FRONTEND_URL || "https://qefashub.com";
  const roleLabel = formatRoleLabel(role);

  sendAdminApprovalEmail({
    adminEmail: updatedAdmin.email,
    adminName: updatedAdmin.name,
    schoolName: schoolAdmin.school.name,
    assignedRole: role,
    loginUrl: `${frontendUrl}/login/school-admin`,
  }).catch((e) => console.error("[approveAdmin] Email error:", e));

  createNotification({
    recipientType: "ADMIN",
    recipientId: adminId,
    type: "GENERAL",
    title: "Admin Request Approved",
    message: `Your request to join ${schoolAdmin.school.name} has been approved. You are now a ${roleLabel}.`,
  }).catch((e) => console.error("[approveAdmin] Notification error:", e));

  withRetry(() =>
    prisma.schoolAdmin.findMany({
      where: {
        schoolId,
        active: true,
        adminId: { not: adminId },
      },
      include: {
        admin: { select: { id: true, email: true, name: true } },
      },
    }),
  )
    .then((existingAdmins) => {
      existingAdmins.forEach((ea) => {
        sendNewAdminJoinedEmail({
          recipientEmail: ea.admin.email,
          recipientName: ea.admin.name,
          newAdminName: updatedAdmin.name,
          assignedRole: role,
          schoolName: schoolAdmin.school.name,
        }).catch((e) => console.error("[approveAdmin] Email error:", e));

        createNotification({
          recipientType: "ADMIN",
          recipientId: ea.admin.id,
          type: "GENERAL",
          title: "New Admin Joined",
          message: `${updatedAdmin.name} has joined the admin team as a ${roleLabel}.`,
        }).catch((e) => console.error("[approveAdmin] Notification error:", e));
      });
    })
    .catch((e) => console.error("[approveAdmin] Fetch existing admins error:", e));

  return { ...updatedAdmin, adminRole: role };
};

/**
 * Reject a pending admin request for `schoolId` and deactivate the school link.
 */
export const rejectAdminService = async (params: {
  schoolId: string;
  adminId: string;
  reason?: string;
}) => {
  const { schoolId, adminId, reason } = params;
  if (!schoolId) {
    throw new AppError("Active school association is required", 403);
  }

  const schoolAdmin = await withRetry(() =>
    prisma.schoolAdmin.findFirst({
      where: { adminId, schoolId },
      include: { school: { select: { name: true } } },
    }),
  );

  if (!schoolAdmin) {
    throw new AppError("Admin not found in your school", 404);
  }

  if (schoolAdmin.role === AdminRole.SCHOOL_OWNER) {
    throw new AppError("Cannot reject the school owner", 400);
  }

  const [updatedAdmin] = await withRetry(() =>
    prisma.$transaction([
      prisma.admin.update({
        where: { id: adminId },
        data: { status: "REJECTED" },
        select: { id: true, name: true, email: true, status: true },
      }),
      prisma.schoolAdmin.update({
        where: { adminId_schoolId: { adminId, schoolId } },
        data: { active: false },
      }),
      prisma.refreshToken.updateMany({
        where: { userId: adminId, isValid: true },
        data: { isValid: false },
      }),
    ]),
  );

  sendAdminRejectionEmail({
    adminEmail: updatedAdmin.email,
    adminName: updatedAdmin.name,
    schoolName: schoolAdmin.school.name,
    reason,
  }).catch((e) => console.error("[rejectAdmin] Email error:", e));

  return updatedAdmin;
};
