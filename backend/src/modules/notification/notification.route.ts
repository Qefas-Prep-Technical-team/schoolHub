import { Router } from "express";
import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  getUnreadCount,
  deleteNotification,
} from "./notification.controller";
import { authenticateToken } from "../../middleware/authMiddleware";

const router = Router();

router.get("/", authenticateToken, getMyNotifications);
router.get("/unread-count", authenticateToken, getUnreadCount);
router.patch("/read-all", authenticateToken, markAllNotificationsAsRead);
router.patch("/:id/read", authenticateToken, markNotificationAsRead);
router.delete("/:id", authenticateToken, deleteNotification);

export default router;