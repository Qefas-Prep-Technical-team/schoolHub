"use client";

import React from "react";
import { UserCog, QrCode, Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClassDetailsHeaderProps {
  loading: boolean;
  classData: any;
  onOpenQR: () => void;
  onOpenManage: () => void;
  onOpenTeachers: () => void;
  onToggleLock: () => void;
  isTogglingLock?: boolean;
}

export function ClassDetailsHeader({
  loading,
  classData,
  onOpenQR,
  onOpenManage,
  onOpenTeachers,
  onToggleLock,
  isTogglingLock,
}: ClassDetailsHeaderProps) {
  const isLocked =
    classData?.isLocked ||
    classData?.locked ||
    classData?.status === "ARCHIVED" ||
    classData?.status === "LOCKED";

  const statusLabel = isLocked
    ? classData?.status === "ARCHIVED"
      ? "Archived"
      : "Locked"
    : "Active Class";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-5 md:gap-8 justify-between items-start md:items-center relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col gap-2 z-10 w-full md:w-auto">
        {loading ? (
          <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        ) : (
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="size-13 sm:w-16 sm:h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl sm:text-2xl border border-indigo-200 dark:border-indigo-800/60 shrink-0">
              {classData?.name?.charAt(0) || "C"}
            </div>
            <div className="min-w-0">
              <h1 className="text-slate-900 dark:text-white text-2xl sm:text-3xl font-black tracking-tight truncate">
                {classData?.name}{" "}
                {classData?.section ? (
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {classData.section}
                  </span>
                ) : (
                  ""
                )}
              </h1>
              <div className="text-slate-500 dark:text-slate-400 mt-1 font-medium flex items-center gap-2 sm:gap-3 text-xs sm:text-sm flex-wrap">
                <span className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      isLocked
                        ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                        : "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    )}
                  />
                  {statusLabel}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 hidden sm:inline-block" />
                <span className="font-mono text-[11px] sm:text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 shrink-0">
                  Code: {classData?.classCode}
                </span>
                {classData?.level && (
                  <span className="text-[11px] sm:text-xs px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 font-bold uppercase tracking-wider shrink-0">
                    Level: {classData.level}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 w-full md:w-auto z-10 items-stretch sm:items-center pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between sm:justify-start gap-6 sm:gap-8 w-full sm:w-auto">
          {/* Quick Stats */}
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Students
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {loading
                ? "..."
                : classData?._count?.enrollments ??
                  classData?.enrollments?.length ??
                  0}
            </span>
          </div>

          <div className="w-px h-8 sm:h-10 bg-slate-200 dark:bg-slate-800" />

          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Teachers
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              {loading ? "..." : classData?.teachers?.length || 0}
              {classData?.teachers?.length > 0 && (
                <button
                  type="button"
                  onClick={onOpenTeachers}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline text-xs font-bold transition-colors align-middle cursor-pointer"
                  title="View all assigned teachers"
                >
                  View
                </button>
              )}
            </span>
          </div>
        </div>

        <div className="hidden sm:block w-px h-10 bg-slate-200 dark:bg-slate-800" />

        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto items-center flex-wrap">
          {/* Lock / Unlock Class Button */}
          <button
            type="button"
            disabled={loading || !classData || isTogglingLock}
            onClick={onToggleLock}
            className={cn(
              "h-11 sm:h-12 px-3.5 sm:px-4 flex items-center justify-center gap-2 rounded-xl font-bold text-xs sm:text-sm border transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed",
              isLocked
                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/60 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80"
            )}
            title={
              isLocked
                ? "Class is locked (new students cannot join). Click to unlock."
                : "Class is open. Click to lock against new student join requests."
            }
          >
            {isTogglingLock ? (
              <span className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
            ) : isLocked ? (
              <Lock size={16} className="text-amber-600 dark:text-amber-400" />
            ) : (
              <Unlock size={16} className="text-slate-500 dark:text-slate-400" />
            )}
            <span>{isLocked ? "Locked" : "Lock Class"}</span>
          </button>

          <button
            type="button"
            disabled={loading || !classData}
            onClick={onOpenQR}
            className="size-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all shadow-2xs hover:shadow-sm hover:-translate-y-0.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
            title={loading ? "Loading class..." : "QR Access"}
          >
            <QrCode size={19} />
          </button>

          <button
            type="button"
            onClick={onOpenManage}
            className="flex-1 sm:flex-none px-4 sm:px-6 h-11 sm:h-12 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm shadow-indigo-600/20 dark:shadow-none transition-all hover:-translate-y-0.5 text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 cursor-pointer"
          >
            <UserCog size={17} />
            <span>Manage Class</span>
          </button>
        </div>
      </div>
    </div>
  );
}

