import { BaseRepository } from "./BaseRepository";
import { NotificationRecord } from "../types/database";
import { DatabaseService } from "../database/connection";

export class NotificationRepository extends BaseRepository<NotificationRecord> {
  constructor() {
    super("Notifications");
  }

  public async getUnreadCount(userId: string): Promise<number> {
    const results = await DatabaseService.select<{ count: number }>(
      `SELECT COUNT(*) as count FROM Notifications WHERE userId = ? AND isRead = 0 AND deletedAt IS NULL`,
      [userId]
    );
    return results[0]?.count || 0;
  }

  public async markAllAsRead(userId: string): Promise<void> {
    const now = new Date().toISOString();
    await DatabaseService.execute(
      `UPDATE Notifications SET isRead = 1, syncStatus = 'PENDING_UPDATE', updatedAt = ? WHERE userId = ? AND isRead = 0 AND deletedAt IS NULL`,
      [now, userId]
    );
  }
}
