import React, { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, Copy, X, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useSyncStore } from "../../store/useSyncStore";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";

export const TitleBar: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const { syncState, pendingCount, triggerSync } = useSyncStore();
  const isOnline = useNetworkStatus();

  useEffect(() => {
    let unlistenFn: (() => void) | undefined;
    try {
      const appWindow = getCurrentWindow();
      appWindow.isMaximized().then(setIsMaximized);

      appWindow.onResized(async () => {
        const maximized = await appWindow.isMaximized();
        setIsMaximized(maximized);
      }).then((unlisten) => {
        unlistenFn = unlisten;
      });
    } catch {
      // Fallback for browser mode
    }

    return () => {
      if (unlistenFn) unlistenFn();
    };
  }, []);

  const handleMinimize = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await getCurrentWindow().minimize();
    } catch {
      console.log("Minimize fallback");
    }
  };

  const handleToggleMaximize = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const appWindow = getCurrentWindow();
      await appWindow.toggleMaximize();
      const maximized = await appWindow.isMaximized();
      setIsMaximized(maximized);
    } catch {
      console.log("Maximize fallback");
    }
  };

  const handleClose = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await getCurrentWindow().close();
    } catch {
      console.log("Close fallback");
    }
  };

  return (
    <div
      data-tauri-drag-region
      onDoubleClick={handleToggleMaximize}
      className="flex h-10 w-full items-center justify-between bg-slate-900 border-b border-slate-800/80 px-3 text-slate-300 select-none z-50 cursor-default"
    >
      {/* Left section: App Brand Logo & Title */}
      <div className="flex items-center gap-2.5" data-tauri-drag-region>
        <div className="h-5 w-5 rounded bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
          Q
        </div>
        <span className="text-xs font-semibold text-slate-200 tracking-wide">QefasHub</span>
        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">v1.0.0</span>
      </div>

      {/* Center section: Live Network & Sync Telemetry */}
      <div className="flex items-center gap-3 text-xs" data-tauri-drag-region>
        {/* Network status pill */}
        <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${
          isOnline
            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50'
            : 'bg-amber-950/60 text-amber-400 border-amber-800/50'
        }`}>
          {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          <span>{isOnline ? 'Online' : 'Offline Mode'}</span>
        </div>

        {/* Sync Status Badge */}
        <button
          onClick={triggerSync}
          disabled={syncState === 'syncing'}
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition border ${
            syncState === 'syncing'
              ? 'bg-indigo-950/60 text-indigo-400 border-indigo-800/50'
              : pendingCount > 0
              ? 'bg-amber-950/60 text-amber-300 border-amber-800/50 hover:bg-amber-900/60'
              : 'bg-slate-800/60 text-slate-400 border-slate-700/50 hover:bg-slate-800'
          }`}
          title="Click to manually trigger sync engine"
        >
          <RefreshCw className={`h-3 w-3 ${syncState === 'syncing' ? 'animate-spin text-indigo-400' : ''}`} />
          <span>
            {syncState === 'syncing'
              ? 'Syncing...'
              : pendingCount > 0
              ? `${pendingCount} Pending`
              : 'Synced'}
          </span>
        </button>
      </div>

      {/* Right section: Windows Control Buttons */}
      <div className="flex items-center">
        <button
          onClick={handleMinimize}
          className="flex h-10 w-10 items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
          title="Minimize"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleToggleMaximize}
          className="flex h-10 w-10 items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
          title={isMaximized ? "Restore" : "Maximize"}
        >
          {isMaximized ? <Copy className="h-3.5 w-3.5 rotate-180" /> : <Square className="h-3.5 w-3.5" />}
        </button>
        <button
          onClick={handleClose}
          className="flex h-10 w-10 items-center justify-center text-slate-400 hover:bg-rose-600 hover:text-white transition"
          title="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
