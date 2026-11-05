import prisma, { withRetry } from "../../../config/database";

export interface RawNotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
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

  for (const n of visibleNotifications) {
    if (n.senderId && n.senderType) {
      if (n.senderType === "STUDENT") studentSenderIds.add(n.senderId);
      else if (n.senderType === "TEACHER") teacherSenderIds.add(n.senderId);
      else if (n.senderType === "PARENT") parentSenderIds.add(n.senderId);
      else if (n.senderType === "ADMIN") adminSenderIds.add(n.senderId);
      else if (n.senderType === "SCHOOL") schoolSenderIds.add(n.senderId);
    }
  }

  const [students, teachers, parents, admins, schools] = await Promise.all([
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
              select: { id: true, name: true },
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
  ]);

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
  admins.forEach((a) =>
    senderNameMap.set(`ADMIN:${a.id}`, { name: a.name, role: "School Admin" }),
  );
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
        senderName = "System";
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

