import React, { useEffect, useState } from "react";
import { SettingsRepository } from "../repositories";
import { useThemeStore } from "../store/useThemeStore";
import { useAuthStore } from "../store/useAuthStore";
import { WindowService } from "../services/WindowService";
import { Sliders, Moon, Sun, Power, Bell, Check, UserCheck, RefreshCcw } from "lucide-react";

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useThemeStore();
  const { selectedUserType, clearSelectedUserType, user } = useAuthStore();
  const [syncFreq, setSyncFreq] = useState("30");
  const [autostart, setAutostart] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  const settingsRepo = new SettingsRepository();

  useEffect(() => {
    const loadSettings = async () => {
      const freq = await settingsRepo.getByKey("sync_frequency_seconds");
      if (freq) setSyncFreq(freq);

      const auto = await settingsRepo.getByKey("autostart_enabled");
      if (auto) setAutostart(auto === "true");

      const notify = await settingsRepo.getByKey("notifications_enabled");
      if (notify) setNotificationsEnabled(notify !== "false");
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    await settingsRepo.setKey("sync_frequency_seconds", syncFreq, "sync");
    await settingsRepo.setKey("autostart_enabled", autostart ? "true" : "false", "system");
    await settingsRepo.setKey("notifications_enabled", notificationsEnabled ? "true" : "false", "notifications");

    await WindowService.setAutostart(autostart);

    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Application Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure synchronization intervals, appearance, notifications, and default user role preferences.
        </p>
      </div>

      {savedNotice && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 p-3 text-xs text-emerald-800 dark:text-emerald-300">
          <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Settings saved successfully to SQLite database.</span>
        </div>
      )}

      {/* Settings Grid */}
      <div className="space-y-4">
        {/* User Role Preference */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 space-y-3 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-200">
              <UserCheck className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
              <span>Default User Role Preference</span>
            </div>
            <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 px-2.5 py-0.5 text-[11px] font-mono text-indigo-700 dark:text-indigo-300">
              {user?.role || selectedUserType || "Not Set"}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your preferred account role is saved automatically on your desktop device.
          </p>

          <button
            onClick={() => clearSelectedUserType()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
          >
            <RefreshCcw className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
            <span>Reset Saved Role Preference</span>
          </button>
        </div>

        {/* Appearance */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 space-y-3 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-200">
            {theme === "dark" ? <Moon className="h-4 w-4 text-indigo-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
            <span>Appearance & Theme</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme("dark")}
              className={`flex-1 rounded-xl border p-4 text-left transition cursor-pointer ${
                theme === "dark"
                  ? "border-indigo-500 bg-indigo-950/30 text-indigo-200"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400"
              }`}
            >
              <h4 className="text-xs font-bold mb-1">Dark Slate Mode</h4>
              <p className="text-[11px] opacity-75">Optimized for low-light desktop productivity.</p>
            </button>

            <button
              onClick={() => setTheme("light")}
              className={`flex-1 rounded-xl border p-4 text-left transition cursor-pointer ${
                theme === "light"
                  ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400"
              }`}
            >
              <h4 className="text-xs font-bold mb-1">Light Theme</h4>
              <p className="text-[11px] opacity-75">High contrast daytime UI theme.</p>
            </button>
          </div>
        </div>

        {/* Sync Frequency */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 space-y-3 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-200">
            <Sliders className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
            <span>Background Sync Frequency</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select how often the background sync engine pushes pending local queue items to the remote API.
          </p>

          <select
            value={syncFreq}
            onChange={(e) => setSyncFreq(e.target.value)}
            className="w-full max-w-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
          >
            <option value="15">Every 15 Seconds (Realtime)</option>
            <option value="30">Every 30 Seconds (Recommended)</option>
            <option value="60">Every 1 Minute</option>
            <option value="300">Every 5 Minutes</option>
          </select>
        </div>

        {/* Desktop Notifications */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 space-y-3 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-200">
            <Bell className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
            <span>Desktop Push Notifications</span>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs text-slate-700 dark:text-slate-300">Show native Windows notifications on background sync completion</span>
          </label>
        </div>

        {/* Windows System Startup */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 space-y-3 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Power className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
            <span className="text-slate-900 dark:text-slate-200">Windows Auto-Start</span>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autostart}
              onChange={(e) => setAutostart(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs text-slate-700 dark:text-slate-300">Launch QefasHub Desktop automatically when Windows boots up</span>
          </label>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            className="rounded-lg bg-indigo-600 px-6 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-lg cursor-pointer"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
