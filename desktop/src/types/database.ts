export enum SyncStatus {
  SYNCED = 'SYNCED',
  PENDING_UPLOAD = 'PENDING_UPLOAD',
  PENDING_UPDATE = 'PENDING_UPDATE',
  PENDING_DELETE = 'PENDING_DELETE',
  FAILED = 'FAILED',
}

export enum SyncOperation {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export interface BaseRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: SyncStatus;
  deletedAt: string | null;
}

export interface UserRecord extends BaseRecord {
  email: string;
  name: string;
  avatar: string | null;
  role: string;
  token?: string | null;
}

export interface TodoRecord extends BaseRecord {
  userId: string;
  title: string;
  description: string | null;
  isCompleted: number; // 0 or 1 for SQLite boolean compatibility
  priority: 'low' | 'medium' | 'high';
  dueDate: string | null;
}

export interface NotificationRecord extends BaseRecord {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: number; // 0 or 1
}

export interface SettingRecord extends BaseRecord {
  key: string;
  value: string;
  category: string;
}

export interface MessageRecord extends BaseRecord {
  senderId: string;
  receiverId: string;
  content: string;
  isRead: number; // 0 or 1
}

export interface DraftRecord extends BaseRecord {
  userId: string;
  entityType: string;
  title: string | null;
  body: string;
  payload: string | null; // JSON stringified extra data
}

export interface SyncQueueRecord extends BaseRecord {
  entityName: string;
  entityId: string;
  operation: SyncOperation;
  payload: string; // JSON payload
  attempts: number;
  lastError: string | null;
}

export interface MetadataRecord extends BaseRecord {
  key: string;
  value: string;
  lastSyncedAt: string | null;
}
