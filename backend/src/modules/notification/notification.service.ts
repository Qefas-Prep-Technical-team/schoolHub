import prisma from "../../config/database";
import { getIO } from "../../socket";

type CreateNotificationInput = {
  recipientType: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | "SCHOOL";
  recipientId: string;
  senderType?: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | "SCHOOL";
  senderId?: string;
  type: "LINK_REQUEST" | "LINK_ACCEPTED" | "LINK_REJECTED" | "GENERAL" | "ANNOUNCEMENT" | "MESSAGE" | "ACADEMIC";
  title: string;
  message: string;
  linkRequestId?: string;
  link?: string;
  priority?: "NORMAL" | "HIGH" | "URGENT";
  meta?: Record<string, any>;
};

export const createNotification = async (input: CreateNotificationInput) => {
  const io = getIO();

  if (input.recipientType === "SCHOOL") {
    // 1. Find all active school admins
    const schoolAdmins = await prisma.schoolAdmin.findMany({
      where: {
        schoolId: input.recipientId,
        active: true,
      },
      select: { adminId: true },
    });

    if (schoolAdmins.length === 0) {
      console.warn(`No active admins found for school ${input.recipientId}`);
      return null;
    }

    // 2. Create individual notification records for each admin (Fan-out in DB)
    // We use createMany for efficiency if supported, but typically we want the returned objects 
    // or to ensure consistency. Prisma createMany is fine here.
    const notificationData = schoolAdmins.map(sa => ({
      recipientType: "ADMIN" as any,
      recipientId: sa.adminId,
      senderType: input.senderType as any,
      senderId: input.senderId,
      type: ["LINK_REQUEST", "LINK_ACCEPTED", "LINK_REJECTED"].includes(input.type) ? input.type as any : "GENERAL",
      title: input.title,
      message: input.message,
      link: input.link,
      linkRequestId: input.linkRequestId,
      meta: { ...(input.meta || {}), priority: input.priority || "NORMAL" },
    }));

    await prisma.notification.createMany({
      data: notificationData,
    });

    // 3. Emit real-time updates to each individual admin room
    // Note: Since we used createMany, we don't have the individual IDs easily 
    // but the socket message is just to trigger a refresh or show a toast.
    schoolAdmins.forEach((sa) => {
      io.to(`user:${sa.adminId}`).emit("notification:new", {
        ...input,
        status: "UNREAD",
        createdAt: new Date(),
      });
    });

    return { success: true, count: schoolAdmins.length };
  } else {
    // Normal single-recipient flow
    const notification = await prisma.notification.create({
      data: {
        recipientType: input.recipientType as any,
        recipientId: input.recipientId,
        senderType: input.senderType as any,
        senderId: input.senderId,
        type: ["LINK_REQUEST", "LINK_ACCEPTED", "LINK_REJECTED"].includes(input.type) ? input.type as any : "GENERAL",
        title: input.title,
        message: input.message,
        link: input.link,
        linkRequestId: input.linkRequestId,
        meta: { ...(input.meta || {}), priority: input.priority || "NORMAL" },
      },
    });

    io.to(`user:${input.recipientId}`).emit("notification:new", notification);
    return notification;
  }
};

/**
 * Bulk-create single-recipient notifications in ONE database round-trip
 * (createMany), then emit real-time socket events. Use this for fan-out
 * scenarios like class attendance, where N notifications are generated at once.
 * Does not support recipientType "SCHOOL" (use createNotification for that).
 */
export type BulkNotificationInput = Omit<CreateNotificationInput, "recipientType"> & {
  recipientType: Exclude<CreateNotificationInput["recipientType"], "SCHOOL">;
};

export const createNotificationsBulk = async (inputs: BulkNotificationInput[]) => {
  if (inputs.length === 0) return { count: 0 };

  const createdAt = new Date();
  const data = inputs.map((input) => ({
    recipientType: input.recipientType as any,
    recipientId: input.recipientId,
    senderType: input.senderType as any,
    senderId: input.senderId,
    type: ["LINK_REQUEST", "LINK_ACCEPTED", "LINK_REJECTED"].includes(input.type) ? (input.type as any) : "GENERAL",
    title: input.title,
    message: input.message,
    link: input.link,
    linkRequestId: input.linkRequestId,
    meta: { ...(input.meta || {}), priority: input.priority || "NORMAL" },
  }));

  const result = await prisma.notification.createMany({ data });

  const io = getIO();
  for (const n of data) {
    io.to(`user:${n.recipientId}`).emit("notification:new", { ...n, status: "UNREAD", createdAt });
  }

  return { count: result.count };
};