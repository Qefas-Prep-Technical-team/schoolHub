import prisma, { withRetry } from "../../../config/database";

export interface ResolvedSenderIdentity {
  senderId?: string;
  senderType: "ADMIN" | "TEACHER";
  senderName: string;
  senderRole: string;
}

export function formatAdminPosition(role?: string | null): string {
  if (!role) return "School Admin";
  switch (role.toUpperCase()) {
    case "SCHOOL_OWNER":
      return "School Owner";
    case "PRINCIPAL":
      return "Principal";
    case "REGISTRAR":
      return "Registrar";
    case "ACCOUNTANT":
      return "Accountant";
    case "SUPPORT":
      return "Support Admin";
    case "SUPER_ADMIN":
      return "Super Admin";
    default:
      return "School Admin";
  }
}

export async function resolveInitiatorIdentity(params: {
  userId?: string;
  userType?: string;
  schoolId?: string | null;
}): Promise<ResolvedSenderIdentity | null> {
  const { userId, userType, schoolId } = params;
  if (!userId) return null;

  const normalizedType = (userType || "ADMIN").toUpperCase();

  if (normalizedType === "TEACHER") {
    const teacher = await withRetry(
      () =>
        prisma.teacher.findUnique({
          where: { id: userId },
          select: { id: true, name: true },
        }),
      "notification.resolveInitiatorIdentity.teacher",
    );
    if (!teacher) return null;
    return {
      senderId: teacher.id,
      senderType: "TEACHER",
      senderName: teacher.name,
      senderRole: "Teacher",
    };
  }

  const admin = await withRetry(
    () =>
      prisma.admin.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          schoolAdmins: {
            where: {
              active: true,
              ...(schoolId ? { schoolId } : {}),
            },
            select: { role: true, schoolId: true },
            orderBy: { createdAt: "desc" },
          },
        },
      }),
    "notification.resolveInitiatorIdentity.admin",
  );

  if (!admin) return null;

  let roleRecord = admin.schoolAdmins[0];
  if (!roleRecord && schoolId) {
    const fallbackSchoolAdmin = await withRetry(
      () =>
        prisma.schoolAdmin.findFirst({
          where: { adminId: userId, active: true },
          select: { role: true, schoolId: true },
          orderBy: { createdAt: "desc" },
        }),
      "notification.resolveInitiatorIdentity.fallbackSchoolAdmin",
    );
    if (fallbackSchoolAdmin) {
      roleRecord = fallbackSchoolAdmin;
    }
  }

  return {
    senderId: admin.id,
    senderType: "ADMIN",
    senderName: admin.name,
    senderRole: formatAdminPosition(roleRecord?.role),
  };
}

