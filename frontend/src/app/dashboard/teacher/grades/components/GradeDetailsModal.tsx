'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { StudentGrade } from './types';
import { Button } from '@/components/ui/button';
import {
  X,
  User,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Calendar,
  Award,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { computeGradePill, type GradingTier } from '@/utils/gradingSystem';
import GradeQuestionReviewSection from './GradeQuestionReviewSection';

interface GradeDetailsModalProps {
  grade: StudentGrade | null;
  isOpen: boolean;
  onClose: () => void;
  gradingSystem?: GradingTier[] | null;
  passMark?: number;
  onEdit?: (grade: StudentGrade) => void;
  onViewFullReport?: (grade: StudentGrade) => void;
}

function formatDateLabel(dateVal?: string | Date | null): string | null {
  if (!dateVal) return null;
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const GradeDetailsModal: React.FC<GradeDetailsModalProps> = ({
  grade,
  isOpen,
  onClose,
  gradingSystem,
  passMark = 40,
  onEdit,
  onViewFullReport,
}) => {
  if (!grade) return null;

  const pct = grade.maxMarks > 0 ? Math.round((grade.rawScore / grade.maxMarks) * 100) : 0;
  const pill = computeGradePill(pct, gradingSystem);
  const isPass = pct >= passMark;
  const formattedDate = formatDateLabel(grade.submittedAt || grade.createdAt || grade.updatedAt);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Graded':
      case 'PUBLISHED':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-800/50';
      case 'Pending':
      case 'DRAFT':
        return 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-800/50';
      case 'Missing':
        return 'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800/50';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200 dark:text-slate-300 dark:bg-slate-900/20 dark:border-slate-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Graded':
      case 'PUBLISHED':
        return <CheckCircle2 size={14} className="text-emerald-500" />;
      case 'Pending':
      case 'DRAFT':
        return <Clock size={14} className="text-amber-500" />;
      case 'Missing':
        return <AlertCircle size={14} className="text-red-500" />;
      default:
        return null;
    }
  };

  const initials = (grade.name || 'S')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[calc(100vw-1.25rem)] sm:max-w-4xl max-h-[90vh] flex flex-col rounded-3xl p-0 overflow-hidden border border-emerald-100 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-950 z-50 gap-0"
      >
        {/* Top Student & Assessment Header */}
        <div className="bg-emerald-50/90 dark:bg-emerald-950/30 px-5 py-4 sm:px-7 sm:py-5 border-b border-emerald-100 dark:border-emerald-900/50 shrink-0 relative">
          <div className="flex items-start justify-between gap-4 pr-8">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shadow-inner overflow-hidden border-2 border-white dark:border-slate-800 shrink-0">
                {grade.profilePicture ? (
                  <img
                    src={grade.profilePicture}
                    alt={grade.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-black">{initials}</span>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight capitalize truncate">
                    {grade.name}
                  </DialogTitle>
                  <span className="px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700">
                    {grade.studentCode}
                  </span>
                  {grade.className && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100/80 dark:bg-emerald-900/40 text-[10px] font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                      {grade.className}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap mt-1">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <BookOpen size={13} className="text-emerald-600 dark:text-emerald-400" />
                    {grade.subjectPaper}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    {grade.assessmentType}
                  </span>
                  {grade.submissionType && (
                    <>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider',
                          grade.submissionType === 'MANUAL'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                            : grade.submissionType === 'OVERRIDE'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                              : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                        )}
                      >
                        {grade.submissionType}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/70 hover:bg-white dark:bg-slate-900/70 dark:hover:bg-slate-900 text-slate-500"
              aria-label="Close modal"
            >
              <X size={16} />
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* Grade Summary Card */}
          <div className="bg-slate-50/70 dark:bg-slate-900/70 rounded-2xl border border-slate-200/70 dark:border-slate-800 p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
              {/* Score */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Score
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                    {grade.rawScore}
                  </span>
                  <span className="text-sm font-bold text-slate-400">
                    / {grade.maxMarks}
                  </span>
                </div>
              </div>

              {/* Percentage & Pass Indicator */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Percentage
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'text-xl font-black leading-none',
                      isPass ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
                    )}
                  >
                    {pct}%
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-black uppercase px-2 py-0.5 rounded-full',
                      isPass
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                    )}
                  >
                    {isPass ? 'Pass' : 'Below Pass'}
                  </span>
                </div>
              </div>

              {/* Letter Grade & Remark */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Grade
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black border',
                      pill.bg,
                      pill.color
                    )}
                  >
                    <Award size={12} />
                    <span>{pill.label || grade.grade}</span>
                  </span>
                  {pill.remark && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {pill.remark}
                    </span>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="sm:text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Status
                </p>
                <div
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border',
                    getStatusColor(grade.status)
                  )}
                >
                  {getStatusIcon(grade.status)}
                  {grade.status}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  isPass ? 'bg-emerald-500' : 'bg-rose-500'
                )}
                style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
              />
            </div>

            {/* Evaluator & Timestamp Row */}
            {(grade.creatorName || formattedDate) && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                {grade.creatorName && (
                  <span className="inline-flex items-center gap-1.5 font-semibold">
                    <User size={13} className="text-slate-400" />
                    Recorded / Reviewed by:{' '}
                    <strong className="text-slate-700 dark:text-slate-200">
                      {grade.creatorName}
                    </strong>
                  </span>
                )}
                {formattedDate && (
                  <span className="inline-flex items-center gap-1.5 font-semibold">
                    <Calendar size={13} className="text-slate-400" />
                    {formattedDate}
                  </span>
                )}
              </div>
            )}

            {/* Teacher Remarks */}
            {grade.remarks && grade.remarks !== 'MANUAL_OVERRIDE' && (
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Remarks
                </p>
                <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 italic bg-white dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  &ldquo;{grade.remarks}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Question-by-Question Student Answers & Review Section */}
          <GradeQuestionReviewSection
            studentId={grade.studentId}
            examId={grade.examId}
            subjectPaperId={grade.subjectPaperId}
            subjectExamAttemptId={grade.subjectExamAttemptId}
            preloadedQuestions={grade.preloadedQuestions}
            papers={grade.papers}
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 sm:px-7 bg-slate-50/90 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-end gap-2.5 shrink-0">
          {onViewFullReport && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onViewFullReport(grade)}
              className="rounded-xl text-xs font-bold gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-950/30"
            >
              <BarChart3 size={13} />
              Full Analytics Report
            </Button>
          )}
          {onEdit && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onEdit(grade)}
              className="rounded-xl text-xs font-bold gap-1.5 border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-950/30"
            >
              <Edit2 size={13} />
              Edit / Override Score
            </Button>
          )}
          <Button
            type="button"
            onClick={onClose}
            className="rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GradeDetailsModal;
