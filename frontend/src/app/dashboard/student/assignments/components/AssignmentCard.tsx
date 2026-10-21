'use client';

import Link from 'next/link';
import { Assignment } from './types';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  BookOpen, 
  User as UserIcon, 
  Paperclip, 
  Award,
  Hourglass
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Props {
  assignment: Assignment;
  viewMode: 'grid' | 'list';
  onClick?: () => void;
  index?: number;
}

export default function AssignmentCard({ assignment, viewMode, onClick, index }: Props) {
  const isGraded = assignment.status === 'graded';
  const isSubmitted = assignment.status === 'submitted';
  const isOverdue = assignment.status === 'overdue';
  const isPending = assignment.status === 'pending';

  const getStatusBadge = () => {
    if (isGraded) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold border border-emerald-200/80 dark:border-emerald-800/60 uppercase tracking-wider">
          <CheckCircle2 className="h-3 w-3" />
          Graded
        </span>
      );
    }
    if (isSubmitted) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-[11px] font-bold border border-blue-200/80 dark:border-blue-800/60 uppercase tracking-wider">
          <Hourglass className="h-3 w-3" />
          Submitted
        </span>
      );
    }
    if (isOverdue) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-[11px] font-bold border border-rose-200/80 dark:border-rose-950/60 uppercase tracking-wider">
          <AlertCircle className="h-3 w-3" />
          Overdue
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[11px] font-bold border border-amber-200/80 dark:border-amber-900/60 uppercase tracking-wider">
        <Clock className="h-3 w-3" />
        Pending
      </span>
    );
  };

  const getBorderAccent = () => {
    if (isGraded) return 'hover:border-emerald-500/50';
    if (isSubmitted) return 'hover:border-blue-500/50';
    if (isOverdue) return 'hover:border-rose-500/50';
    return 'hover:border-pink-500/50';
  };

  const formattedDueDate = (() => {
    if (!assignment.dueDate) return 'No due date';
    try {
      const d = new Date(assignment.dueDate);
      if (isNaN(d.getTime())) return assignment.dueDate;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return assignment.dueDate;
    }
  })();

  const displayIndex = index !== undefined ? String(index).padStart(2, '0') : undefined;

  if (viewMode === 'list') {
    return (
      <Link
        href={`/dashboard/student/assignments/${assignment.id}`}
        onClick={onClick}
        className={cn(
          "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-all group",
          getBorderAccent()
        )}
      >
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          {displayIndex && (
            <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-1.5 rounded-md font-mono text-[10px] font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shrink-0 mt-0.5">
              #{displayIndex}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-bold text-pink-600 dark:text-pink-400">
                {assignment.subject || 'General'}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {assignment.instructor || 'Class Instructor'}
              </span>
            </div>

            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors line-clamp-1">
              {assignment.title}
            </h3>

            {assignment.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                {assignment.description}
              </p>
            )}

            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1 font-medium">
                <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                Due: {formattedDueDate}
              </span>
              {assignment.attachments && assignment.attachments > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  <Paperclip className="h-3 w-3" />
                  {assignment.attachments} file{assignment.attachments > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {isGraded && assignment.grade ? (
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-400">Score</p>
                <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{assignment.grade}</p>
              </div>
            ) : null}
            {getStatusBadge()}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-3 rounded-xl font-bold text-xs text-pink-600 group-hover:bg-pink-50 dark:group-hover:bg-pink-950/40 gap-1 shrink-0"
          >
            <span>Open</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </Link>
    );
  }

  // Grid Card View
  return (
    <Link
      href={`/dashboard/student/assignments/${assignment.id}`}
      onClick={onClick}
      className={cn(
        "flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 hover:shadow-lg transition-all group active:scale-[0.99]",
        getBorderAccent()
      )}
    >
      <div>
        {/* Top Header: Numbering, Subject, Status Badge */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {displayIndex && (
              <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-1.5 rounded-md font-mono text-[10px] font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shrink-0">
                #{displayIndex}
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 text-xs font-bold truncate">
              <BookOpen className="h-3 w-3 shrink-0" />
              <span className="truncate">{assignment.subject || 'General'}</span>
            </span>
          </div>
          {getStatusBadge()}
        </div>

        {/* Title */}
        <h3 className="font-black text-slate-900 dark:text-white text-base sm:text-lg group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors line-clamp-2 leading-snug mb-1.5" title={assignment.title}>
          {assignment.title}
        </h3>

        {/* Description or Instructor */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
          {assignment.description || `Coursework assigned by ${assignment.instructor || 'instructor'}.`}
        </p>

        {/* Due Date & Attachment Metadata */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 py-2 border-y border-slate-100 dark:border-slate-800/80">
          <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Due:</span>
          <span>{formattedDueDate}</span>
          {assignment.attachments && assignment.attachments > 0 && (
            <>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-slate-500">
                <Paperclip className="h-3 w-3" />
                {assignment.attachments}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Card Footer: Score/Status & Open action */}
      <div className="mt-4 pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80">
        <div>
          {isGraded && assignment.grade ? (
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Grade Achieved</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                {assignment.grade}
              </span>
            </div>
          ) : isSubmitted ? (
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              Under Review
            </span>
          ) : isOverdue ? (
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
              Action Overdue
            </span>
          ) : (
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              Incomplete Task
            </span>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 rounded-xl border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-200 group-hover:bg-pink-600 group-hover:text-white group-hover:border-pink-600 transition-colors gap-1"
        >
          <span>View Task</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </Link>
  );
}
