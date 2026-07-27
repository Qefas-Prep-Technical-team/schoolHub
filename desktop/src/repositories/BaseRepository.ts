import { DatabaseService } from "../database/connection";
import { BaseRecord, SyncOperation, SyncStatus } from "../types/database";
import { generateId } from "../utils/id";
import { SyncQueueRepository } from "./SyncQueueRepository";

export abstract class BaseRepository<T extends BaseRecord> {
  protected tableName: string;
  protected syncQueueRepo: SyncQueueRepository;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.syncQueueRepo = new SyncQueueRepository();
  }

  /**
   * Fetches multiple records matching custom WHERE conditions (excluding soft-deleted rows by default).
   */
  public async findMany(options?: {
    where?: string;
    params?: unknown[];
    orderBy?: string;
    limit?: number;
    offset?: number;
    includeDeleted?: boolean;
  }): Promise<T[]> {
    let sql = `SELECT * FROM ${this.tableName}`;
    const conditions: string[] = [];
    const params: unknown[] = options?.params ? [...options.params] : [];

    if (!options?.includeDeleted) {
      conditions.push(`deletedAt IS NULL`);
    }

    if (options?.where) {
      conditions.push(`(${options.where})`);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    if (options?.orderBy) {
      sql += ` ORDER BY ${options.orderBy}`;
    } else {
      sql += ` ORDER BY createdAt DESC`;
    }

    if (options?.limit) {
      sql += ` LIMIT ${options.limit}`;
    }

    if (options?.offset) {
      sql += ` OFFSET ${options.offset}`;
    }

    return await DatabaseService.select<T>(sql, params);
  }

  /**
   * Fetches a single record by primary key ID.
   */
  public async findById(id: string): Promise<T | null> {
    const results = await DatabaseService.select<T>(
      `SELECT * FROM ${this.tableName} WHERE id = ? AND deletedAt IS NULL LIMIT 1`,
      [id]
    );
    return results[0] || null;
  }

  /**
   * Inserts a new record into local SQLite.
   * If isFromSync is false, automatically registers a SyncQueue upload entry.
   */
  public async create(
    data: Omit<T, "id" | "createdAt" | "updatedAt" | "syncStatus" | "deletedAt"> & { id?: string },
    isFromSync = false
  ): Promise<T> {
    const id = data.id || generateId();
    const now = new Date().toISOString();
    const syncStatus = isFromSync ? SyncStatus.SYNCED : SyncStatus.PENDING_UPLOAD;

    const fullRecord = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
      syncStatus,
      deletedAt: null,
    } as unknown as T;

    const keys = Object.keys(fullRecord);
    const placeholders = keys.map(() => "?").join(", ");
    const values = keys.map((key) => (fullRecord as Record<string, unknown>)[key]);

    const sql = `INSERT INTO ${this.tableName} (${keys.join(", ")}) VALUES (${placeholders})`;
    await DatabaseService.execute(sql, values);

    // Queue for sync engine if modified locally
    if (!isFromSync && this.tableName !== "SyncQueue" && this.tableName !== "Metadata") {
      await this.syncQueueRepo.enqueue(
        this.tableName,
        id,
        SyncOperation.CREATE,
        fullRecord as Record<string, unknown>
      );
    }

    return fullRecord;
  }

  /**
   * Updates an existing record in local SQLite.
   * If isFromSync is false, automatically registers a SyncQueue update entry.
   */
  public async update(
    id: string,
    data: Partial<Omit<T, "id" | "createdAt">>,
    isFromSync = false
  ): Promise<T | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const syncStatus = isFromSync ? SyncStatus.SYNCED : SyncStatus.PENDING_UPDATE;

    const updatedFields: Record<string, unknown> = {
      ...data,
      updatedAt: now,
      syncStatus,
    };

    const keys = Object.keys(updatedFields);
    const setClause = keys.map((key) => `${key} = ?`).join(", ");
    const values = [...keys.map((key) => updatedFields[key]), id];

    const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
    await DatabaseService.execute(sql, values);

    const updatedRecord = await this.findById(id);

    if (!isFromSync && updatedRecord && this.tableName !== "SyncQueue" && this.tableName !== "Metadata") {
      await this.syncQueueRepo.enqueue(
        this.tableName,
        id,
        SyncOperation.UPDATE,
        updatedRecord as Record<string, unknown>
      );
    }

    return updatedRecord;
  }

  /**
   * Soft deletes a record by populating the deletedAt timestamp.
   * If isFromSync is false, automatically registers a SyncQueue delete entry.
   */
  public async softDelete(id: string, isFromSync = false): Promise<boolean> {
    const existing = await this.findById(id);
    if (!existing) return false;

    const now = new Date().toISOString();
    const syncStatus = isFromSync ? SyncStatus.SYNCED : SyncStatus.PENDING_DELETE;

    await DatabaseService.execute(
      `UPDATE ${this.tableName} SET deletedAt = ?, syncStatus = ?, updatedAt = ? WHERE id = ?`,
      [now, syncStatus, now, id]
    );

    if (!isFromSync && this.tableName !== "SyncQueue" && this.tableName !== "Metadata") {
      await this.syncQueueRepo.enqueue(this.tableName, id, SyncOperation.DELETE, {
        id,
        deletedAt: now,
      });
    }

    return true;
  }

  /**
   * Marks a local record status as SYNCED.
   */
  public async markSynced(id: string): Promise<void> {
    const now = new Date().toISOString();
    await DatabaseService.execute(
      `UPDATE ${this.tableName} SET syncStatus = ?, updatedAt = ? WHERE id = ?`,
      [SyncStatus.SYNCED, now, id]
    );
  }
}
