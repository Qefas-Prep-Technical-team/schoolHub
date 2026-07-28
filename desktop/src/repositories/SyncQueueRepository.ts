import { DatabaseService } from "../database/connection";
import { SyncQueueRecord, SyncOperation, SyncStatus } from "../types/database";
import { generateId } from "../utils/id";

export class SyncQueueRepository {
  /**
   * Enqueues a data modification operation to be synchronized with the remote backend API.
   */
  public async enqueue(
    entityName: string,
    entityId: string,
    operation: SyncOperation,
    payload: Record<string, unknown>
  ): Promise<SyncQueueRecord> {
    const id = generateId();
    const now = new Date().toISOString();

    const record: SyncQueueRecord = {
      id,
      entityName,
      entityId,
      operation,
      payload: JSON.stringify(payload),
      attempts: 0,
      lastError: null,
      createdAt: now,
      updatedAt: now,
      syncStatus: SyncStatus.PENDING_UPLOAD,
      deletedAt: null,
    };

    await DatabaseService.execute(
      `INSERT INTO SyncQueue (id, entityName, entityId, operation, payload, attempts, lastError, createdAt, updatedAt, syncStatus, deletedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.id,
        record.entityName,
        record.entityId,
        record.operation,
        record.payload,
        record.attempts,
        record.lastError,
        record.createdAt,
        record.updatedAt,
        record.syncStatus,
        record.deletedAt,
      ]
    );

    return record;
  }

  /**
   * Returns all pending sync queue items ordered by creation time.
   */
  public async getPendingItems(): Promise<SyncQueueRecord[]> {
    return await DatabaseService.select<SyncQueueRecord>(
      `SELECT * FROM SyncQueue WHERE syncStatus = ? AND deletedAt IS NULL ORDER BY createdAt ASC`,
      [SyncStatus.PENDING_UPLOAD]
    );
  }

  /**
   * Updates sync queue item retry attempts and error log upon failure.
   */
  public async markFailed(id: string, error: string, attempts: number): Promise<void> {
    const now = new Date().toISOString();
    await DatabaseService.execute(
      `UPDATE SyncQueue SET lastError = ?, attempts = ?, updatedAt = ?, syncStatus = ? WHERE id = ?`,
      [error, attempts, now, SyncStatus.FAILED, id]
    );
  }

  /**
   * Deletes a sync queue record after successful remote API confirmation.
   */
  public async remove(id: string): Promise<void> {
    await DatabaseService.execute(`DELETE FROM SyncQueue WHERE id = ?`, [id]);
  }

  /**
   * Returns total count of pending sync items.
   */
  public async getPendingCount(): Promise<number> {
    const results = await DatabaseService.select<{ count: number }>(
      `SELECT COUNT(*) as count FROM SyncQueue WHERE syncStatus = ? AND deletedAt IS NULL`,
      [SyncStatus.PENDING_UPLOAD]
    );
    return results[0]?.count || 0;
  }
}
