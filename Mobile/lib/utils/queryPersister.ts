/**
 * Offline persistence for TanStack Query.
 *
 * Uses AsyncStorage to persist the query cache to disk.
 * When the app is offline, TanStack Query will serve stale data from this cache.
 *
 * Cache lifetime: 24 hours (86400000ms)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'QEFAS_QUERY_CACHE',
  // Throttle writes to disk to avoid hammering storage on every refetch
  throttleTime: 1000,
});

/** How long (ms) data is considered fresh and won't be re-fetched: 5 minutes */
export const DEFAULT_STALE_TIME = 1000 * 60 * 5;

/** How long (ms) unused cache is kept in memory AND persisted to disk: 24 hours */
export const DEFAULT_GC_TIME = 1000 * 60 * 60 * 24;
