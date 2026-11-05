'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Clock,
  Calendar,
  BookOpen,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Pencil,
  CheckCircle2,
  PlayCircle,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getGradeEvaluation } from '@/utils/gradingSystem';
import { groupByDate } from './materials/utils/dateSectioning';

export interface Assignment {
  id: number;
  title: string;
  dueDate: string;
  rawDate?: string | Date | null;
  status: 'graded' | 'submitted' | 'upcoming' | 'overdue';
  grade?: string;
  maxPoints?: number;
  type?: string;
  link?: string;
}

interface AssignmentsTableProps {
  assignments: Assignment[];
  hasDepartment: boolean;
  pageSize?: number;
  gradingSystem?: any[] | null;
}

// ─── Category sub-tab definitions ─────────────────────────────────────────────
type CategoryKey = 'ALL' | 'CA' | 'Quiz/Test' | 'Exam' | 'Assignment';

const CATEGORY_TABS: { key: CategoryKey; label: string; icon: React.ElementType }[] = [
  { key: 'ALL', label: 'All', icon: FileText },
  { key: 'CA', label: 'CA', icon: ClipboardCheck },
  { key: 'Quiz/Test', label: 'Quiz / Test', icon: Pencil },
  { key: 'Exam', label: 'Exam', icon: GraduationCap },
  { key: 'Assignment', label: 'Assignment', icon: BookOpen },
];

/** Map an assessment's `type` string → CategoryKey */
function resolveCategory(type?: string): CategoryKey {
  if (!type) return 'Exam';
  const t = type.toLowerCase();
  if (t === 'ca' || t === 'continuous assessment') return 'CA';
  if (t === 'quiz' || t === 'test (quiz)' || t.includes('quiz') || t.includes('test')) return 'Quiz/Test';
  if (t === 'assignment') return 'Assignment';
  return 'Exam';
}

// ─── Status badge helper ──────────────────────────────────────────────────────
function getStatusBadgeStyle(status: Assignment['status']) {
  switch (status) {
    case 'graded':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    case 'submitted':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    case 'overdue':
      return 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-800';
    default:
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
  }
}

/** Parse a grade string (e.g. "85/100", "42/50", "78%") and evaluate against the school's grading system */
function resolveAssessmentGradeBadge(gradeStr?: string, customGradingSystem?: any[] | null) {
  if (!gradeStr) return null;
  let percent: number | null = null;

  if (gradeStr.includes('/')) {
    const [scorePart, maxPart] = gradeStr.split('/');
    const score = parseFloat(scorePart);
    const max = parseFloat(maxPart);
    if (!isNaN(score) && !isNaN(max) && max > 0) {
      percent = Math.round((score / max) * 100);
    }
  } else if (gradeStr.includes('%')) {
    const val = parseFloat(gradeStr.replace('%', ''));
    if (!isNaN(val)) percent = Math.round(val);
  } else {
    const val = parseFloat(gradeStr.replace(/[^0-9.]/g, ''));
    if (!isNaN(val)) percent = Math.round(val);
  }

  if (percent == null) {
    return {
      raw: gradeStr,
      grade: null,
      remark: null,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
    };
  }

  const evalResult = getGradeEvaluation(percent, customGradingSystem);
  return {
    raw: gradeStr,
    percentage: percent,
    grade: evalResult.grade,
    remark: evalResult.remark,
    color: evalResult.color,
    bg: evalResult.bg,
  };
}

