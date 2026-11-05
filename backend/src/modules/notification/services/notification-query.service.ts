import prisma, { withRetry } from "../../../config/database";
import { Prisma } from "@prisma/client";
import { enrichNotificationsWithSenders } from "./notification-enrich.service";

export interface NotificationQueryUser {
  id: string;
  schoolId?: string;
  userType: string;
}

export interface GetNotificationsQueryParams {
  limit?: number;
  offset?: number;
  isReadParam?: string;
  priority?: string;
}

const buildRecipientConditions = (
  user: NotificationQueryUser,
): Prisma.NotificationWhereInput[] => {
  const conditions: Prisma.NotificationWhereInput[] = [
    { recipientId: user.id },
  ];
  if (user.schoolId && user.userType === "ADMIN") {
    conditions.push({
      recipientType: "SCHOOL",
      recipientId: user.schoolId,
    });
  }
  return conditions;
};

const getTeacherAssignedClassIds = async (
  teacherId: string,
): Promise<Set<string>> => {
  const [classTeacherClasses, classSubjectClasses] = await Promise.all([
    withRetry(
      () =>
        prisma.classTeacher.findMany({
          where: { teacherId },
          select: { classId: true },
        }),
      "notification.getTeacherAssignedClassIds.classTeacher",
    ),
    withRetry(
      () =>
        prisma.classSubject.findMany({
          where: {
            OR: [
              { subject: { teacherId } },
              { subject: { teacherSubjects: { some: { teacherId } } } },
            ],
          },
          select: { classId: true },
        }),
      "notification.getTeacherAssignedClassIds.classSubject",
    ),
  ]);

  return new Set([
    ...classTeacherClasses.map((c) => c.classId),
    ...classSubjectClasses.map((s) => s.classId),
  ]);
};

export const getMyNotificationsService = async (
  user: NotificationQueryUser,
  params: GetNotificationsQueryParams,
) => {
  const limit = Math.min(Math.max(Number(params.limit) || 50, 1), 100);
  const offset = Math.max(Number(params.offset) || 0, 0);
  const statusFilter =
    params.isReadParam === "true"
      ? "READ"
      : params.isReadParam === "false"
        ? "UNREAD"
        : undefined;
  const priorityFilter = params.priority
    ? params.priority.toUpperCase()
    : undefined;

  const recipientConditions = buildRecipientConditions(user);
  const whereClause: Prisma.NotificationWhereInput = {
    OR: recipientConditions,
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  let teacherAssignedClassIds: Set<string> | null = null;
  if (user.userType === "TEACHER") {
    teacherAssignedClassIds = await getTeacherAssignedClassIds(user.id);
  }

  const notifications = await withRetry(
    () =>
      prisma.notification.findMany({
        where: whereClause,
        include: {
          linkRequest: {
            include: {
              requesterStudent: {
                select: { id: true, name: true, studentCode: true },
              },
              requesterTeacher: {
                select: { id: true, name: true, teacherCode: true },
              },
              requesterParent: {
                select: { id: true, fullName: true, parentCode: true },
              },
              requesterSchool: {
                select: { id: true, name: true, schoolCode: true },
              },
              targetStudent: {
                select: { id: true, name: true, studentCode: true },
              },
              targetTeacher: {
                select: { id: true, name: true, teacherCode: true },
              },
              targetParent: {
                select: { id: true, fullName: true, parentCode: true },
              },
              targetSchool: {
                select: { id: true, name: true, schoolCode: true },
              },
              class: { select: { id: true, name: true, classCode: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: teacherAssignedClassIds || priorityFilter ? limit * 2 : limit,
        skip: offset,
      }),
    "notification.getMyNotificationsService.findMany",
  );

  const filteredByClass = teacherAssignedClassIds
    ? notifications.filter((n) => {
      const meta = (n.meta || {}) as Record<string, unknown>;
      const classId =
        (meta.classId as string | undefined) || n.linkRequest?.classId;
      if (classId) {
        return teacherAssignedClassIds!.has(classId);
      }
      return true;
    })
    : notifications;

  const visibleNotifications = (
    priorityFilter
      ? filteredByClass.filter((n) => {
        const meta = (n.meta || {}) as Record<string, unknown>;
        const notifPriority = String(meta.priority || "NORMAL").toUpperCase();
        if (priorityFilter === "HIGH") {
          return notifPriority === "HIGH" || notifPriority === "URGENT";
        }
        return notifPriority === priorityFilter;
      })
      : filteredByClass
  ).slice(0, limit);

  return enrichNotificationsWithSenders(visibleNotifications);
};

export const markNotificationAsReadService = async (
  user: NotificationQueryUser,
  id: string,
) => {
  const recipientConditions = buildRecipientConditions(user);
  return withRetry(
    () =>
      prisma.notification.updateMany({
        where: {
          id,
          OR: recipientConditions,
        },
        data: {
          status: "READ",
          readAt: new Date(),
        },
      }),
    "notification.markNotificationAsReadService",
  );
};

export const markAllNotificationsAsReadService = async (
  user: NotificationQueryUser,
) => {
  const recipientConditions = buildRecipientConditions(user);
  return withRetry(
    () =>
      prisma.notification.updateMany({
        where: {
          OR: recipientConditions,
          status: "UNREAD",
        },
        data: {
          status: "READ",
          readAt: new Date(),
        },
      }),
    "notification.markAllNotificationsAsReadService",
  );
};

export const getUnreadCountService = async (
  user: NotificationQueryUser,
): Promise<number> => {
  const recipientConditions = buildRecipientConditions(user);

  if (user.userType === "TEACHER") {
    const assignedClassIds = await getTeacherAssignedClassIds(user.id);
    const unreadNotifs = await withRetry(
      () =>
        prisma.notification.findMany({
          where: {
            OR: recipientConditions,
            status: "UNREAD",
          },
          include: {
            linkRequest: { select: { classId: true } },
          },
        }),
      "notification.getUnreadCountService.teacher",
    );

    return unreadNotifs.filter((n) => {
      const meta = (n.meta || {}) as Record<string, unknown>;
      const classId =
        (meta.classId as string | undefined) || n.linkRequest?.classId;
      if (classId) {
        return assignedClassIds.has(classId);
      }
      return true;
    }).length;
  }

  return withRetry(
    () =>
      prisma.notification.count({
        where: {
          OR: recipientConditions,
          status: "UNREAD",
        },
      }),
    "notification.getUnreadCountService.count",
  );
};

export const deleteNotificationService = async (
  user: NotificationQueryUser,
  id: string,
): Promise<boolean> => {
  const notification = await withRetry(
    () =>
      prisma.notification.findUnique({
        where: { id },
      }),
    "notification.deleteNotificationService.find",
  );

  const isAuthorizedRecipient =
    notification &&
    (notification.recipientId === user.id ||
      (user.userType === "ADMIN" &&
        user.schoolId &&
        notification.recipientType === "SCHOOL" &&
        notification.recipientId === user.schoolId));

  if (!isAuthorizedRecipient) {
    return false;
  }

  await withRetry(
    () =>
      prisma.notification.delete({
        where: { id },
      }),
    "notification.deleteNotificationService.delete",
  );
  return true;
};
