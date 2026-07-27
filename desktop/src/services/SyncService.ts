import { SyncManager } from "../sync/SyncManager";
import { SettingsRepository } from "../repositories/SettingsRepository";
import { NotificationService } from "./NotificationService";

export class SyncService {
  private static isInitialized = false;

  /**
   * Bootstraps background synchronization service on application launch.
   */
  public static async initialize(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;

    console.log("[SyncService] Initializing background synchronization service...");

    const settingsRepo = new SettingsRepository();
    const frequencyStr = await settingsRepo.getByKey("sync_frequency_seconds");
    const intervalSeconds = frequencyStr ? parseInt(frequencyStr, 10) : 30;
    const intervalMs = (isNaN(intervalSeconds) ? 30 : intervalSeconds) * 1000;

    const syncManager = SyncManager.getInstance();

    // Listen to sync execution results to dispatch native notifications
    syncManager.addListener((state, result) => {
      if (state === "success" && result) {
        if (result.pushResult.successful > 0 || result.pullResult.updated > 0) {
          NotificationService.sendNotification(
            "Sync Complete",
            `Successfully synced ${result.pushResult.successful} uploaded changes and ${result.pullResult.updated} server updates.`
          );
        }
      } else if (state === "error" && result) {
        if (result.pushResult.failed > 0) {
          NotificationService.sendNotification(
            "Sync Error",
            `Failed to upload ${result.pushResult.failed} changes. Will retry automatically when online.`
          );
        }
      }
    });

    // Start background sync interval
    syncManager.startBackgroundSync(intervalMs);
  }
}
