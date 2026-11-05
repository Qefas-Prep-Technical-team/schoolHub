import { Request, Response } from "express";
import { handleError } from "../../utils/error-handler";
import {
  getMyNotificationsService,
  markNotificationAsReadService,
  markAllNotificationsAsReadService,
  getUnreadCountService,
  deleteNotificationService,
} from "./services/notification-query.service";

export const getMyNotifications = async (req: Request, res: Response) => {
  try {
    const enrichedNotifications = await getMyNotificationsService(
      {
        id: req.user.id,
        schoolId: req.user.schoolId,
        userType: req.user.userType,
      },
      {
        limit: Number(req.query.limit) || 50,
        offset: Number(req.query.offset) || 0,
        isReadParam: req.query.isRead as string | undefined,
        priority: req.query.priority as string | undefined,
      },
    );

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
    const { id } = req.params;
    await markNotificationAsReadService(
      {
        id: req.user.id,
        schoolId: req.user.schoolId,
        userType: req.user.userType,
      },
      id as string,
    );

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    return handleError(res, error, "notification.markNotificationAsRead");
  }
};

export const markAllNotificationsAsRead = async (
  req: Request,
  res: Response,
) => {
  try {
    await markAllNotificationsAsReadService({
      id: req.user.id,
      schoolId: req.user.schoolId,
      userType: req.user.userType,
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
    const count = await getUnreadCountService({
      id: req.user.id,
      schoolId: req.user.schoolId,
      userType: req.user.userType,
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
    const { id } = req.params;
    const deleted = await deleteNotificationService(
      {
        id: req.user.id,
        schoolId: req.user.schoolId,
        userType: req.user.userType,
      },
      id as string,
    );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    return handleError(res, error, "notification.deleteNotification");
  }
};
