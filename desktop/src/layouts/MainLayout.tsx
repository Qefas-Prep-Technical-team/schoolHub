import React, { useEffect } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare,
  MessageSquare,
  Settings,
  Info,
  Database,
  Moon,
  Sun,
  ShieldCheck,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { TitleBar } from "../components/titlebar/TitleBar";
import { useSyncStore } from "../store/useSyncStore";
import { useThemeStore } from "../store/useThemeStore";
import { useAuthStore } from "../store/useAuthStore";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { getRoleTheme } from "../theme/roleTheme";
import { SyncService } from "../services/SyncService";

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { initSyncStore, pendingCount, syncState, triggerSync } = useSyncStore();
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout, isOfflineMode } = useAuthStore();
  const isOnline = useNetworkStatus();
  const roleTheme = getRoleTheme(user?.role);

  useEffect(() => {
    initSyncStore();
  }, [initSyncStore]);

  const handleLogout = async () => {
    await logout();
    navigate("/auth", { replace: true });
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/todos", label: "Todos & Tasks", icon: CheckSquare, badge: pendingCount },
    { path: "/messages", label: "Messages & Drafts", icon: MessageSquare },
    { path: "/settings", label: "Settings", icon: Settings },
    { path: "/about", label: "About System", icon: Info },
  ];

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Tauri Window Title Bar with Control Buttons */}
      <TitleBar />

      {/* Top Application Header */}
      <header className="flex h-12 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 px-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs shadow-md">
            Q
          </div>
          <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">QefasHub Desktop</span>
          <span className="rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            v1.0.0
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => triggerSync()}
            disabled={!isOnline || syncState === "syncing"}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-50 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncState === "syncing" ? "animate-spin text-indigo-500" : ""}`} />
            <span>{syncState === "syncing" ? "Syncing..." : "Sync Now"}</span>
          </button>
        </div>
      </header>

      {/* Body Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sleek Sidebar Navigation */}
        <aside className="w-64 border-r border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60 p-4 flex flex-col justify-between backdrop-blur-md">
          <div className="space-y-6">
            {/* User Profile Card Header */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3 shadow-sm dark:shadow-inner">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`h-9 w-9 rounded-lg ${roleTheme.avatarBg} flex items-center justify-center font-bold text-white shadow-md flex-shrink-0`}>
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : "SH"}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user?.name || "School User"}</h4>
                  <p className={`text-[10px] font-semibold uppercase tracking-wider ${roleTheme.activeNavText}`}>{roleTheme.label}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition flex-shrink-0"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

            {/* Offline Session Badge */}
            {isOfflineMode && (
              <div className="rounded-lg bg-amber-500/10 dark:bg-amber-950/60 border border-amber-500/20 dark:border-amber-800/60 p-2 text-[10px] text-amber-600 dark:text-amber-300 font-medium text-center">
                Offline SQLite Active Session
              </div>
            )}

            {/* Navigation Menu Links */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition ${isActive
                        ? `${roleTheme.activeNavBg} ${roleTheme.activeNavText} ${roleTheme.activeNavBorder} border shadow-sm`
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${isActive ? roleTheme.activeNavIcon : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Footer Controls: Theme Toggle & Offline Banner */}
          <div className="space-y-3">
            <button
              onClick={toggleTheme}
              className="flex w-full items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {theme === "dark" ? <Moon className="h-4 w-4 text-indigo-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
                <span>{theme === "dark" ? "Dark Theme" : "Light Theme"}</span>
              </div>
              <span className="text-[10px] text-slate-500 capitalize">{theme}</span>
            </button>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40 p-2.5 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 mb-1 text-slate-800 dark:text-slate-300 font-semibold">
                <Database className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                <span>SQLite Cache Active</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                All UI reads/writes are stored locally in SQLite first.
              </p>
            </div>
          </div>
        </aside>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-300">
          <Outlet />
        </main>
      </div>

      {/* Bottom Status Bar */}
      <footer className="flex h-7 w-full items-center justify-between border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 px-4 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${isOnline ? "bg-emerald-500" : "bg-amber-500"}`}></span>
            <span>Network: {isOnline ? "Connected" : "Disconnected (Offline-First)"}</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className={`h-3 w-3 ${roleTheme.activeNavIcon}`} />
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${roleTheme.badgeBg} ${roleTheme.badgeText} border ${roleTheme.badgeBorder}`}>
              {roleTheme.label} Theme ({roleTheme.colorName})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono">Sync: {syncState.toUpperCase()}</span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span>Pending Queue: {pendingCount}</span>
        </div>
      </footer>
    </div>
  );
};
