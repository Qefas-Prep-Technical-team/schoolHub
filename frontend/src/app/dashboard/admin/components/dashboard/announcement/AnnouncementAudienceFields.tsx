"use client";

import React from "react";
import { Check } from "lucide-react";
import { ClassItem } from "../AdminAnnouncementModal";

export type AnnouncementPriority = "NORMAL" | "HIGH" | "URGENT";

interface AnnouncementAudienceFieldsProps {
  targets: string[];
  onToggleTarget: (target: string) => void;
  classes: ClassItem[];
  selectedClassId: string;
  onSelectClassId: (classId: string) => void;
  priority: AnnouncementPriority;
  onSelectPriority: (priority: AnnouncementPriority) => void;
}

const AUDIENCE_GROUPS = [
  { id: "STUDENT", label: "Students", desc: "All enrolled learners" },
  { id: "TEACHER", label: "Teachers", desc: "Teaching staff" },
  { id: "PARENT", label: "Parents", desc: "Guardians" },
] as const;

const PRIORITY_LEVELS: Array<{
  id: AnnouncementPriority;
  label: string;
  color: "blue" | "amber" | "rose";
}> = [
    { id: "NORMAL", label: "Standard", color: "blue" },
    { id: "HIGH", label: "Important", color: "amber" },
    { id: "URGENT", label: "Urgent", color: "rose" },
  ];

export function AnnouncementAudienceFields({
  targets,
  onToggleTarget,
  classes,
  selectedClassId,
  onSelectClassId,
  priority,
  onSelectPriority,
}: AnnouncementAudienceFieldsProps) {
  return (
    <>
      {/* Target Audience Selector */}
      <div>
        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
          Recipient Audience
        </label>
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {AUDIENCE_GROUPS.map((grp) => {
            const isSelected = targets.includes(grp.id);
            return (
              <button
                key={grp.id}
                type="button"
                onClick={() => onToggleTarget(grp.id)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${isSelected
                    ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400"
                  }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs sm:text-sm font-bold">
                    {grp.label}
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${isSelected
                        ? "bg-blue-600 text-white"
                        : "border border-slate-300 dark:border-slate-700"
                      }`}
                  >
                    {isSelected && <Check size={11} strokeWidth={3} />}
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1">
                  {grp.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Class Cohort Selector */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Target Class Cohort
          </label>
          <span className="text-[10px] font-bold text-slate-400">
            {classes.length} Available Classes
          </span>
        </div>
        <select
          value={selectedClassId}
          onChange={(e) => onSelectClassId(e.target.value)}
          className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
        >
          <option value="ALL">All Classes (Entire School Broadcast)</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} {c.section ? `(${c.section})` : ""}{" "}
              {c.studentCount ? `— ${c.studentCount} students` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Priority Pill Radios */}
      <div>
        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
          Notice Urgency Level
        </label>
        <div className="flex items-center gap-2">
          {PRIORITY_LEVELS.map((p) => {
            const isSelected = priority === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectPriority(p.id)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center ${isSelected
                    ? p.color === "rose"
                      ? "bg-rose-50 border-rose-400 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                      : p.color === "amber"
                        ? "bg-amber-50 border-amber-400 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                        : "bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                    : "border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                  }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

