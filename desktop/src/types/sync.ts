import { BaseRecord, SyncOperation } from "./database";

export interface ConflictContext<T extends BaseRecord> {
  localRecord: T;
  remoteRecord: T;
  entityName: string;
}

export interface ConflictResolutionResult<T extends BaseRecord> {
  resolvedRecord: T;
  winner: 'local' | 'remote' | 'merged';
}

export interface IConflictStrategy {
  name: string;
  resolve<T extends BaseRecord>(context: ConflictContext<T>): ConflictResolutionResult<T>;
}

export interface SyncPushResult {
  successful: number;
  failed: number;
  errors: Array<{ entityId: string; error: string }>;
}

export interface SyncPullResult {
  fetched: number;
  updated: number;
  conflictsResolved: number;
}

export interface SyncResult {
  success: boolean;
  timestamp: string;
  pushResult: SyncPushResult;
  pullResult: SyncPullResult;
  durationMs: number;
}

export type SyncState = 'idle' | 'syncing' | 'offline' | 'error' | 'success';

export interface SyncEngineConfig {
  syncIntervalMs: number;
  maxRetryAttempts: number;
  conflictStrategy: IConflictStrategy;
}
