import { Router } from "express";
import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  getUnreadCount,
} from "./notification.controller";
import { authenticateToken } from "../../middleware/authMiddleware";

const router = Router();

router.get("/", authenticateToken, getMyNotifications);
router.get("/unread-count", authenticateToken, getUnreadCount);
router.patch("/:id/read", authenticateToken, markNotificationAsRead);
router.patch("/read-all", authenticateToken, markAllNotificationsAsRead);

export default router;