'use client';

import React from 'react';
import { BookOpen, Calendar, GraduationCap, ArrowRight, ShieldCheck, Clock, Building2, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface SubjectResultItem {
  id: string;
  name?: string;
  classId: string;
  class?: { id: string; name: string };
  subjectId: string;
  subject?: { 
    id: string; 
    name: string; 
    code?: string;
    departments?: Array<{ departmentId?: string; department?: { id: string; name: string; code?: string } }>;
  };
  departmentId?: string;
  department?: { id: string; name: string; code?: string };
  sessionId: string;
  session?: { id: string; name: string };
  term: string;
  status: 'PUBLISHED' | 'DRAFT' | string;
  createdById?: string;
  createdAt: string;
}

interface SubjectResultCardProps {
  item: SubjectResultItem;
  currentUserId?: string;
  isAssigned?: boolean;
}

export function SubjectResultCard({ item, currentUserId, isAssigned = false }: SubjectResultCardProps) {
  const router = useRouter();
  const isOwner = item.createdById === currentUserId;
  const canEdit = isAssigned || isOwner;
  const isPublished = item.status === 'PUBLISHED';
  const deptName = item.department?.name || item.subject?.departments?.[0]?.department?.name;

  const handleAction = () => {
    if (canEdit) {
      router.push(`/dashboard/teacher/records/new?id=${item.id}`);
    } else {
      router.push(`/dashboard/teacher/records/preview?id=${item.id}`);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              {item.class?.name || 'Class Assigned'}
            </span>
            {deptName && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/40">
                <Building2 className="w-3 h-3 text-indigo-500" />
                {deptName}
              </span>
            )}
          </div>
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

        {/* Subject Title & Assignment Status */}
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                {item.subject?.name || item.name || 'Subject Final Result'}
              </h3>
              {canEdit ? (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Assigned
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-slate-400">
                  <Lock className="w-2.5 h-2.5" /> Read Only
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {item.session?.name || 'Current Session'} • {item.term} Term
            </p>
          </div>
        </div>
      </div>

      {/* Footer Info & Action */}
      <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-3 mt-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar className="w-3.5 h-3.5" />
          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
        </div>
        <button
          onClick={handleAction}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-sm active:scale-95 ${
            canEdit
              ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-500 text-white hover:bg-emerald-600'
              : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
          }`}
        >
          <span>{canEdit ? 'Edit Sheet' : 'Preview'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
