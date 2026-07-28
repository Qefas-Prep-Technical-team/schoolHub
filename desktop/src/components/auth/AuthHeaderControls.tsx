import React from "react";
import { Wifi, WifiOff, Sun, Moon } from "lucide-react";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import { useThemeStore } from "../../store/useThemeStore";

export const AuthHeaderControls: React.FC = () => {
  const isOnline = useNetworkStatus();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="flex items-center gap-2 z-50">
      {/* Network Connection Badge */}
      <div
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium border ${
          isOnline
            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
            : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60"
        }`}
      >
        {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
        <span className="hidden sm:inline">{isOnline ? "Online API" : "Offline Mode"}</span>
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {theme === "dark" ? <Moon className="h-3.5 w-3.5 text-indigo-400" /> : <Sun className="h-3.5 w-3.5 text-amber-500" />}
      </button>
    </div>
  );
};
