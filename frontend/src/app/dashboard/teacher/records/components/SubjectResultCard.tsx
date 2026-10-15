'use client';

import React from 'react';
import { BookOpen, Calendar, GraduationCap, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface SubjectResultItem {
  id: string;
  name?: string;
  classId: string;
  class?: { id: string; name: string };
  subjectId: string;
  subject?: { id: string; name: string; code?: string };
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
}

export function SubjectResultCard({ item, currentUserId }: SubjectResultCardProps) {
  const router = useRouter();
  const isOwner = item.createdById === currentUserId;
  const isPublished = item.status === 'PUBLISHED';

  const handleAction = () => {
    if (isOwner) {
      router.push(`/dashboard/teacher/records/new?id=${item.id}`);
    } else {
      router.push(`/dashboard/teacher/records/preview?id=${item.id}`);
    }
  };

  return (
    <div className="bg-white dark:bg-emerald-950/40 rounded-2xl border border-slate-200/80 dark:border-emerald-800/40 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-emerald-900/40 text-slate-700 dark:text-emerald-300">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            {item.class?.name || 'Class Assigned'}
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

        {/* Subject Title */}
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
              {item.subject?.name || item.name || 'Subject Final Result'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {item.session?.name || 'Current Session'} • {item.term} Term
            </p>
          </div>
        </div>
      </div>

      {/* Footer Info & Action */}
      <div className="pt-3 border-t border-slate-100 dark:border-emerald-800/30 flex items-center justify-between gap-3 mt-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar className="w-3.5 h-3.5" />
          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
        </div>
        <button
          onClick={handleAction}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-emerald-800/50 bg-white dark:bg-emerald-900/30 text-slate-700 dark:text-slate-200 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 dark:hover:bg-emerald-600 active:scale-95 shadow-sm"
        >
          <span>{isOwner ? 'Edit Sheet' : 'Preview'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
