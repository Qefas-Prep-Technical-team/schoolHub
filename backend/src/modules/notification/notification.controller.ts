import { Request, Response } from "express";
import prisma from "../../config/database";
import { handleError } from "../../utils/error-handler";

export const getMyNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const schoolId = req.user.schoolId;

    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    const isReadParam = req.query.isRead;

    const statusFilter =
      isReadParam === "true"
        ? "READ"
        : isReadParam === "false"
        ? "UNREAD"
        : undefined;

    const recipientConditions: any[] = [{ recipientId: userId }];
    if (schoolId && req.user.userType === "ADMIN") {
      recipientConditions.push({ recipientType: "SCHOOL", recipientId: schoolId });
    }

    const whereClause: any = {
      OR: recipientConditions,
      ...(statusFilter ? { status: statusFilter } : {}),
    };

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      include: {
        linkRequest: {
          include: {
            requesterStudent: { select: { id: true, name: true, studentCode: true } },
            requesterTeacher: { select: { id: true, name: true, teacherCode: true } },
            requesterParent: { select: { id: true, fullName: true, parentCode: true } },
            requesterSchool: { select: { id: true, name: true, schoolCode: true } },
            targetStudent: { select: { id: true, name: true, studentCode: true } },
            targetTeacher: { select: { id: true, name: true, teacherCode: true } },
            targetParent: { select: { id: true, fullName: true, parentCode: true } },
            targetSchool: { select: { id: true, name: true, schoolCode: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    const studentSenderIds = new Set<string>();
    const teacherSenderIds = new Set<string>();
    const parentSenderIds = new Set<string>();
    const adminSenderIds = new Set<string>();
    const schoolSenderIds = new Set<string>();

    for (const n of notifications) {
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
        ? prisma.student.findMany({
            where: { id: { in: Array.from(studentSenderIds) } },
            select: { id: true, name: true },
          })
        : [],
      teacherSenderIds.size > 0
        ? prisma.teacher.findMany({
            where: { id: { in: Array.from(teacherSenderIds) } },
            select: { id: true, name: true },
          })
        : [],
      parentSenderIds.size > 0
        ? prisma.parent.findMany({
            where: { id: { in: Array.from(parentSenderIds) } },
            select: { id: true, fullName: true },
          })
        : [],
      adminSenderIds.size > 0
        ? prisma.admin.findMany({
            where: { id: { in: Array.from(adminSenderIds) } },
            select: { id: true, name: true },
          })
        : [],
      schoolSenderIds.size > 0
        ? prisma.school.findMany({
            where: { id: { in: Array.from(schoolSenderIds) } },
            select: { id: true, name: true },
          })
        : [],
    ]);

    const senderNameMap = new Map<string, { name: string; role: string }>();
    students.forEach((s) => senderNameMap.set(`STUDENT:${s.id}`, { name: s.name, role: "Student" }));
    teachers.forEach((t) => senderNameMap.set(`TEACHER:${t.id}`, { name: t.name, role: "Teacher" }));
    parents.forEach((p) => senderNameMap.set(`PARENT:${p.id}`, { name: p.fullName, role: "Parent" }));
    admins.forEach((a) => senderNameMap.set(`ADMIN:${a.id}`, { name: a.name, role: "School Admin" }));
    schools.forEach((sc) => senderNameMap.set(`SCHOOL:${sc.id}`, { name: sc.name, role: "School" }));

    const enrichedNotifications = notifications.map((n) => {
      const meta = (n.meta || {}) as Record<string, any>;
      let senderName: string | undefined = meta.senderName;
      let senderRole: string | undefined = meta.senderRole;

      // 1. From direct senderId lookup
      if (!senderName && n.senderId && n.senderType) {
        const found = senderNameMap.get(`${n.senderType}:${n.senderId}`);
        if (found) {
          senderName = found.name;
          senderRole = senderRole || found.role;
        }
      }

      // 2. From linkRequest
      if (!senderName && n.linkRequest) {
        const lr = n.linkRequest as any;
        const reqPerson = lr.requesterStudent || lr.requesterTeacher || lr.requesterParent;
        if (reqPerson) {
          senderName = reqPerson.name || reqPerson.fullName;
          senderRole = lr.requesterStudent ? "Student" : lr.requesterTeacher ? "Teacher" : "Parent";
        } else if (lr.requesterSchool) {
          senderName = lr.requesterSchool.name;
          senderRole = "School";
        }
      }

      // 3. From meta entity fields
      if (!senderName) {
        senderName = meta.studentName || meta.teacherName || meta.parentName || meta.adminName || meta.requesterName || meta.authorName;
        if (meta.studentName) senderRole = senderRole || "Student";
        else if (meta.teacherName) senderRole = senderRole || "Teacher";
        else if (meta.parentName) senderRole = senderRole || "Parent";
        else if (meta.adminName) senderRole = senderRole || "School Admin";
      }

      // 4. Pattern matching on message / title
      if (!senderName) {
        const joinMatch = n.message.match(/^(.+?)\s+requested\s+to\s+join/i);
        if (joinMatch && joinMatch[1] && !joinMatch[1].toLowerCase().includes("user")) {
          senderName = joinMatch[1].replace(/^(student|teacher|parent)\s+/i, "").trim();
          senderRole = senderRole || "Student";
        } else {
          const studentPrefix = n.message.match(/^Student\s+([A-Za-z\s'-]+?)\s+(?:in\s+your\s+class|has)/i);
          if (studentPrefix && studentPrefix[1]) {
            senderName = studentPrefix[1].trim();
            senderRole = senderRole || "Student";
          } else {
            const teacherPrefix = n.message.match(/^Teacher\s+([A-Za-z\s'-]+?)\s+(?:has|requested)/i);
            if (teacherPrefix && teacherPrefix[1]) {
              senderName = teacherPrefix[1].trim();
              senderRole = senderRole || "Teacher";
            }
          }
        }
      }

      // 5. Fallback sender role / name
      if (!senderName) {
        if (n.senderType === "STUDENT") { senderName = "Student"; senderRole = "Student"; }
        else if (n.senderType === "TEACHER") { senderName = "Teacher"; senderRole = "Teacher"; }
        else if (n.senderType === "PARENT") { senderName = "Parent"; senderRole = "Parent"; }
        else if (n.senderType === "ADMIN") { senderName = "School Admin"; senderRole = "School Admin"; }
        else if (n.senderType === "SCHOOL" || (n.type as string) === "ANNOUNCEMENT" || meta.type === "ANNOUNCEMENT") { senderName = "School Administration"; senderRole = "School"; }
        else { senderName = "System"; senderRole = "System"; }
      }

      if (!senderRole) {
        senderRole = n.senderType ? String(n.senderType) : ((n.type as string) === "ANNOUNCEMENT" ? "School" : "Alert");
      }

      return {
        ...n,
        senderName,
        senderRole,
        meta: {
          ...meta,
          senderName,
          senderRole,
        },
      };
    });

    return res.status(200).json({
      success: true,
      data: enrichedNotifications,
    });
  } catch (error) {
    return handleError(res, error, "notification.getMyNotifications");
  }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const schoolId = req.user.schoolId;
    const { id } = req.params;

    const recipientConditions: any[] = [{ recipientId: userId }];
    if (schoolId && req.user.userType === "ADMIN") {
      recipientConditions.push({ recipientType: "SCHOOL", recipientId: schoolId });
    }

    await prisma.notification.updateMany({
      where: {
        id: id as string,
        OR: recipientConditions,
      },
      data: {
        status: "READ",
        readAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    return handleError(res, error, "notification.markNotificationAsRead");
  }
};

export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const schoolId = req.user.schoolId;

    const recipientConditions: any[] = [{ recipientId: userId }];
    if (schoolId && req.user.userType === "ADMIN") {
      recipientConditions.push({ recipientType: "SCHOOL", recipientId: schoolId });
    }

    await prisma.notification.updateMany({
      where: {
        OR: recipientConditions,
        status: "UNREAD",
      },
      data: {
        status: "READ",
        readAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    return handleError(res, error, "notification.markAllNotificationsAsRead");
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const schoolId = req.user.schoolId;

    const recipientConditions: any[] = [{ recipientId: userId }];
    if (schoolId && req.user.userType === "ADMIN") {
      recipientConditions.push({ recipientType: "SCHOOL", recipientId: schoolId });
    }

    const count = await prisma.notification.count({
      where: {
        OR: recipientConditions,
        status: "UNREAD",
      },
    });

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    return handleError(res, error, "notification.getUnreadCount");
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if the notification exists and belongs to the user
    const notification = await prisma.notification.findUnique({
      where: { id: id as string },
    });

    if (!notification || notification.recipientId !== userId) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    await prisma.notification.delete({
      where: { id: id as string },
    });

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    return handleError(res, error, "notification.deleteNotification");
  }
};