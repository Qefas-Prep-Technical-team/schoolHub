import { create } from "zustand";
import { SyncState, SyncResult } from "../types/sync";
import { SyncManager } from "../sync/SyncManager";
import { SyncQueueRepository } from "../repositories/SyncQueueRepository";

interface SyncStoreState {
  syncState: SyncState;
  pendingCount: number;
  lastSyncResult: SyncResult | null;
  lastSyncTime: string | null;
  initSyncStore: () => void;
  triggerSync: () => Promise<void>;
  updatePendingCount: () => Promise<void>;
}

const syncQueueRepo = new SyncQueueRepository();

export const useSyncStore = create<SyncStoreState>((set) => ({
  syncState: "idle",
  pendingCount: 0,
  lastSyncResult: null,
  lastSyncTime: null,

  initSyncStore: () => {
    const syncManager = SyncManager.getInstance();
    
    // Subscribe to SyncManager updates
    syncManager.addListener((state, result) => {
      set((s) => ({
        syncState: state,
        lastSyncResult: result || s.lastSyncResult,
        lastSyncTime: result ? result.timestamp : s.lastSyncTime,
      }));
      
      // Refresh pending count
      syncQueueRepo.getPendingCount().then((count) => {
        set({ pendingCount: count });
      });
    });

    // Initial count fetch
    syncQueueRepo.getPendingCount().then((count) => {
      set({ pendingCount: count });
    });
  },

  triggerSync: async () => {
    const syncManager = SyncManager.getInstance();
    await syncManager.triggerSync();
    const count = await syncQueueRepo.getPendingCount();
    set({ pendingCount: count });
  },

  updatePendingCount: async () => {
    const count = await syncQueueRepo.getPendingCount();
    set({ pendingCount: count });
  },
}));