// ─── Category icon + colour ───────────────────────────────────────────────────
function getCategoryStyle(type?: string) {
  const cat = resolveCategory(type);
  switch (cat) {
    case 'CA':
      return { icon: ClipboardCheck, colour: 'text-violet-500 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/30' };
    case 'Quiz/Test':
      return { icon: Pencil, colour: 'text-sky-500 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-950/30' };
    case 'Exam':
      return { icon: GraduationCap, colour: 'text-pink-500 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-950/30' };
    case 'Assignment':
      return { icon: BookOpen, colour: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' };
    default:
      return { icon: FileText, colour: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' };
  }
}

// ─── Action button logic ──────────────────────────────────────────────────────
function ActionButton({ assignment }: { assignment: Assignment }) {
  const isGraded = assignment.status === 'graded';
  const isSubmitted = assignment.status === 'submitted';
  const isUpcoming = assignment.status === 'upcoming';
  const hasLink = !!assignment.link && assignment.link !== '#';

  // If graded, always allow the student to view their result or score
  if (isGraded) {
    const targetLink = hasLink ? assignment.link! : '/dashboard/student/grades';
    return (
      <Link href={targetLink}>
        <Button
          size="sm"
          className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs gap-1.5 shadow-sm shadow-emerald-600/20"
        >
          <Eye size={13} />
          {assignment.grade ? `View Result (${assignment.grade})` : 'View Result'}
        </Button>
      </Link>
    );
  }

  if (!hasLink) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-8 text-slate-400 border-slate-200 dark:border-slate-800 rounded-lg font-bold text-xs"
        disabled
      >
        Not Available
      </Button>
    );
  }

  if (isSubmitted) {
    return (
      <Link href={assignment.link!}>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950/30 rounded-lg font-bold text-xs gap-1.5"
        >
          <CheckCircle2 size={13} />
          Submitted
        </Button>
      </Link>
    );
  }

  if (isUpcoming) {
    const cat = resolveCategory(assignment.type);
    const isAssignment = cat === 'Assignment';

    return (
      <Link href={assignment.link!}>
        <Button
          size="sm"
          className="h-8 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-bold text-xs gap-1.5 shadow-sm shadow-pink-600/20"
        >
          {isAssignment ? <Pencil size={13} /> : <PlayCircle size={13} />}
          {isAssignment ? 'Submit' : 'Take'}
        </Button>
      </Link>
    );
  }

  // overdue
  return (
    <Link href={assignment.link!}>
      <Button
        variant="outline"
        size="sm"
        className="h-8 text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950/30 rounded-lg font-bold text-xs gap-1.5"
      >
        <AlertCircle size={13} />
        View
      </Button>
    </Link>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AssignmentsTable({
  assignments,
  hasDepartment,
  pageSize = 9,
  gradingSystem,
}: AssignmentsTableProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryTab, setCategoryTab] = useState<CategoryKey>('ALL');

  // Default to grid on mobile
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setViewMode('grid');
    }
  }, []);

  // Count per category (for badges)
  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryKey, number> = { ALL: 0, CA: 0, 'Quiz/Test': 0, Exam: 0, Assignment: 0 };
    assignments.forEach((a) => {
      const cat = resolveCategory(a.type);
      counts[cat]++;
      counts['ALL']++;
    });
    return counts;
  }, [assignments]);

  const filtered = useMemo(() => {
    return assignments.filter((a) => {
      const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || a.status.toLowerCase() === statusFilter.toLowerCase();
      const matchCat = categoryTab === 'ALL' || resolveCategory(a.type) === categoryTab;
      return matchSearch && matchStatus && matchCat;
    });
  }, [assignments, search, statusFilter, categoryTab]);

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1); }, [search, statusFilter, categoryTab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const paginated = filtered.slice(startIdx, startIdx + pageSize);

  // Group paginated items by date
  const groupedSections = useMemo(() => {
    return groupByDate(paginated, (item) => item.rawDate || item.dueDate);
  }, [paginated]);

  return (
    <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 overflow-hidden">
      <CardContent className="p-0">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">Assessments</h2>
              <p className="text-xs sm:text-sm font-medium text-slate-400 mt-0.5">
                {filtered.length} of {assignments.length} items
                {hasDepartment && (
                  <span className="ml-2 px-1.5 py-0.5 rounded bg-pink-100 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 text-[10px] font-bold uppercase tracking-wide">
                    Dept. Scoped
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search assessments..."
                  className="pl-9 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shrink-0">
                <button
                  onClick={() => setViewMode('grid')}
                  type="button"
                  className={`p-1.5 sm:p-2 rounded-lg text-xs font-semibold transition-all ${viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  title="Grid View"
                  aria-label="Grid View"
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  type="button"
                  className={`p-1.5 sm:p-2 rounded-lg text-xs font-semibold transition-all ${viewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  title="Table View"
                  aria-label="Table View"
                >
                  <List size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* ── Category Sub-Tabs ─────────────────────────────────────────── */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {CATEGORY_TABS.map(({ key, label, icon: Icon }) => {
              const count = categoryCounts[key];
              const isActive = categoryTab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategoryTab(key)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all border',
                    isActive
                      ? 'bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800/50 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white'
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {label}
                  {count > 0 && (
                    <span className={cn(
                      'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black',
                      isActive
                        ? 'bg-pink-200 dark:bg-pink-800/50 text-pink-700 dark:text-pink-300'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    )}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Status filter + reset */}
          <div className="flex items-center gap-2 mt-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer shrink-0 shadow-2xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="graded">Graded</option>
              <option value="submitted">Submitted</option>
              <option value="upcoming">Upcoming</option>
              <option value="overdue">Overdue</option>
            </select>

            {(statusFilter !== 'ALL' || search || categoryTab !== 'ALL') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setStatusFilter('ALL'); setSearch(''); setCategoryTab('ALL'); }}
                className="h-9 text-xs font-bold text-pink-600 hover:text-pink-700 dark:text-pink-400 shrink-0"
              >
                Reset Filters
              </Button>
            )}
          </div>
        </div>

        {/* ── Content ───────────────────────────────────────────────────────── */}
        {filtered.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              /* ── Grid View ──────────────────────────────────────────────── */
              <div className="p-4 sm:p-6 space-y-6">
                {groupedSections.map((section) => (
                  <div key={section.label} className="space-y-3">
                    {/* Section Header */}
                    <div className="flex items-center gap-2.5 px-1 py-1">
                      <div className="size-2 rounded-full bg-pink-500" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                        {section.label}
                      </h4>
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full">
                        {section.items.length} {section.items.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>

                    {/* Cards Grid for this date group */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                      {section.items.map((assignment) => {
                        const { icon: CatIcon, colour, bg } = getCategoryStyle(assignment.type);
                        const displayIndex = String(assignment.id).padStart(2, '0');

                        return (
                          <div
                            key={assignment.id}
                            className="bg-slate-50/60 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 transition-all rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 flex flex-col justify-between hover:shadow-md hover:border-pink-500/30 group active:scale-[0.99]"
                          >
                            <div>
                              {/* Title row */}
                              <div className="flex items-start justify-between gap-2.5 mb-3">
                                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                  {/* Category icon badge */}
                                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5', bg)}>
                                    <CatIcon className={cn('w-4.5 h-4.5', colour)} />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                      <span className="text-[10px] font-black text-slate-400 font-mono">#{displayIndex}</span>
                                      <span className={cn('text-[9px] uppercase font-bold tracking-wider', colour)}>
                                        {assignment.type || 'Assessment'}
                                      </span>
                                    </div>
                                    <h4 className="font-bold text-slate-800 dark:text-white text-sm sm:text-[15px] group-hover:text-pink-600 transition-colors line-clamp-2">
                                      {assignment.title}
                                    </h4>
                                  </div>
                                </div>
                                <span className={cn('text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border shrink-0', getStatusBadgeStyle(assignment.status))}>
                                  {assignment.status}
                                </span>
                              </div>

                              {/* Score / Status row */}
                              <div className="flex items-center justify-between py-2 px-3 my-2 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700/60">
                                <span className="text-xs font-semibold text-slate-400">
                                  {assignment.status === 'graded' ? 'Score' : assignment.status === 'submitted' ? 'Status' : 'Deadline'}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  {assignment.status === 'graded' && assignment.grade ? (() => {
                                    const badge = resolveAssessmentGradeBadge(assignment.grade, gradingSystem);
                                    return (
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-white">
                                          {assignment.grade}
                                        </span>
                                        {badge?.grade && (
                                          <span className={cn(
                                            'px-1.5 py-0.5 rounded text-[10px] font-black border uppercase',
                                            badge.bg,
                                            badge.color
                                          )}>
                                            {badge.grade}
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })() : assignment.status === 'submitted' ? (
                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Under Review</span>
                                  ) : assignment.status === 'overdue' ? (
                                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1"><AlertCircle size={11} /> Past Due</span>
                                  ) : (
                                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1"><Clock size={11} /> {assignment.dueDate}</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Action footer */}
                            <div className="pt-2.5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80">
                              <span className="text-[11px] font-medium text-slate-400 truncate max-w-[130px] flex items-center gap-1">
                                <Calendar size={11} className="shrink-0" />
                                {assignment.dueDate}
                              </span>
                              <ActionButton assignment={assignment} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* ── Table View ─────────────────────────────────────────────── */
              <div className="p-4 sm:p-6 space-y-6">
                {groupedSections.map((section) => (
                  <div key={section.label} className="space-y-3">
                    {/* Section Header */}
                    <div className="flex items-center gap-2.5 px-1 py-1">
                      <div className="size-2 rounded-full bg-pink-500" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                        {section.label}
                      </h4>
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full">
                        {section.items.length} {section.items.length === 1 ? 'record' : 'records'}
                      </span>
                    </div>

                    {/* Mobile list for this date group */}
                    <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50 overflow-hidden">
                      {section.items.map((assignment) => {
                        const { icon: CatIcon, colour, bg } = getCategoryStyle(assignment.type);
                        const displayIndex = String(assignment.id).padStart(2, '0');
                        return (
                          <div key={assignment.id} className="p-3.5 space-y-2 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                            <div className="flex items-start justify-between gap-2.5">
                              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0', bg)}>
                                  <CatIcon className={cn('w-4 h-4', colour)} />
                                </div>
                                <div className="min-w-0">
                                  <span className="text-[10px] font-black text-slate-400 font-mono">#{displayIndex}</span>
                                  <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 line-clamp-2">{assignment.title}</h4>
                                  <p className={cn('text-[10px] font-bold uppercase tracking-wide mt-0.5', colour)}>{assignment.type}</p>
                                </div>
                              </div>
                              <span className={cn('text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border shrink-0', getStatusBadgeStyle(assignment.status))}>
                                {assignment.status}
                              </span>
                            </div>
                            <div className="flex items-center justify-between pl-10 text-[11px] text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 shrink-0" />
                                {assignment.dueDate}
                              </span>
                              <div className="flex items-center gap-2">
                                {assignment.grade && (() => {
                                  const badge = resolveAssessmentGradeBadge(assignment.grade, gradingSystem);
                                  return (
                                    <div className="flex items-center gap-1">
                                      <span className="font-bold text-slate-800 dark:text-white">{assignment.grade}</span>
                                      {badge?.grade && (
                                        <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-black border uppercase', badge.bg, badge.color)}>
                                          {badge.grade}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })()}
                                <ActionButton assignment={assignment} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Desktop table for this date group */}
                    <div className="hidden md:block overflow-x-auto no-scrollbar rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                      <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="bg-slate-50/50 dark:bg-slate-800/20 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="px-4 py-3.5 w-12">#</th>
                            <th className="px-4 py-3.5">Assessment</th>
                            <th className="px-4 py-3.5">Type</th>
                            <th className="px-4 py-3.5">Due Date</th>
                            <th className="px-4 py-3.5">Status</th>
                            <th className="px-4 py-3.5 text-center">Score</th>
                            <th className="px-4 py-3.5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                          {section.items.map((assignment) => {
                            const { icon: CatIcon, colour, bg } = getCategoryStyle(assignment.type);
                            const displayIndex = String(assignment.id).padStart(2, '0');
                            return (
                              <tr key={assignment.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                <td className="px-4 py-3.5">
                                  <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-1.5 rounded-md font-mono text-[10px] font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                                    #{displayIndex}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5 font-bold text-slate-700 dark:text-slate-200 max-w-[260px]">
                                  <span className="line-clamp-2">{assignment.title}</span>
                                </td>
                                <td className="px-4 py-3.5">
                                  <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold', bg)}>
                                    <CatIcon className={cn('w-3.5 h-3.5 shrink-0', colour)} />
                                    <span className={colour}>{assignment.type || 'Assessment'}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 font-medium text-xs">
                                  <span className="flex items-center gap-1.5">
                                    <Calendar size={13} className="text-slate-400 shrink-0" />
                                    {assignment.dueDate}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5">
                                  <span className={cn('text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border', getStatusBadgeStyle(assignment.status))}>
                                    {assignment.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5 font-bold text-slate-700 dark:text-slate-200 text-center text-sm">
                                  {assignment.grade ? (() => {
                                    const badge = resolveAssessmentGradeBadge(assignment.grade, gradingSystem);
                                    return (
                                      <div className="inline-flex items-center justify-center gap-1.5">
                                        <span className="font-black text-slate-800 dark:text-white">{assignment.grade}</span>
                                        {badge?.grade && (
                                          <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-black border uppercase shadow-2xs', badge.bg, badge.color)}>
                                            {badge.grade}
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })() : (
                                    <span className="text-slate-300 dark:text-slate-600">—</span>
                                  )}
                                </td>
                                <td className="px-4 py-3.5 text-right">
                                  <ActionButton assignment={assignment} />
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
            )}

            {/* ── Pagination ─────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-500 font-medium">
                {startIdx + 1}–{Math.min(startIdx + pageSize, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} className="h-8 px-2 text-slate-400">
                  <ChevronLeft size={14} />
                </Button>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 px-2">
                  {safePage} / {totalPages}
                </span>
                <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="h-8 px-2 text-slate-400">
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* ── Empty State ──────────────────────────────────────────────── */
          <div className="text-center py-16 px-6">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
              <Calendar className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-800 dark:text-white font-bold text-base mb-1">No Assessments Found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {categoryTab !== 'ALL'
                ? `No ${categoryTab} assessments match your current filters.`
                : 'There are no assessments for this class yet.'}
            </p>
            {(categoryTab !== 'ALL' || statusFilter !== 'ALL' || search) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setCategoryTab('ALL'); setStatusFilter('ALL'); setSearch(''); }}
                className="mt-3 text-pink-600 font-bold text-xs"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}