"use client";

import React from "react";
import {
  Users,
  Award,
  TrendingUp,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  Building2,
} from "lucide-react";
import { ClassItem } from "../AdminAnnouncementModal";
import { PerformanceAnalysis } from "@/lib/api/services/schoolService";

interface WeeklyReportBodyProps {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  avgScore: string;
  analysis?: PerformanceAnalysis | null;
  classes: ClassItem[];
}

export function WeeklyReportBody({
  totalStudents,
  totalTeachers,
  totalClasses,
  avgScore,
  analysis,
  classes,
}: WeeklyReportBodyProps) {
  return (
    <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-slate-900/50">
      {/* Executive KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Total Students
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <GraduationCap size={15} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {totalStudents}
          </p>
          <p className="text-[10px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
            <TrendingUp size={11} /> Active Enrollment
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Academic Staff
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Users size={15} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {totalTeachers}
          </p>
          <p className="text-[10px] font-bold text-slate-500 mt-1">
            Teaching Force
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Class Cohorts
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Building2 size={15} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {totalClasses}
          </p>
          <p className="text-[10px] font-bold text-slate-500 mt-1">
            Active Classrooms
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Academic Standing
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Award size={15} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {avgScore}
          </p>
          <p className="text-[10px] font-bold text-purple-600 mt-1">
            Overall Average
          </p>
        </div>
      </div>

      {/* AI Leadership Insights Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/70 to-indigo-50/40 dark:from-slate-800 dark:to-slate-800/60 border border-blue-200/60 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-blue-600 dark:text-blue-400" />
          <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
            Leadership Operational Insight
          </h4>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
          {analysis?.insight ||
            "Institutional operations are proceeding smoothly. All administrative services, classroom allocations, and faculty cohorts are synchronized and performing within optimal educational benchmarks."}
        </p>
      </div>

      {/* Classes & Enrollment Distribution Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
            Class Cohort Roster & Capacity
          </h3>
          <span className="text-[11px] font-bold text-slate-400">
            {classes.length} Registered Classes
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 overflow-hidden shadow-xs">
          {classes.length === 0 ? (
            <div className="p-6 text-center text-xs font-semibold text-slate-400">
              No registered class cohorts found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/70 dark:bg-slate-800/80 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200/60 dark:border-slate-700">
                    <th className="py-3 px-4">Class Name</th>
                    <th className="py-3 px-4">Section / Code</th>
                    <th className="py-3 px-4 text-center">Enrolled Students</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {classes.slice(0, 10).map((c, i) => (
                    <tr
                      key={c.id || i}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {c.name}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-500">
                        {c.section || c.classCode || "Standard"}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-blue-600 dark:text-blue-400">
                        {c.studentCount || 0}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={10} /> Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

