'use client';

import React from 'react';
import { User, Award, ShieldCheck, Clock, ArrowRight, GraduationCap } from 'lucide-react';

export interface StudentResultItem {
  id: string;
  studentId: string;
  student?: { id: string; name: string };
  classId: string;
  class?: { id: string; name: string };
  sessionId: string;
  session?: { id: string; name: string };
  term: string;
  averageScore?: number | null;
  position?: number | null;
  status: 'PUBLISHED' | 'DRAFT' | string;
  createdAt: string;
}

interface StudentResultCardProps {
  item: StudentResultItem;
  onViewReport?: (item: StudentResultItem) => void;
}

export function StudentResultCard({ item, onViewReport }: StudentResultCardProps) {
  const isPublished = item.status === 'PUBLISHED';
  const positionSuffix = (pos: number) => {
    const v = pos % 100;
    return ['th', 'st', 'nd', 'rd'][(v - 20) % 10] || ['th', 'st', 'nd', 'rd'][v] || 'th';
  };

  return (
    <div className="bg-white dark:bg-emerald-950/40 rounded-2xl border border-slate-200/80 dark:border-emerald-800/40 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-emerald-900/40 text-slate-700 dark:text-emerald-300">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            {item.class?.name || 'Assigned Class'}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${
              isPublished
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/40'
            }`}
          >
            {isPublished ? (
              <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            )}
            {item.status}
          </span>
        </div>

        {/* Scholar Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-sm shrink-0 border border-slate-200/60 dark:border-emerald-700/40">
            {item.student?.name ? item.student.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
              {item.student?.name || 'Enrolled Student'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {item.session?.name || 'Session'} • {item.term} Term
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-emerald-800/20 mb-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Average Score
            </span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
              {item.averageScore != null ? `${item.averageScore}%` : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Class Rank
            </span>
            <div className="flex items-center gap-1 text-sm font-black text-slate-800 dark:text-slate-200">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {item.position ? `${item.position}${positionSuffix(item.position)}` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <button
          onClick={() => onViewReport?.(item)}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-emerald-800/50 bg-white dark:bg-emerald-900/30 text-slate-700 dark:text-slate-200 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 dark:hover:bg-emerald-600 active:scale-95 shadow-sm"
        >
          <span>View Report Card</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
