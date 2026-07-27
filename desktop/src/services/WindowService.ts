import { getCurrentWindow } from "@tauri-apps/api/window";
import { enable, disable, isEnabled } from "@tauri-apps/plugin-autostart";
import { isTauri } from "../database/connection";

export class WindowService {
  public static async showWindow(): Promise<void> {
    if (!isTauri()) return;
    try {
      const appWindow = getCurrentWindow();
      await appWindow.show();
      await appWindow.setFocus();
    } catch {
      console.log("[WindowService] showWindow fallback");
    }
  }

  public static async hideWindow(): Promise<void> {
    if (!isTauri()) return;
    try {
      const appWindow = getCurrentWindow();
      await appWindow.hide();
    } catch {
      console.log("[WindowService] hideWindow fallback");
    }
  }

  public static async minimizeWindow(): Promise<void> {
    if (!isTauri()) return;
    try {
      const appWindow = getCurrentWindow();
      await appWindow.minimize();
    } catch {
      console.log("[WindowService] minimizeWindow fallback");
    }
  }

  public static async toggleMaximize(): Promise<void> {
    if (!isTauri()) return;
    try {
      const appWindow = getCurrentWindow();
      const isMax = await appWindow.isMaximized();
      if (isMax) {
        await appWindow.unmaximize();
      } else {
        await appWindow.maximize();
      }
    } catch {
      console.log("[WindowService] toggleMaximize fallback");
    }
  }

  public static async setAutostart(enabled: boolean): Promise<void> {
    if (!isTauri()) return;
    try {
      const currentlyEnabled = await isEnabled();
      if (enabled && !currentlyEnabled) {
        await enable();
      } else if (!enabled && currentlyEnabled) {
        await disable();
      }
    } catch (error) {
      console.warn("[WindowService] Autostart plugin error:", error);
    }
  }
}
