import prisma, { withRetry } from "../../../config/database";
import { formatAdminPosition } from "./notification-sender.util";

export interface RawNotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  recipientId?: string;
  recipientType?: string;
  senderId?: string | null;
  senderType?: string | null;
  meta?: unknown;
  linkRequest?: {
    classId?: string | null;
    requesterStudent?: { id: string; name: string; studentCode: string } | null;
    requesterTeacher?: { id: string; name: string; teacherCode: string } | null;
    requesterParent?: { id: string; fullName: string; parentCode: string } | null;
    requesterSchool?: { id: string; name: string; schoolCode: string } | null;
  } | null;
  [key: string]: unknown;
}

const ACADEMIC_ADMIN_NOTIFICATION_TITLES = new Set([
  "subject assignment",
  "subject unassigned",
  "class assignment",
  "class unassigned",
  "assigned to class",
  "assigned to new class",
  "students promoted",
  "student promoted",
]);

export const enrichNotificationsWithSenders = async <
  T extends RawNotificationItem,
>(
  visibleNotifications: T[],
) => {
  const studentSenderIds = new Set<string>();
  const teacherSenderIds = new Set<string>();
  const parentSenderIds = new Set<string>();
  const adminSenderIds = new Set<string>();
  const schoolSenderIds = new Set<string>();
  const teacherRecipientsMissingSender = new Set<string>();

  for (const n of visibleNotifications) {
    if (n.senderId && n.senderType) {
      if (n.senderType === "STUDENT") studentSenderIds.add(n.senderId);
      else if (n.senderType === "TEACHER") teacherSenderIds.add(n.senderId);
      else if (n.senderType === "PARENT") parentSenderIds.add(n.senderId);
      else if (n.senderType === "ADMIN") adminSenderIds.add(n.senderId);
      else if (n.senderType === "SCHOOL") schoolSenderIds.add(n.senderId);
    } else if (
      n.recipientId &&
      n.recipientType === "TEACHER" &&
      ACADEMIC_ADMIN_NOTIFICATION_TITLES.has((n.title || "").trim().toLowerCase())
    ) {
      teacherRecipientsMissingSender.add(n.recipientId);
    }
  }

  const [students, teachers, parents, admins, schools, fallbackTeacherSchools] = await Promise.all([
    studentSenderIds.size > 0
      ? withRetry(
        () =>
          prisma.student.findMany({
            where: { id: { in: Array.from(studentSenderIds) } },
            select: { id: true, name: true },
          }),
        "notification.senders.students",
      )
      : [],
    teacherSenderIds.size > 0
      ? withRetry(
        () =>
          prisma.teacher.findMany({
            where: { id: { in: Array.from(teacherSenderIds) } },
            select: { id: true, name: true },
          }),
        "notification.senders.teachers",
      )
      : [],
    parentSenderIds.size > 0
      ? withRetry(
        () =>
          prisma.parent.findMany({
            where: { id: { in: Array.from(parentSenderIds) } },
            select: { id: true, fullName: true },
          }),
        "notification.senders.parents",
      )
      : [],
    adminSenderIds.size > 0
      ? withRetry(
        () =>
          prisma.admin.findMany({
            where: { id: { in: Array.from(adminSenderIds) } },
            select: {
              id: true,
              name: true,
              schoolAdmins: {
                where: { active: true },
                select: { role: true, schoolId: true },
                orderBy: { createdAt: "desc" },
              },
            },
          }),
        "notification.senders.admins",
      )
      : [],
    schoolSenderIds.size > 0
      ? withRetry(
        () =>
          prisma.school.findMany({
            where: { id: { in: Array.from(schoolSenderIds) } },
            select: { id: true, name: true },
          }),
        "notification.senders.schools",
      )
      : [],
    teacherRecipientsMissingSender.size > 0
      ? withRetry(
        () =>
          prisma.teacher.findMany({
            where: { id: { in: Array.from(teacherRecipientsMissingSender) } },
            select: {
              id: true,
              activeSchoolId: true,
              primarySchoolId: true,
              schoolId: true,
            },
          }),
        "notification.senders.fallbackTeacherSchools",
      )
      : [],
  ]);

  const fallbackSchoolIds = new Set<string>();
  const teacherSchoolIdMap = new Map<string, string>();
  for (const t of fallbackTeacherSchools) {
    const resolvedSchoolId = t.activeSchoolId || t.primarySchoolId || t.schoolId;
    if (resolvedSchoolId) {
      fallbackSchoolIds.add(resolvedSchoolId);
      teacherSchoolIdMap.set(t.id, resolvedSchoolId);
    }
  }

  const schoolLeadershipBySchoolId = new Map<string, { name: string; role: string }>();
  if (fallbackSchoolIds.size > 0) {
    const schoolLeadAdmins = await withRetry(
      () =>
        prisma.schoolAdmin.findMany({
          where: {
            schoolId: { in: Array.from(fallbackSchoolIds) },
            active: true,
          },
          include: {
            admin: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "asc" },
        }),
      "notification.senders.schoolLeadership",
    );

    const priorityOrder: Record<string, number> = {
      PRINCIPAL: 1,
      SCHOOL_OWNER: 2,
      REGISTRAR: 3,
      ACCOUNTANT: 4,
      SUPPORT: 5,
    };

    for (const sa of schoolLeadAdmins) {
      const existing = schoolLeadershipBySchoolId.get(sa.schoolId);
      const currentRank = priorityOrder[sa.role] ?? 99;
      if (!existing) {
        schoolLeadershipBySchoolId.set(sa.schoolId, {
          name: sa.admin.name,
          role: formatAdminPosition(sa.role),
        });
      } else {
        const existingRoleEntry = Object.entries(priorityOrder).find(
          ([key]) => formatAdminPosition(key) === existing.role,
        );
        const existingRank = existingRoleEntry ? existingRoleEntry[1] : 99;
        if (currentRank < existingRank) {
          schoolLeadershipBySchoolId.set(sa.schoolId, {
            name: sa.admin.name,
            role: formatAdminPosition(sa.role),
          });
        }
      }
    }
  }

  const senderNameMap = new Map<string, { name: string; role: string }>();
  students.forEach((s) =>
    senderNameMap.set(`STUDENT:${s.id}`, { name: s.name, role: "Student" }),
  );
  teachers.forEach((t) =>
    senderNameMap.set(`TEACHER:${t.id}`, { name: t.name, role: "Teacher" }),
  );
  parents.forEach((p) =>
    senderNameMap.set(`PARENT:${p.id}`, { name: p.fullName, role: "Parent" }),
  );
  admins.forEach((a) => {
    const primaryRole = a.schoolAdmins?.[0]?.role;
    senderNameMap.set(`ADMIN:${a.id}`, {
      name: a.name,
      role: formatAdminPosition(primaryRole),
    });
  });
  schools.forEach((sc) =>
    senderNameMap.set(`SCHOOL:${sc.id}`, { name: sc.name, role: "School" }),
  );

  return visibleNotifications.map((n) => {
    const meta = (n.meta || {}) as Record<string, unknown>;
    let senderName = meta.senderName as string | undefined;
    let senderRole = meta.senderRole as string | undefined;

    if (!senderName && n.senderId && n.senderType) {
      const found = senderNameMap.get(`${n.senderType}:${n.senderId}`);
      if (found) {
        senderName = found.name;
        senderRole = senderRole || found.role;
      }
    }

    if (!senderName && n.linkRequest) {
      const lr = n.linkRequest;
      const reqPerson =
        lr.requesterStudent || lr.requesterTeacher || lr.requesterParent;
      if (reqPerson) {
        senderName =
          "name" in reqPerson ? reqPerson.name : reqPerson.fullName;
        senderRole = lr.requesterStudent
          ? "Student"
          : lr.requesterTeacher
            ? "Teacher"
            : "Parent";
      } else if (lr.requesterSchool) {
        senderName = lr.requesterSchool.name;
        senderRole = "School";
      }
    }

    if (!senderName) {
      senderName = (meta.studentName ||
        meta.teacherName ||
        meta.parentName ||
        meta.adminName ||
        meta.requesterName ||
        meta.authorName) as string | undefined;
      if (meta.studentName) senderRole = senderRole || "Student";
      else if (meta.teacherName) senderRole = senderRole || "Teacher";
      else if (meta.parentName) senderRole = senderRole || "Parent";
      else if (meta.adminName) senderRole = senderRole || "School Admin";
    }

    if (!senderName) {
      const joinMatch = n.message.match(/^(.+?)\s+requested\s+to\s+join/i);
      if (
        joinMatch &&
        joinMatch[1] &&
        !joinMatch[1].toLowerCase().includes("user")
      ) {
        senderName = joinMatch[1]
          .replace(/^(student|teacher|parent)\s+/i, "")
          .trim();
        senderRole = senderRole || "Student";
      } else {
        const studentPrefix = n.message.match(
          /^Student\s+([A-Za-z\s'-]+?)\s+(?:in\s+your\s+class|has)/i,
        );
        if (studentPrefix && studentPrefix[1]) {
          senderName = studentPrefix[1].trim();
          senderRole = senderRole || "Student";
        } else {
          const teacherPrefix = n.message.match(
            /^Teacher\s+([A-Za-z\s'-]+?)\s+(?:has|requested)/i,
          );
          if (teacherPrefix && teacherPrefix[1]) {
            senderName = teacherPrefix[1].trim();
            senderRole = senderRole || "Teacher";
          }
        }
      }
    }

    if (!senderName && n.recipientId && n.recipientType === "TEACHER") {
      const normalizedTitle = (n.title || "").trim().toLowerCase();
      if (ACADEMIC_ADMIN_NOTIFICATION_TITLES.has(normalizedTitle)) {
        const metaSchoolId = meta.schoolId as string | undefined;
        const resolvedSchoolId =
          metaSchoolId || teacherSchoolIdMap.get(n.recipientId);
        if (resolvedSchoolId) {
          const leadAdmin = schoolLeadershipBySchoolId.get(resolvedSchoolId);
          if (leadAdmin) {
            senderName = leadAdmin.name;
            senderRole = senderRole || leadAdmin.role;
          }
        }
      }
    }

    if (!senderName) {
      if (n.senderType === "STUDENT") {
        senderName = "Student";
        senderRole = "Student";
      } else if (n.senderType === "TEACHER") {
        senderName = "Teacher";
        senderRole = "Teacher";
      } else if (n.senderType === "PARENT") {
        senderName = "Parent";
        senderRole = "Parent";
      } else if (n.senderType === "ADMIN") {
        senderName = "School Admin";
        senderRole = "School Admin";
      } else if (
        n.senderType === "SCHOOL" ||
        String(n.type) === "ANNOUNCEMENT" ||
        meta.type === "ANNOUNCEMENT"
      ) {
        senderName = "School Administration";
        senderRole = "School";
      } else {
        senderName = "Qefas Hub";
        senderRole = "System";
      }
    }

    if (!senderRole) {
      senderRole = n.senderType
        ? String(n.senderType)
        : String(n.type) === "ANNOUNCEMENT"
          ? "School"
          : "Alert";
    }

    const priority = String(meta.priority || "NORMAL").toUpperCase();

    return {
      ...n,
      priority,
      senderName,
      senderRole,
      meta: {
        ...meta,
        priority,
        senderName,
        senderRole,
      },
    };
  });
};

