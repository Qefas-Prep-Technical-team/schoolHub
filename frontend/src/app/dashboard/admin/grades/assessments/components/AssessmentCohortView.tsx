"use client";

import React, { useState, useMemo } from 'react';
import {
  User,
  CheckCircle2,
  TrendingUp,
  Users,
  History,
  FileText,
  Search,
  Download,
  Loader2,
  ChevronRight,
  Award,
  Calendar,
  Layers,
  GraduationCap,
  Sparkles,
  Eye,
  BarChart3,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Pagination from '../../components/Pagination';
import { groupByDate } from '../../utils/dateSectioning';
import { computeGradePill, type GradingTier } from '@/utils/gradingSystem';
import GradeDetailsModal from '@/app/dashboard/teacher/grades/components/GradeDetailsModal';
import type { GradeStatus, StudentGrade } from '@/app/dashboard/teacher/grades/components/types';

interface SubjectAttemptLike {
  id?: string;
  subjectPaperId: string;
  score?: number;
  totalMarks?: number;
  subjectPaper?: {
    id?: string;
    title?: string;
    subject?: { name?: string };
  };
}

interface CohortAttemptLike {
  id: string;
  examId?: string;
  studentId: string;
  status?: string;
  totalScore?: number;
  totalMarks?: number;
  percentage?: number;
  submittedAt?: string | Date | null;
  startedAt?: string | Date | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  className?: string;
  student?: {
    id?: string;
    name?: string;
    studentCode?: string;
    studentId?: string;
    profileImage?: string;
    avatar?: string;
    class?: { name?: string };
    classes?: { class?: { name?: string; section?: string | null } }[];
  };
  subjectExamAttempts?: SubjectAttemptLike[];
  subjectAttempts?: SubjectAttemptLike[];
}

interface AssessmentCohortViewProps {
  exam: any;
  attempts?: any[];
  isLoadingAttempts: boolean;
  papers: { id: string; name: string }[];
  selectedPaperId: string | null;
  setSelectedPaperId: (id: string | null) => void;
  onSelectStudent: (studentId: string) => void;
  onOpenExportModal: () => void;
  primaryColor: string;
  school?: { gradingSystem?: GradingTier[] | null } | null;
}

function getSubAttempts(attempt: CohortAttemptLike): SubjectAttemptLike[] {
  return attempt.subjectExamAttempts || attempt.subjectAttempts || [];
}

function computeAttemptScoreMetrics(
  attempt: CohortAttemptLike,
  selectedPaperId: string | null,
  fallbackMaxMarks: number
): { score: number; maxMarks: number; percent: number } {
  const subs = getSubAttempts(attempt);
  if (selectedPaperId) {
    const match = subs.find((sa) => sa.subjectPaperId === selectedPaperId);
    if (match) {
      const s = match.score ?? 0;
      const m = match.totalMarks || fallbackMaxMarks || 100;
      const p = m > 0 ? Math.round((s / m) * 100) : 0;
      return { score: s, maxMarks: m, percent: p };
    }
  }
  const s = attempt.totalScore ?? 0;
  const m = attempt.totalMarks || fallbackMaxMarks || 100;
  const p =
    attempt.totalMarks && attempt.totalMarks > 0
      ? Math.round((s / m) * 100)
      : Math.round(attempt.percentage ?? s);
  return { score: s, maxMarks: m, percent: p };
}

export function AssessmentCohortView({
  exam,
  attempts,
  isLoadingAttempts,
  papers,
  selectedPaperId,
  setSelectedPaperId,
  onSelectStudent,
  onOpenExportModal,
  primaryColor,
  school,
}: AssessmentCohortViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAttemptForModal, setSelectedAttemptForModal] = useState<CohortAttemptLike | null>(null);
  const itemsPerPage = 10;

  const examClassName = exam?.class?.name ? `Class ${exam.class.name}` : (exam?.scope ? exam.scope.replace('_', ' ') : 'All Classes');

  const filteredAttempts = useMemo<CohortAttemptLike[]>(() => {
    let result = ([...(attempts || [])] as CohortAttemptLike[]);
    if (selectedPaperId) {
      result = result.filter((a) =>
        getSubAttempts(a).some((sa) => sa.subjectPaperId === selectedPaperId)
      );
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (a) =>
          (a.student?.name || '').toLowerCase().includes(q) ||
          (a.student?.studentCode || '').toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => {
      const dateA = a.submittedAt || a.startedAt || a.createdAt || a.updatedAt;
      const dateB = b.submittedAt || b.startedAt || b.createdAt || b.updatedAt;
      const timeA = dateA ? new Date(dateA).getTime() : 0;
      const timeB = dateB ? new Date(dateB).getTime() : 0;
      return (Number.isNaN(timeB) ? 0 : timeB) - (Number.isNaN(timeA) ? 0 : timeA);
    });
  }, [attempts, selectedPaperId, searchTerm]);

  const totalPages = Math.ceil(filteredAttempts.length / itemsPerPage);
  const paginatedAttempts = useMemo(
    () => filteredAttempts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filteredAttempts, currentPage, itemsPerPage]
  );

  const groupedAttempts = useMemo(
    () =>
      groupByDate(
        paginatedAttempts,
        (attempt) => attempt.submittedAt || attempt.startedAt || attempt.createdAt
      ),
    [paginatedAttempts]
  );

  const selectedGradeModalData = useMemo<StudentGrade | null>(() => {
    if (!selectedAttemptForModal) return null;
    const attempt = selectedAttemptForModal;
    const subs = getSubAttempts(attempt);
    const activeSub = selectedPaperId
      ? subs.find((sa) => sa.subjectPaperId === selectedPaperId)
      : subs.length === 1
        ? subs[0]
        : undefined;

    const { score, maxMarks, percent } = computeAttemptScoreMetrics(
      attempt,
      selectedPaperId,
      exam?.totalMarks || 100
    );
    const pill = computeGradePill(percent, school?.gradingSystem);

    const activePaperMeta = selectedPaperId
      ? papers.find((p) => p.id === selectedPaperId)
      : undefined;

    const studentClass =
      attempt.className ||
      exam?.class?.name ||
      attempt.student?.class?.name ||
      (attempt.student?.classes?.[0]?.class?.name
        ? `${attempt.student.classes[0].class.name}${attempt.student.classes[0].class.section
          ? ` (${attempt.student.classes[0].class.section})`
          : ''
        }`
        : null);

    return {
      id: attempt.id,
      studentId: attempt.studentId,
      name: attempt.student?.name || 'Unknown Student',
      studentCode:
        attempt.student?.studentCode || attempt.student?.studentId || 'UID-UNSET',
      subjectPaper:
        activePaperMeta?.name ||
        activeSub?.subjectPaper?.subject?.name ||
        activeSub?.subjectPaper?.title ||
        exam?.title ||
        'Assessment',
      assessmentType: exam?.category || 'ASSESSMENT',
      score: `${score}/${maxMarks}`,
      rawScore: score,
      maxMarks,
      totalScore: `${percent}%`,
      grade: pill.label || '-',
      status: (attempt.status === 'SCORED' || attempt.status === 'SUBMITTED'
        ? 'Graded'
        : 'Pending') as GradeStatus,
      profilePicture:
        attempt.student?.profileImage || attempt.student?.avatar || undefined,
      examId: attempt.examId || exam?.id || null,
      subjectPaperId: selectedPaperId || activeSub?.subjectPaperId || null,
      examAttemptId: attempt.id,
      subjectExamAttemptId: activeSub?.id || null,
      className: studentClass,
      creatorName: 'System Auto-Grader',
      submissionType: 'ONLINE',
      submittedAt: attempt.submittedAt || attempt.startedAt || attempt.createdAt || null,
      createdAt: attempt.createdAt || null,
      updatedAt: attempt.updatedAt || null,
      papers: selectedPaperId ? undefined : papers,
    };
  }, [selectedAttemptForModal, selectedPaperId, exam, school?.gradingSystem, papers]);

  // Compute rich statistical metrics
  const stats = useMemo(() => {
    if (!attempts || attempts.length === 0) {
      return {
        avgScore: 0,
        passRate: 0,
        highestScore: 0,
        lowestScore: 0,
        passedCount: 0,
        failedCount: 0,
        totalQuestions: exam?.totalQuestions || 0,
        totalMarks: exam?.totalMarks || 100,
      };
    }

    const scores = attempts.map((a: any) => {
      if (a.totalMarks && a.totalMarks > 0) {
        return Math.round((a.totalScore / a.totalMarks) * 100);
      }
      return Math.round(a.totalScore || a.percentage || 0);
    });

    const passed = scores.filter(s => s >= 50).length;
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);

    return {
      avgScore: avg,
      passRate: Math.round((passed / scores.length) * 100),
      highestScore: highest,
      lowestScore: lowest,
      passedCount: passed,
      failedCount: scores.length - passed,
      totalQuestions: exam?.totalQuestions || 0,
      totalMarks: exam?.totalMarks || 100,
    };
  }, [attempts, exam]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Hero Banner with Rich Assessment Specification */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary" style={{ color: primaryColor, backgroundColor: `${primaryColor}15` }}>
                {exam?.category || 'ASSESSMENT'}
              </span>
              <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {examClassName}
              </span>
              {exam?.status && (
                <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                  {exam.status}
                </span>
              )}
              {exam?.session?.name && (
                <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                  {exam.session.name}
                </span>
              )}
              {exam?.term && (
                <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                  {exam.term} Term
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {exam?.title || 'Assessment Class Results'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {exam?.description || 'Class academic evaluation, performance analytics, and exportable grade reports.'}
            </p>

            {/* Assessment Specifications Bar */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <Layers size={13} style={{ color: primaryColor }} />
                <span>{exam?.totalPapers || papers.length || 1} Subject Papers</span>
              </span>
              <span className="flex items-center gap-1.5">
                <FileText size={13} style={{ color: primaryColor }} />
                <span>{stats.totalQuestions} Questions Total</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Award size={13} style={{ color: primaryColor }} />
                <span>{stats.totalMarks} Total Points</span>
              </span>
              {exam?.createdAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-slate-400" />
                  <span>Created {format(new Date(exam.createdAt), 'MMM d, yyyy')}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-center min-w-[120px]">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Examinees</p>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {attempts?.length || 0}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-center min-w-[120px]">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Pass Ratio</p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {stats.passRate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* High-Level Analytics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-900 border-2 border-blue-400/50 rounded-3xl p-6 shadow-xl hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 group">
          <TrendingUp className="absolute -right-4 -bottom-4 text-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12" size={120} strokeWidth={1} />
          <div className="relative z-10 text-white">
            <p className="text-xs font-black uppercase tracking-widest text-blue-200 mb-1">Class Average</p>
            <h3 className="text-4xl sm:text-5xl font-black leading-none drop-shadow-md">
              {stats.avgScore}%
            </h3>
            <p className="text-[11px] text-blue-200/80 font-medium mt-2">
              Based on {attempts?.length || 0} student submissions
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-white to-emerald-50 dark:from-slate-900 dark:to-emerald-950/20 border-2 border-emerald-500/30 rounded-3xl p-6 shadow-sm hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-500/60 transition-all duration-300 group">
          <CheckCircle2 className="absolute -right-4 -bottom-4 text-emerald-500/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" size={120} strokeWidth={1} />
          <div className="relative z-10">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-600/70 dark:text-emerald-400/70 mb-1">Passing Rate</p>
            <h3 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white leading-none">
              {stats.passRate}%
            </h3>
            <p className="text-[11px] text-emerald-600/90 dark:text-emerald-400 font-semibold mt-2">
              {stats.passedCount} passed • {stats.failedCount} review
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-white to-purple-50 dark:from-slate-900 dark:to-purple-950/20 border-2 border-purple-500/30 rounded-3xl p-6 shadow-sm hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-500/60 transition-all duration-300 group">
          <Users className="absolute -right-4 -bottom-4 text-purple-500/10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12" size={120} strokeWidth={1} />
          <div className="relative z-10 flex flex-col justify-between h-full">
            <p className="text-xs font-black uppercase tracking-widest text-purple-600/70 dark:text-purple-400/70 mb-1">Total Examinees</p>
            <h3 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white leading-none">
              {attempts?.length || 0}
            </h3>
            <p className="text-[11px] text-purple-600/90 dark:text-purple-400 font-semibold mt-2">
              {examClassName}
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-black border-2 border-slate-700/50 rounded-3xl p-6 shadow-xl hover:-translate-y-1 hover:shadow-2xl hover:shadow-white/10 hover:border-slate-500/60 transition-all duration-300 group text-white">
          <History className="absolute -right-4 -bottom-4 text-white/5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" size={120} strokeWidth={1} />
          <div className="relative z-10 flex flex-col justify-between h-full">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Top Score</p>
            <h3 className="text-4xl sm:text-5xl font-black leading-none text-amber-400 drop-shadow-md">
              {stats.highestScore}%
            </h3>
            <p className="text-[11px] text-slate-400 font-semibold mt-2">
              Lowest: {stats.lowestScore}%
            </p>
          </div>
        </div>
      </div>

      {/* Paper Filter Tabs */}
      {papers.length > 0 && (
        <div className="flex overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar gap-3 lg:grid lg:grid-cols-4 lg:gap-4">
          {papers.map((paper: any) => {
            const isSelected = selectedPaperId === paper.id;
            const paperMetrics = (attempts as CohortAttemptLike[] | undefined)
              ?.map((a) => getSubAttempts(a).find((sa) => sa.subjectPaperId === paper.id))
              .filter((sa): sa is SubjectAttemptLike => Boolean(sa && sa.score !== undefined)) || [];
            const avg =
              paperMetrics.length > 0
                ? Math.round(
                  paperMetrics.reduce((sum, sa) => {
                    const max = sa.totalMarks || 100;
                    return sum + ((sa.score || 0) / max) * 100;
                  }, 0) / paperMetrics.length
                )
                : 0;

            return (
              <div
                key={paper.id}
                onClick={() => { setSelectedPaperId(isSelected ? null : paper.id); setCurrentPage(1); }}
                className={cn(
                  "min-w-[190px] sm:min-w-0 p-4 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden shrink-0 lg:shrink",
                  isSelected
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary/50 shadow-xs"
                )}
                style={{
                  backgroundColor: isSelected ? primaryColor : undefined,
                  borderColor: isSelected ? primaryColor : undefined,
                }}
              >
                <div className="relative z-10 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center border transition-all",
                      isSelected ? "bg-white/20 border-white/30" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    )}
                      style={{ color: isSelected ? undefined : primaryColor }}
                    >
                      <FileText size={16} strokeWidth={2} />
                    </div>
                    <div className={cn(
                      "px-2 py-0.5 rounded text-[11px] font-bold",
                      isSelected ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    )}>
                      {avg}% AVG
                    </div>
                  </div>
                  <div>
                    <p className={cn(
                      "text-[10px] font-bold uppercase tracking-wider mb-0.5",
                      isSelected ? "text-white/80" : "text-slate-400"
                    )}>Subject Paper</p>
                    <h3 className="text-sm font-bold truncate">{paper.name}</h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search examinees by name or code..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-11 pl-11 pr-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-primary transition-all text-xs font-semibold text-slate-900 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">
            Showing {filteredAttempts.length} of {attempts?.length || 0} students
          </span>
        </div>
      </div>

      {/* Examinees List */}
      <div className="space-y-4">
        {isLoadingAttempts ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/50 rounded-3xl p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">
            Loading Cohort Examinees...
          </div>
        ) : paginatedAttempts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-bold uppercase tracking-widest text-xs bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            No examinees found matching your criteria
          </div>
        ) : (
          <>
            {/* Mobile Card List (Date Sectioned) */}
            <div className="md:hidden flex flex-col gap-5">
              {groupedAttempts.map((section) => (
                <div key={`mobile-section-${section.label}`} className="space-y-2.5">
                  <div className="flex items-center gap-2.5 px-1">
                    <div className="size-2 rounded-full bg-indigo-500 shadow-xs" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                      {section.label}
                    </h4>
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full">
                      {section.items.length} {section.items.length === 1 ? 'record' : 'records'}
                    </span>
                    <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                  </div>

                  <div className="flex flex-col gap-3">
                    {section.items.map((attempt) => {
                      const { score, maxMarks, percent: scorePercent } = computeAttemptScoreMetrics(
                        attempt,
                        selectedPaperId,
                        exam?.totalMarks || 100
                      );
                      const isPassed = scorePercent >= 50;
                      const pill = computeGradePill(scorePercent, school?.gradingSystem);

                      return (
                        <div
                          key={attempt.id}
                          onClick={() => setSelectedAttemptForModal(attempt)}
                          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/50 rounded-2xl p-4 flex items-center justify-between shadow-xs cursor-pointer transition-all active:scale-[0.98] hover:border-indigo-300 dark:hover:border-indigo-700"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                              <User size={18} strokeWidth={2.5} />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {attempt.student?.name}
                              </h3>
                              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                                {attempt.student?.studentCode || attempt.student?.studentId || "UID-UNSET"}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-500">
                                {score}/{maxMarks}
                              </span>
                              <span className={cn(
                                "text-base font-black",
                                isPassed ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                              )}>
                                {scorePercent}%
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className={cn("px-2 py-0.5 text-[10px] font-black rounded-md border", pill.bg, pill.color)}>
                                {pill.label}
                              </span>
                              <span className={cn(
                                "px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border",
                                isPassed
                                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30"
                                  : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-900/30"
                              )}>
                                Review
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (Date Sectioned) */}
            <div className="hidden md:flex flex-col gap-6">
              {groupedAttempts.map((section) => (
                <div key={`desktop-section-${section.label}`} className="space-y-3">
                  <div className="flex items-center gap-2.5 px-1">
                    <div className="size-2 rounded-full bg-indigo-500 shadow-xs" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                      {section.label}
                    </h4>
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full">
                      {section.items.length} {section.items.length === 1 ? 'record' : 'records'}
                    </span>
                    <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/50 rounded-3xl overflow-hidden shadow-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200/80 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
                          <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-16 text-center">#</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Details</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Score &amp; Grade</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right pr-6">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                        {section.items.map((attempt) => {
                          const { score, maxMarks, percent: scorePercent } = computeAttemptScoreMetrics(
                            attempt,
                            selectedPaperId,
                            exam?.totalMarks || 100
                          );
                          const globalIdx = paginatedAttempts.indexOf(attempt);
                          const serialNumber = globalIdx + 1 + (currentPage - 1) * itemsPerPage;
                          const isPassed = scorePercent >= 50;
                          const pill = computeGradePill(scorePercent, school?.gradingSystem);

                          return (
                            <tr
                              key={attempt.id}
                              onClick={() => setSelectedAttemptForModal(attempt)}
                              title="Click to view student grades & answer review"
                              className="group border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors relative cursor-pointer"
                            >
                              <td className="p-4 text-center text-xs font-bold text-slate-400">
                                #{serialNumber}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors shrink-0">
                                    <User size={18} strokeWidth={2.5} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                      {attempt.student?.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                                      {attempt.student?.studentCode || attempt.student?.studentId || "UID-UNSET"}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex-1 max-w-[140px] h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                      className={cn("h-full", isPassed ? "bg-emerald-500" : "bg-rose-500")}
                                      style={{ width: `${Math.min(100, Math.max(0, scorePercent))}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-bold text-slate-500">
                                    {score}/{maxMarks}
                                  </span>
                                  <span className={cn(
                                    "text-sm font-black",
                                    isPassed ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                                  )}>
                                    {scorePercent}%
                                  </span>
                                  <span className={cn("px-2 py-0.5 text-[10px] font-black rounded-md border", pill.bg, pill.color)} title={pill.remark}>
                                    {pill.label}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4 text-center">
                                <span className={cn(
                                  "px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md border",
                                  isPassed
                                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30"
                                    : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-900/30"
                                )}>
                                  {isPassed ? "Passed" : "Review"}
                                </span>
                              </td>
                              <td className="p-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="inline-flex items-center gap-1.5">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedAttemptForModal(attempt)}
                                    className="h-8 px-2.5 rounded-xl text-xs font-bold gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-950/40 cursor-pointer"
                                    title="View Grade & Question/Answer Review"
                                  >
                                    <Eye size={13} />
                                    <span>Answers</span>
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onSelectStudent(attempt.studentId)}
                                    className="h-8 px-2.5 rounded-xl text-xs font-bold gap-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                                    title="Open Full Student Result Page"
                                  >
                                    <BarChart3 size={13} />
                                    <ChevronRight className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {filteredAttempts.length > 0 && (
          <div className="pt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredAttempts.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              primaryColor={primaryColor}
            />
          </div>
        )}
      </div>

      <GradeDetailsModal
        isOpen={!!selectedAttemptForModal}
        onClose={() => setSelectedAttemptForModal(null)}
        grade={selectedGradeModalData}
        gradingSystem={school?.gradingSystem}
        onViewFullReport={(grade) => {
          setSelectedAttemptForModal(null);
          onSelectStudent(grade.studentId);
        }}
      />
    </div>
  );
}
