import React, { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRoutes } from "./routes";
import { MigrationRunner } from "./database/migrations";
import { SyncService } from "./services/SyncService";
import { useAuthStore } from "./store/useAuthStore";
import { RefreshCw } from "lucide-react";

import { useThemeStore } from "./store/useThemeStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes local cache stale time
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialize Theme Mode
        useThemeStore.getState().initTheme();

        // Ensure the splash screen stays visible for at least 2.5 seconds
        const minDelay = new Promise((resolve) => setTimeout(resolve, 2500));
        
        await Promise.all([
          MigrationRunner.runMigrations(),
          SyncService.initialize(),
          useAuthStore.getState().initAuth(),
          minDelay
        ]);
        
        setIsReady(true);
      } catch (err) {
        console.error("App boot failure:", err);
        setInitError(err instanceof Error ? err.message : String(err));
      }
    };

    initApp();
  }, []);

  if (!isReady) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 text-slate-100 font-sans">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl text-center max-w-sm space-y-4">
          <div className="mx-auto flex h-24 w-24 items-center justify-center animate-pulse drop-shadow-[0_0_15px_rgba(79,70,229,0.5)]">
            <img src="/schoolhub.png" alt="QefasHub Logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 tracking-tight">QefasHub Desktop</h2>
            <p className="text-xs text-slate-400 mt-2">Initializing SQLite Database & Sync Engine...</p>
          </div>

          {initError ? (
            <div className="rounded-lg bg-rose-950/60 border border-rose-800 p-3 text-xs text-rose-300">
              {initError}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-xs text-indigo-400">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Starting Background Engine</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
