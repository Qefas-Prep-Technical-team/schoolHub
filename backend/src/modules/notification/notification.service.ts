import prisma from "../../config/database";
import { getIO } from "../../socket";

type CreateNotificationInput = {
  recipientType: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | "SCHOOL";
  recipientId: string;
  senderType?: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | "SCHOOL";
  senderId?: string;
  type: "LINK_REQUEST" | "LINK_ACCEPTED" | "LINK_REJECTED" | "GENERAL";
  title: string;
  message: string;
  linkRequestId?: string;
  link?: string;
  meta?: Record<string, any>;
};

export const createNotification = async (input: CreateNotificationInput) => {
  const notification = await prisma.notification.create({
    data: {
      recipientType: input.recipientType as any,
      recipientId: input.recipientId,
      senderType: input.senderType as any,
      senderId: input.senderId,
      type: input.type as any,
      title: input.title,
      message: input.message,
      link: input.link,
      linkRequestId: input.linkRequestId,
      meta: input.meta,
    },
  });

  const io = getIO();

  io.to(`user:${input.recipientId}`).emit("notification:new", notification);

  return notification;
};