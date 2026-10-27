"use client";

import React from "react";
import { 
  X, 
  Check, 
  Layers, 
  UserCheck, 
  ChevronRight, 
  GraduationCap, 
  CalendarDays,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AvailableClass {
  id: string;
  name: string;
  section?: string;
  level?: string;
  session?: string;
  term?: string;
  classCode?: string;
  school?: { name?: string };
  teachers?: {
    isLead?: boolean;
    teacher?: { 
      id?: string; 
      name?: string; 
      email?: string; 
      phone?: string; 
      profileImage?: string;
    };
  }[];
}

interface SwitchClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: AvailableClass[];
  currentClassId: string;
  onSelectClass: (classId: string) => void;
  childName: string;
}

export default function SwitchClassModal({
  isOpen,
  onClose,
  classes,
  currentClassId,
  onSelectClass,
  childName,
}: SwitchClassModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click handler */}
      <div 
        className="fixed inset-0 -z-10" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-r from-orange-50/50 via-white to-amber-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-orange-950/20">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
                <Layers size={20} />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 text-[10px] font-black uppercase tracking-wider mb-1">
                  <GraduationCap size={12} />
                  Classroom Switcher
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Enrolled Classes for {childName}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="size-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 flex items-center justify-center transition-colors shrink-0"
              aria-label="Close dialog"
            >
              <X size={16} />
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed">
            Select any class cohort {childName} is registered in to inspect schedules, syllabi, and assigned teachers.
          </p>
        </div>

        {/* Modal Class List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1 scrollbar-thin">
          {classes.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="size-12 rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
                <GraduationCap size={22} />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                No Additional Classes Found
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                {childName} is not enrolled in multiple classroom cohorts for this session. Contact the school administrator to request an arm or section adjustment.
              </p>
            </div>
          ) : (
            classes.map((cls) => {
              const isCurrent = cls.id === currentClassId;

              // Lead teacher name if available
              const leadRel = cls.teachers?.find((t) => t.isLead) || cls.teachers?.[0];
              const leadName = leadRel?.teacher?.name;
              const totalTeachers = cls.teachers?.length || 0;

              return (
                <div
                  key={cls.id}
                  onClick={() => {
                    onSelectClass(cls.id);
                    onClose();
                  }}
                  className={cn(
                    "p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative group",
                    isCurrent
                      ? "bg-orange-50/60 dark:bg-orange-950/30 border-orange-500 ring-2 ring-orange-500/20 shadow-sm"
                      : "bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800 hover:border-orange-500/60 hover:shadow-md hover:bg-slate-50/60 dark:hover:bg-slate-800/60"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                          {cls.name}
                        </span>

                        {cls.section && (
                          <span className="px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 text-[11px] font-bold">
                            Section {cls.section}
                          </span>
                        )}

                        {cls.level && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold">
                            Level {cls.level}
                          </span>
                        )}
                      </div>

                      {/* Session, Term, Class Code */}
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        {cls.classCode && (
                          <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {cls.classCode}
                          </span>
                        )}

                        {(cls.session || cls.term) && (
                          <span className="flex items-center gap-1 text-[11px]">
                            <CalendarDays size={12} className="text-slate-400" />
                            <span>{[cls.session, cls.term].filter(Boolean).join(" • ")}</span>
                          </span>
                        )}
                      </div>

                      {/* Teacher details */}
                      {leadName && (
                        <div className="flex items-center gap-1.5 pt-1 text-xs text-slate-600 dark:text-slate-300">
                          <UserCheck size={13} className="text-orange-500 shrink-0" />
                          <span className="truncate">
                            <span className="text-slate-400 text-[11px]">Lead:</span> {leadName}
                            {totalTeachers > 1 && (
                              <span className="text-slate-400 text-[11px] ml-1">
                                (+{totalTeachers - 1} co-teacher{totalTeachers > 2 ? 's' : ''})
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Active Checkmark or Arrow */}
                    <div className="shrink-0 pt-0.5">
                      {isCurrent ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-600 text-white text-[11px] font-bold shadow-xs">
                          <Check size={12} />
                          <span>Active View</span>
                        </div>
                      ) : (
                        <div className="size-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-orange-500 group-hover:text-white flex items-center justify-center transition-colors">
                          <ChevronRight size={16} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles size={14} className="text-orange-500" />
            <span>
              {classes.length} classroom cohort{classes.length === 1 ? "" : "s"} linked
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
