import React, { useEffect, useState } from "react";
import { CheckSquare, MessageSquare, RefreshCw, HardDrive, AlertTriangle, ArrowUpRight, Clock } from "lucide-react";
import { TodoRepository, SyncQueueRepository, MessageRepository } from "../repositories";
import { useSyncStore } from "../store/useSyncStore";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { NavLink } from "react-router-dom";

export const DashboardPage: React.FC = () => {
  const [todoCount, setTodoCount] = useState(0);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const { syncState, triggerSync } = useSyncStore();
  const isOnline = useNetworkStatus();

  useEffect(() => {
    const loadStats = async () => {
      const todoRepo = new TodoRepository();
      const syncRepo = new SyncQueueRepository();
      const msgRepo = new MessageRepository();

      const todos = await todoRepo.findMany();
      const syncItems = await syncRepo.getPendingItems();
      const messages = await msgRepo.findMany();

      setTodoCount(todos.length);
      setPendingSyncCount(syncItems.length);
      setMessageCount(messages.length);
    };

    loadStats();
  }, [syncState]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="flex items-center justify-between rounded-xl border border-amber-500/30 dark:border-amber-800/60 bg-amber-500/10 dark:bg-amber-950/40 p-4 text-amber-800 dark:text-amber-300 shadow-md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/20 dark:bg-amber-900/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">You are currently Offline</h4>
              <p className="text-xs text-amber-700 dark:text-amber-400/90">
                You can create, edit, or delete items seamlessly. All changes are saved locally to SQLite and queued for automatic sync when internet returns.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Desktop Control Center</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Offline-First Architecture & Sync Engine telemetry status.
          </p>
        </div>

        <button
          onClick={triggerSync}
          disabled={syncState === "syncing" || !isOnline}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg hover:bg-indigo-500 disabled:opacity-50 transition cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${syncState === "syncing" ? "animate-spin" : ""}`} />
          <span>{syncState === "syncing" ? "Synchronizing..." : "Sync Local Data"}</span>
        </button>
      </div>

      {/* Telemetry Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Local SQLite Todos */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">SQLite Todos</span>
            <CheckSquare className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">{todoCount}</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Cached Locally</span>
          </div>
          <p className="text-[11px] text-slate-500">Read & Write via TodoRepository</p>
        </div>

        {/* Card 2: Pending Sync Operations */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Sync Queue</span>
            <Clock className="h-4 w-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{pendingSyncCount}</span>
            <span className="text-[11px] text-amber-600 dark:text-amber-300 font-medium">Pending Push</span>
          </div>
          <p className="text-[11px] text-slate-500">Queued for background engine</p>
        </div>

        {/* Card 3: Local Messages */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Cached Messages</span>
            <MessageSquare className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">{messageCount}</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Available Offline</span>
          </div>
          <p className="text-[11px] text-slate-500">Stored in local Messages table</p>
        </div>

        {/* Card 4: Database Storage Engine */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">SQLite Engine</span>
            <HardDrive className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">Active</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">v3.x SQLite</span>
          </div>
          <p className="text-[11px] text-slate-500">Tauri plugin-sql driver</p>
        </div>
      </div>

      {/* Quick Action Navigation Panels */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-4 shadow-sm dark:shadow-none">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">Offline Task Management</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Create, update, or complete tasks with zero network latency. All modifications execute instantly on SQLite and auto-sync when online.
          </p>
          <NavLink
            to="/todos"
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-600/20 px-4 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-100 dark:hover:bg-indigo-600/30 transition"
          >
            <span>Open Tasks Workspace</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </NavLink>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-4 shadow-sm dark:shadow-none">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">Synchronization Engine Telemetry</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Monitors connection status, conflict strategies (Last-Updated-Wins), and background execution queues.
          </p>
          <NavLink
            to="/settings"
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <span>Configure Sync Preferences</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </NavLink>
        </div>
      </div>
    </div>
  );
};
