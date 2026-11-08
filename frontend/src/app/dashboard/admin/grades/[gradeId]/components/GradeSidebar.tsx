"use client";

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GradeSidebarProps {
  grade: any;
  initials: string;
  letterGrade: {
    letter: string;
    label: string;
    color: string;
  };
}

export function GradeSidebar({ grade, initials, letterGrade }: GradeSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Student Profile Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Student Record
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
            {grade.student?.studentCode || "NO CODE"}
          </span>
        </div>

        <div className="flex flex-col items-center text-center space-y-3">
          <div className="size-20 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-xs">
            {grade.student?.profileImage ? (
              <img 
                src={grade.student.profileImage} 
                alt={grade.student.name} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <span className="text-xl font-black text-slate-500">
                {initials}
              </span>
            )}
          </div>

          <div>
            <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {grade.student?.name || "Unknown Student"}
            </h4>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              {grade.class?.name || "Class unassigned"}
              {grade.student?.gradeLevel ? ` · Level ${grade.student.gradeLevel}` : ""}
            </p>
          </div>

          {grade.studentId && (
            <Link
              href={`/dashboard/admin/students/${grade.studentId}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 transition-colors"
            >
              <span>View Student Profile</span>
              <ArrowUpRight size={13} />
            </Link>
          )}
        </div>
      </div>

      {/* Grading System Scale Reference Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-amber-500" />
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
            Grading Scale Reference
          </h4>
        </div>

        <div className="space-y-2 text-xs">
          {[
            { grade: "A+", range: "90% - 100%", desc: "Outstanding", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" },
            { grade: "A", range: "80% - 89%", desc: "Excellent", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" },
            { grade: "B", range: "70% - 79%", desc: "Very Good", color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40" },
            { grade: "C", range: "60% - 69%", desc: "Good", color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40" },
            { grade: "D", range: "50% - 59%", desc: "Pass", color: "text-orange-600 bg-orange-50 dark:bg-orange-950/40" },
            { grade: "F", range: "< 50%", desc: "Needs Work", color: "text-rose-600 bg-rose-50 dark:bg-rose-950/40" },
          ].map((tier) => (
            <div 
              key={tier.grade} 
              className={cn(
                "flex items-center justify-between p-2 rounded-xl transition-all",
                letterGrade.letter === tier.grade ? "ring-2 ring-indigo-500/50 font-bold bg-indigo-50/50 dark:bg-indigo-950/30" : ""
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn("size-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0", tier.color)}>
                  {tier.grade}
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{tier.desc}</span>
              </div>
              <span className="font-mono text-[11px] text-slate-500">{tier.range}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

