import { ApiService } from "../services/ApiService";
import { DatabaseService } from "../database/connection";
import { ConflictResolver } from "./ConflictResolver";
import { BaseRecord, SyncStatus } from "../types/database";
import { SyncPullResult } from "../types/sync";

export class PullProcessor {
  private conflictResolver: ConflictResolver;

  constructor(conflictResolver?: ConflictResolver) {
    this.conflictResolver = conflictResolver || new ConflictResolver();
  }

  /**
   * Fetches delta server updates since the last synchronization timestamp and merges them into SQLite.
   */
  public async processPull(): Promise<SyncPullResult> {
    const result: SyncPullResult = {
      fetched: 0,
      updated: 0,
      conflictsResolved: 0,
    };

    try {
      // 1. Get last sync timestamp
      const metaRows = await DatabaseService.select<{ value: string }>(
        `SELECT value FROM Metadata WHERE key = 'last_sync_timestamp' LIMIT 1`
      );
      const lastSyncedAt = metaRows[0]?.value || "";

      // 2. Fetch server changes
      const syncResponse = await ApiService.get<{
        todos?: BaseRecord[];
        notifications?: BaseRecord[];
        messages?: BaseRecord[];
        settings?: BaseRecord[];
        serverTimestamp: string;
      }>(`/sync/pull?since=${encodeURIComponent(lastSyncedAt)}`);

      if (!syncResponse || !syncResponse.data) {
        return result;
      }

      const { data } = syncResponse;
      const tables: Array<{ name: string; records?: BaseRecord[] }> = [
        { name: "Todos", records: data.todos },
        { name: "Notifications", records: data.notifications },
        { name: "Messages", records: data.messages },
        { name: "Settings", records: data.settings },
      ];

      // 3. Merge server changes table by table
      for (const table of tables) {
        if (!table.records || table.records.length === 0) continue;

        for (const remoteRecord of table.records) {
          result.fetched++;

          // Check if record exists locally
          const localRows = await DatabaseService.select<BaseRecord>(
            `SELECT * FROM ${table.name} WHERE id = ? LIMIT 1`,
            [remoteRecord.id]
          );
          const localRecord = localRows[0];

          if (localRecord && localRecord.syncStatus !== SyncStatus.SYNCED) {
            // Conflict detected
            result.conflictsResolved++;
            const resolution = this.conflictResolver.resolve(table.name, localRecord, remoteRecord);
            const winner = resolution.resolvedRecord;

            await this.upsertRecord(table.name, winner);
          } else {
            // No local conflict, directly upsert server record as SYNCED
            await this.upsertRecord(table.name, remoteRecord);
          }
          result.updated++;
        }
      }

      // 4. Update last_sync_timestamp metadata
      const newSyncTimestamp = data.serverTimestamp || new Date().toISOString();
      await DatabaseService.execute(
        `UPDATE Metadata SET value = ?, lastSyncedAt = ?, updatedAt = ? WHERE key = 'last_sync_timestamp'`,
        [newSyncTimestamp, newSyncTimestamp, newSyncTimestamp]
      );
    } catch (error) {
      console.warn("[PullProcessor] Delta pull error or offline server:", error);
    }

    return result;
  }

  private async upsertRecord(tableName: string, record: BaseRecord): Promise<void> {
    const now = new Date().toISOString();
    const syncStatus = SyncStatus.SYNCED;

    const recordToInsert = {
      ...record,
      updatedAt: record.updatedAt || now,
      syncStatus,
    };

    const keys = Object.keys(recordToInsert);
    const placeholders = keys.map(() => "?").join(", ");
    const values = keys.map((k) => (recordToInsert as Record<string, unknown>)[k]);
    const updateClause = keys.map((k) => `${k} = EXCLUDED.${k}`).join(", ");

    const sql = `INSERT INTO ${tableName} (${keys.join(", ")}) VALUES (${placeholders})
                 ON CONFLICT(id) DO UPDATE SET ${updateClause}`;

    await DatabaseService.execute(sql, values);
  }
}
