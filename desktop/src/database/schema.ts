export const CREATE_USERS_TABLE = `
CREATE TABLE IF NOT EXISTS Users (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  token TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  syncStatus TEXT NOT NULL DEFAULT 'SYNCED',
  deletedAt TEXT
);
CREATE INDEX IF NOT EXISTS idx_users_syncStatus ON Users(syncStatus);
CREATE INDEX IF NOT EXISTS idx_users_email ON Users(email);
`;

export const CREATE_TODOS_TABLE = `
CREATE TABLE IF NOT EXISTS Todos (
  id TEXT PRIMARY KEY NOT NULL,
  userId TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  isCompleted INTEGER NOT NULL DEFAULT 0,
  priority TEXT NOT NULL DEFAULT 'medium',
  dueDate TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  syncStatus TEXT NOT NULL DEFAULT 'PENDING_UPLOAD',
  deletedAt TEXT
);
CREATE INDEX IF NOT EXISTS idx_todos_userId ON Todos(userId);
CREATE INDEX IF NOT EXISTS idx_todos_syncStatus ON Todos(syncStatus);
CREATE INDEX IF NOT EXISTS idx_todos_deletedAt ON Todos(deletedAt);
`;

export const CREATE_NOTIFICATIONS_TABLE = `
CREATE TABLE IF NOT EXISTS Notifications (
  id TEXT PRIMARY KEY NOT NULL,
  userId TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  isRead INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  syncStatus TEXT NOT NULL DEFAULT 'SYNCED',
  deletedAt TEXT
);
CREATE INDEX IF NOT EXISTS idx_notifications_userId ON Notifications(userId);
CREATE INDEX IF NOT EXISTS idx_notifications_isRead ON Notifications(isRead);
CREATE INDEX IF NOT EXISTS idx_notifications_syncStatus ON Notifications(syncStatus);
`;

export const CREATE_SETTINGS_TABLE = `
CREATE TABLE IF NOT EXISTS Settings (
  id TEXT PRIMARY KEY NOT NULL,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  syncStatus TEXT NOT NULL DEFAULT 'SYNCED',
  deletedAt TEXT
);
CREATE INDEX IF NOT EXISTS idx_settings_key ON Settings(key);
`;

export const CREATE_MESSAGES_TABLE = `
CREATE TABLE IF NOT EXISTS Messages (
  id TEXT PRIMARY KEY NOT NULL,
  senderId TEXT NOT NULL,
  receiverId TEXT NOT NULL,
  content TEXT NOT NULL,
  isRead INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  syncStatus TEXT NOT NULL DEFAULT 'PENDING_UPLOAD',
  deletedAt TEXT
);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON Messages(senderId);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON Messages(receiverId);
CREATE INDEX IF NOT EXISTS idx_messages_syncStatus ON Messages(syncStatus);
`;

export const CREATE_DRAFTS_TABLE = `
CREATE TABLE IF NOT EXISTS Drafts (
  id TEXT PRIMARY KEY NOT NULL,
  userId TEXT NOT NULL,
  entityType TEXT NOT NULL,
  title TEXT,
  body TEXT NOT NULL,
  payload TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  syncStatus TEXT NOT NULL DEFAULT 'PENDING_UPLOAD',
  deletedAt TEXT
);
CREATE INDEX IF NOT EXISTS idx_drafts_userId ON Drafts(userId);
CREATE INDEX IF NOT EXISTS idx_drafts_entityType ON Drafts(entityType);
`;

export const CREATE_SYNC_QUEUE_TABLE = `
CREATE TABLE IF NOT EXISTS SyncQueue (
  id TEXT PRIMARY KEY NOT NULL,
  entityName TEXT NOT NULL,
  entityId TEXT NOT NULL,
  operation TEXT NOT NULL,
  payload TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  lastError TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  syncStatus TEXT NOT NULL DEFAULT 'PENDING_UPLOAD',
  deletedAt TEXT
);
CREATE INDEX IF NOT EXISTS idx_syncqueue_status ON SyncQueue(syncStatus);
CREATE INDEX IF NOT EXISTS idx_syncqueue_entity ON SyncQueue(entityName, entityId);
`;

export const CREATE_METADATA_TABLE = `
CREATE TABLE IF NOT EXISTS Metadata (
  id TEXT PRIMARY KEY NOT NULL,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  lastSyncedAt TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  syncStatus TEXT NOT NULL DEFAULT 'SYNCED',
  deletedAt TEXT
);
CREATE INDEX IF NOT EXISTS idx_metadata_key ON Metadata(key);
`;

export const ALL_SCHEMAS = [
  CREATE_USERS_TABLE,
  CREATE_TODOS_TABLE,
  CREATE_NOTIFICATIONS_TABLE,
  CREATE_SETTINGS_TABLE,
  CREATE_MESSAGES_TABLE,
  CREATE_DRAFTS_TABLE,
  CREATE_SYNC_QUEUE_TABLE,
  CREATE_METADATA_TABLE,
];
