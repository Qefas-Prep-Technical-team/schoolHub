import { SyncQueueRepository } from "../repositories/SyncQueueRepository";
import { SyncOperation } from "../types/database";
import { SyncPushResult } from "../types/sync";
import { ApiService } from "../services/ApiService";
import { DatabaseService } from "../database/connection";

export class PushProcessor {
  private syncQueueRepo: SyncQueueRepository;
  private maxRetries: number;

  constructor(maxRetries = 5) {
    this.syncQueueRepo = new SyncQueueRepository();
    this.maxRetries = maxRetries;
  }

  /**
   * Iterates through pending local modifications and uploads them to the remote backend REST API.
   */
  public async processPush(): Promise<SyncPushResult> {
    const pendingItems = await this.syncQueueRepo.getPendingItems();
    const result: SyncPushResult = {
      successful: 0,
      failed: 0,
      errors: [],
    };

    for (const item of pendingItems) {
      if (item.attempts >= this.maxRetries) {
        continue;
      }

      try {
        const payload = JSON.parse(item.payload);
        const endpoint = `/${item.entityName.toLowerCase()}`;

        if (item.operation === SyncOperation.CREATE) {
          await ApiService.post(endpoint, payload);
        } else if (item.operation === SyncOperation.UPDATE) {
          await ApiService.put(`${endpoint}/${item.entityId}`, payload);
        } else if (item.operation === SyncOperation.DELETE) {
          await ApiService.delete(`${endpoint}/${item.entityId}`);
        }

        // Mark entity as SYNCED in local SQLite table
        const now = new Date().toISOString();
        await DatabaseService.execute(
          `UPDATE ${item.entityName} SET syncStatus = 'SYNCED', updatedAt = ? WHERE id = ?`,
          [now, item.entityId]
        );

        // Remove queue entry
        await this.syncQueueRepo.remove(item.id);
        result.successful++;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const attempts = item.attempts + 1;

        await this.syncQueueRepo.markFailed(item.id, errorMessage, attempts);
        result.failed++;
        result.errors.push({
          entityId: item.entityId,
          error: errorMessage,
        });
      }
    }

    return result;
  }
}
