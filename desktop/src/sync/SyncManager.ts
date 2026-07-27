import { PushProcessor } from "./PushProcessor";
import { PullProcessor } from "./PullProcessor";
import { ConflictResolver } from "./ConflictResolver";
import { SyncResult, SyncState } from "../types/sync";
import { NetworkMonitor } from "../services/NetworkMonitor";

export class SyncManager {
  private static instance: SyncManager | null = null;
  private pushProcessor: PushProcessor;
  private pullProcessor: PullProcessor;
  private networkMonitor: NetworkMonitor;
  private currentState: SyncState = "idle";
  private syncTimer: NodeJS.Timeout | null = null;
  private stateListeners: Set<(state: SyncState, result?: SyncResult) => void> = new Set();
  private isSyncing = false;

  private constructor() {
    this.pushProcessor = new PushProcessor();
    this.pullProcessor = new PullProcessor(new ConflictResolver());
    this.networkMonitor = NetworkMonitor.getInstance();

    // Automatically trigger sync when network transitions back to Online
    this.networkMonitor.addListener((isOnline) => {
      if (isOnline) {
        console.log("[SyncManager] Network restored to Online. Triggering automatic background sync...");
        this.triggerSync();
      } else {
        this.updateState("offline");
      }
    });
  }

  public static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  /**
   * Starts periodic background synchronization.
   */
  public startBackgroundSync(intervalMs = 30000): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    console.log(`[SyncManager] Background sync started with interval ${intervalMs}ms`);
    this.syncTimer = setInterval(() => {
      this.triggerSync();
    }, intervalMs);

    // Run immediate initial sync
    this.triggerSync();
  }

  /**
   * Stops background synchronization timer.
   */
  public stopBackgroundSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  /**
   * Triggers an immediate push and pull synchronization pass.
   */
  public async triggerSync(): Promise<SyncResult | null> {
    if (this.isSyncing) {
      console.log("[SyncManager] Sync already in progress, skipping duplicate trigger.");
      return null;
    }

    if (!this.networkMonitor.isOnline) {
      this.updateState("offline");
      return null;
    }

    this.isSyncing = true;
    this.updateState("syncing");
    const startTime = Date.now();

    try {
      // 1. Push local changes
      const pushResult = await this.pushProcessor.processPush();

      // 2. Pull remote server changes
      const pullResult = await this.pullProcessor.processPull();

      const durationMs = Date.now() - startTime;
      const syncResult: SyncResult = {
        success: true,
        timestamp: new Date().toISOString(),
        pushResult,
        pullResult,
        durationMs,
      };

      this.updateState("success", syncResult);
      setTimeout(() => this.updateState("idle"), 2000);

      return syncResult;
    } catch (error) {
      console.error("[SyncManager] Sync execution error:", error);
      const durationMs = Date.now() - startTime;
      const errorResult: SyncResult = {
        success: false,
        timestamp: new Date().toISOString(),
        pushResult: { successful: 0, failed: 1, errors: [{ entityId: "all", error: String(error) }] },
        pullResult: { fetched: 0, updated: 0, conflictsResolved: 0 },
        durationMs,
      };

      this.updateState("error", errorResult);
      return errorResult;
    } finally {
      this.isSyncing = false;
    }
  }

  public getState(): SyncState {
    return this.currentState;
  }

  public addListener(listener: (state: SyncState, result?: SyncResult) => void): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  private updateState(state: SyncState, result?: SyncResult): void {
    this.currentState = state;
    this.stateListeners.forEach((listener) => listener(state, result));
  }
}
