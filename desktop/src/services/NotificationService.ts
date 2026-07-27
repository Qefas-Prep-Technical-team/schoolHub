import { isPermissionGranted, requestPermission, sendNotification as tauriNotify } from "@tauri-apps/plugin-notification";
import { SettingsRepository } from "../repositories/SettingsRepository";
import { isTauri } from "../database/connection";

export class NotificationService {
  /**
   * Dispatches a Windows desktop native notification if permission is granted & user setting is enabled.
   */
  public static async sendNotification(title: string, body: string): Promise<void> {
    try {
      const settingsRepo = new SettingsRepository();
      const enabled = await settingsRepo.getByKey("notifications_enabled");
      if (enabled === "false") {
        return; // User muted desktop notifications
      }

      if (!isTauri()) {
        console.log(`[NotificationService Web Fallback] ${title}: ${body}`);
        return;
      }

      let granted = await isPermissionGranted();
      if (!granted) {
        const permission = await requestPermission();
        granted = permission === "granted";
      }

      if (granted) {
        tauriNotify({
          title,
          body,
        });
      } else {
        console.log(`[NotificationService] Permission denied. Fallback log: ${title} - ${body}`);
      }
    } catch (error) {
      console.warn("[NotificationService] Desktop notification dispatch error:", error);
    }
  }
}
