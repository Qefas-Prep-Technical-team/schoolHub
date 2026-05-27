import { Request, Response } from "express";
import prisma from "../../config/database";
import { handleError } from "../../utils/error-handler";

export const getMyNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    const notifications = await prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    return handleError(res, error, "notification.getMyNotifications");
  }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await prisma.notification.updateMany({
      where: {
        id: id as string,
        recipientId: userId,
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

    await prisma.notification.updateMany({
      where: {
        recipientId: userId,
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

    const count = await prisma.notification.count({
      where: {
        recipientId: userId,
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