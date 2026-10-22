"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Download, 
  Trophy, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  BookOpen, 
  Calendar, 
  Clock, 
  LayoutGrid, 
  List, 
  ArrowUpDown, 
  Sparkles, 
  ChevronDown, 
  Info, 
  Lock, 
  Eye, 
  Users, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { useGrades } from '@/lib/api/hooks/useGrades';
import { Grade } from '@/lib/api/services/gradeService';
import { useSessions } from '@/lib/api/hooks/useSessions';
import { useSchoolProfile } from '@/lib/api/hooks/useSchool';
import { useParentStore } from '@/lib/api/hooks/useParentStore';
import { useParentChildren } from '@/lib/api/hooks/useParentChildren';
import { isOfflineGradeRecord, normalizeOfflineCategory } from '@/app/dashboard/admin/offline-grades/components/OfflineGradesDashboard';
import { OfflineAssessmentCategory } from '@/app/dashboard/admin/offline-grades/types';
import { generatePDF } from '@/utils/pdfGenerator';
import { getGradeEvaluation } from '@/utils/gradingSystem';
import { assertSchoolPayingPlan } from '@/utils/subscriptionPlanCheck';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { HeaderTooltip } from '@/app/dashboard/parent/components/dashboard/HeaderTooltip';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export interface ProcessedOfflineGrade extends Grade {
  isComingSoon: boolean;
  isReleased: boolean;
}

function getCategoryBadge(category: OfflineAssessmentCategory) {
  switch (category) {
    case 'CA':
      return {
        label: 'Continuous Assessment',
        shortLabel: 'CA',
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
      };
    case 'QUIZ':
      return {
        label: 'Quiz & Pop Test',
        shortLabel: 'Quiz',
        className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
      };
    case 'MIDTERM':
      return {
        label: 'Mid-Term Exam',
        shortLabel: 'Midterm',
        className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60',
      };
    case 'ASSIGNMENT':
      return {
        label: 'Homework / Project',
        shortLabel: 'Assignment',
        className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800/60',
      };
    case 'EXAM':
      return {
        label: 'Terminal Exam',
        shortLabel: 'Exam',
        className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800/60',
      };
    default:
      return {
        label: 'Assessment',
        shortLabel: 'CA',
        className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      };
  }
}

export default function ParentOfflineGradesPage() {
  const { selectedChildId, setSelectedChildId } = useParentStore();
  const { data: children = [], isLoading: isChildrenLoading } = useParentChildren();

  // Validate that selectedChildId belongs to the current logged-in parent
  useEffect(() => {
    if (children.length > 0) {
      const isValidChild = children.some((c) => c.id === selectedChildId);
      if (!selectedChildId || !isValidChild) {
        setSelectedChildId(children[0].id);
      }
    }
  }, [children, selectedChildId, setSelectedChildId]);

  const activeChildId = selectedChildId || (children.length > 0 ? children[0]?.id : undefined);
  const activeChild = useMemo(() => {
    return children.find((c) => c.id === activeChildId);
  }, [children, activeChildId]);

  const schoolId = activeChild?.school?.id || (activeChild as unknown as { schoolId?: string })?.schoolId || '';
  const { data: sessionsRes, isLoading: isLoadingSessions } = useSessions(schoolId);
  const sessionsData = (sessionsRes?.data || (Array.isArray(sessionsRes) ? sessionsRes : [])) as Array<{
    id: string;
    name?: string;
    term?: string;
    currentTerm?: string;
    isCurrent?: boolean;
    isActive?: boolean;
    status?: string;
  }>;
  const { data: schoolProfile } = useSchoolProfile(schoolId);

  // Fetch all grades for active child
  const { data: gradesResponse, isLoading: isLoadingGrades } = useGrades(activeChildId, { limit: 1000 });

  // Filtering states
  const [selectedSessionId, setSelectedSessionId] = useState<string>('ALL');
  const [selectedTerm, setSelectedTerm] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Auto-select active session & term on initial load
  useEffect(() => {
    if (sessionsData && Array.isArray(sessionsData) && sessionsData.length > 0 && selectedSessionId === 'ALL') {
      const activeSession = sessionsData.find(
        (s) => s.isCurrent === true || s.isActive === true || s.status === 'ACTIVE'
      ) || sessionsData[0];

      if (activeSession) {
        setSelectedSessionId(activeSession.id);
        const term = activeSession.currentTerm || activeSession.term;
        if (term) {
          const upper = term.toUpperCase();
          if (upper.includes('FIRST') || upper === 'TERM1' || upper === '1') setSelectedTerm('FIRST');
          else if (upper.includes('SECOND') || upper === 'TERM2' || upper === '2') setSelectedTerm('SECOND');
          else if (upper.includes('THIRD') || upper === 'TERM3' || upper === '3') setSelectedTerm('THIRD');
        }
      }
    }
  }, [sessionsData, selectedSessionId]);

  // Extract strictly the active child's offline grades
  const allOfflineGrades = useMemo<ProcessedOfflineGrade[]>(() => {
    const rawList = (gradesResponse?.grades || []) as Grade[];

    return rawList
      .filter((g: Grade) => {
        // Strictly only physical classroom offline grades
        if (!isOfflineGradeRecord(g)) return false;
        // Strictly verify grade belongs to the selected child
        if (activeChildId && g.studentId && g.studentId !== activeChildId) return false;
        return true;
      })
      .map((g: Grade) => {
        const rawRelease = (g as unknown as { releaseDate?: string | Date }).releaseDate;
        const isComingSoon = g.status === 'SCHEDULED' || g.score === null || (rawRelease && new Date(rawRelease) > new Date());
        return {
          ...g,
          releaseDate: rawRelease,
          isComingSoon: Boolean(isComingSoon),
          isReleased: !isComingSoon,
        };
      });
  }, [gradesResponse, activeChildId]);

  // Unique subjects list for filter dropdown
  const subjectList = useMemo(() => {
    const subs = new Set<string>();
    allOfflineGrades.forEach((g: ProcessedOfflineGrade) => {
      if (typeof g.subject === 'string' && g.subject.trim()) {
        subs.add(g.subject.trim());
      }
    });
    return Array.from(subs).sort();
  }, [allOfflineGrades]);

  // Filtered grades according to active controls
  const filteredGrades = useMemo<ProcessedOfflineGrade[]>(() => {
    return allOfflineGrades.filter((g: ProcessedOfflineGrade) => {
      // 1. Session Filter
      if (selectedSessionId !== 'ALL' && g.sessionId && g.sessionId !== selectedSessionId) {
        return false;
      }

      // 2. Term Filter
      if (selectedTerm !== 'ALL') {
        const gradeTerm = String(g.term || '').toUpperCase();
        if (gradeTerm !== selectedTerm) return false;
      }

      // 3. Category Filter
      if (selectedCategory !== 'ALL') {
        const cat = normalizeOfflineCategory(g.category || undefined, (g.assessmentType || g.remarks || '') as string);
        if (cat !== selectedCategory) return false;
      }

      // 4. Subject Filter
      if (selectedSubject !== 'ALL') {
        if (g.subject !== selectedSubject) return false;
      }

      // 5. Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const subject = String(g.subject || '').toLowerCase();
        const remarks = String(g.remarks || '').toLowerCase();
        const teacherName = String(g.teacher?.name || '').toLowerCase();
        if (!subject.includes(q) && !remarks.includes(q) && !teacherName.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [allOfflineGrades, selectedSessionId, selectedTerm, selectedCategory, selectedSubject, searchQuery]);

  // Aggregate statistics for filtered grades
  const stats = useMemo(() => {
    const releasedList = filteredGrades.filter((g: ProcessedOfflineGrade) => g.isReleased && typeof g.score === 'number');
    const totalCount = filteredGrades.length;
    const releasedCount = releasedList.length;

    if (releasedCount === 0) {
      return {
        totalCount,
        releasedCount,
        averagePercentage: 0,
        highestScore: 0,
        passCount: 0,
        gradeEvaluation: null,
      };
    }

    let sumPercent = 0;
    let highest = 0;
    let pass = 0;

    releasedList.forEach((g: ProcessedOfflineGrade) => {
      const maxMarks = Number(g.maxMarks) || 100;
      const score = Number(g.score) || 0;
      const pct = (score / maxMarks) * 100;
      sumPercent += pct;
      if (pct > highest) highest = pct;
      if (pct >= 50) pass += 1;
    });

    const averagePercentage = Math.round((sumPercent / releasedCount) * 10) / 10;
    const gradingSystem = (schoolProfile as Record<string, unknown>)?.gradingSystem || (activeChild as unknown as { school?: { gradingSystem?: unknown[] } })?.school?.gradingSystem;
    const gradeEvaluation = getGradeEvaluation(averagePercentage, Array.isArray(gradingSystem) ? gradingSystem : undefined);

    return {
      totalCount,
      releasedCount,
      averagePercentage,
      highestScore: Math.round(highest),
      passCount: pass,
      gradeEvaluation,
    };
  }, [filteredGrades, schoolProfile, activeChild]);

  // PDF Export
  const handleExportPDF = async () => {
    if (!assertSchoolPayingPlan(schoolProfile)) {
      return;
    }

    try {
      setIsExporting(true);
      const childName = activeChild?.name || 'Student';
      const childCode = activeChild?.studentCode || 'N/A';
      const className = activeChild?.currentClass?.name || 'Assigned Class';

      const tableData = filteredGrades.map((g: ProcessedOfflineGrade, idx: number) => {
        const cat = normalizeOfflineCategory(g.category || undefined, (g.assessmentType || g.remarks || '') as string);
        const catBadge = getCategoryBadge(cat);
        const maxMarks = Number(g.maxMarks) || 100;
        const score = g.isReleased && typeof g.score === 'number' ? Number(g.score) : null;
        const pct = score != null ? Math.round((score / maxMarks) * 100) : null;
        const gradingSystem = (schoolProfile as Record<string, unknown>)?.gradingSystem || (activeChild as unknown as { school?: { gradingSystem?: unknown[] } })?.school?.gradingSystem;
        const gradeEval = pct != null ? getGradeEvaluation(pct, Array.isArray(gradingSystem) ? gradingSystem : undefined) : null;
        const dateStr = g.createdAt ? format(new Date(g.createdAt as string), 'dd/MM/yyyy') : '—';

        return [
          String(idx + 1),
          String(g.subject || 'Subject'),
          catBadge.label,
          score != null ? `${score} / ${maxMarks}` : 'PENDING',
          pct != null ? `${pct}%` : '—',
          gradeEval ? `${gradeEval.grade} (${gradeEval.remark})` : '—',
          dateStr,
          String(g.remarks || '—')
        ];
      });

      await generatePDF({
        title: `Offline Continuous Assessment Report — ${childName}`,
        filename: `${childName.replace(/\s+/g, '_')}_Offline_Assessments.pdf`,
        schoolProfile,
        metaData: [
          { label: 'Student Name', value: childName },
          { label: 'Student ID', value: childCode },
          { label: 'Class Cohort', value: className },
          { label: 'Term Session', value: `${selectedTerm} Term` },
          { label: 'Evaluated Marks', value: `${stats.releasedCount} of ${stats.totalCount}` },
          { label: 'CA Average', value: `${stats.averagePercentage}%` },
        ],
        tableHeaders: [
          ['#', 'Subject Course', 'Assessment Type', 'Score / Max', 'Score %', 'WAEC Grade', 'Date Logged', 'Teacher Remarks']
        ],
        tableData
      });
    } catch (err) {
      console.error('[handleExportPDF] PDF generation failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const isLoading = isChildrenLoading || isLoadingGrades || isLoadingSessions;

  if (isLoading) {
    return (
      <div className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6 animate-pulse">
        <Skeleton className="h-28 sm:h-36 w-full rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!isChildrenLoading && children.length === 0) {
    return (
      <div className="w-full max-w-[1600px] mx-auto py-8 animate-in fade-in duration-300">
        <div className="rounded-[24px] bg-gradient-to-br from-orange-50 via-white to-amber-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-orange-950/20 border border-orange-100 dark:border-slate-800 p-6 sm:p-10 shadow-xs text-center max-w-xl mx-auto space-y-4">
          <div className="size-14 rounded-2xl bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto">
            <Users size={28} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            No Children Linked to Account
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Link your child using their school-issued Student Access Code in the Linking Hub to track physical classroom test scores and continuous assessments.
          </p>
          <Link href="/dashboard/parent/linking">
            <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl px-6 h-11 text-xs uppercase tracking-wider mt-2">
              Go to Linking Hub
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const studentName = activeChild?.name || 'Student';
  const studentCode = activeChild?.studentCode || 'N/A';
  const className = activeChild?.currentClass?.name || 'Class Cohort';
  const schoolName = activeChild?.school?.name || (schoolProfile as Record<string, unknown>)?.name as string || '';

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6 animate-in fade-in duration-500">
      
      {/* Multi-Child Switcher Pill Bar (if multiple children exist) */}
      {children.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1.5 mr-1">
            <Users size={13} className="text-orange-500" />
            Selected Child:
          </span>
          <div className="flex items-center gap-2">
            {children.map((child) => {
              const isSelected = activeChildId === child.id;
              return (
                <button
                  key={child.id}
                  onClick={() => setSelectedChildId(child.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border cursor-pointer active:scale-95",
                    isSelected
                      ? "bg-orange-600 text-white border-orange-600 shadow-sm shadow-orange-600/20"
                      : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-orange-400"
                  )}
                >
                  <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: isSelected ? '#fff' : '#ea580c' }} />
                  <span>{child.name}</span>
                  {child.currentClass?.name && (
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full font-semibold",
                      isSelected ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    )}>
                      {child.currentClass.name}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 dark:from-orange-950 dark:via-amber-950 dark:to-slate-900 border border-orange-500/30 p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-orange-600/15">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 dark:bg-orange-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-amber-400/20 dark:bg-orange-500/10 rounded-full blur-2xl translate-y-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/20 shadow-xs">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Classroom Continuous Assessments</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-black/20 text-amber-200 border border-white/10 backdrop-blur-sm">
                <span>{className}</span>
                {schoolName && <span>• {schoolName}</span>}
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
                {studentName}&apos;s Offline Results
              </h1>
              <p className="text-orange-100/90 text-xs sm:text-sm font-medium mt-1 leading-relaxed">
                Direct marksheet grades recorded by subject teachers for continuous assessments, class pop tests, homework assignments, and mid-term assessments.
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={handleExportPDF}
              disabled={isExporting || filteredGrades.length === 0}
              className="bg-white hover:bg-slate-50 dark:hover:bg-zinc-100 text-orange-700 dark:text-orange-800 font-black rounded-xl h-11 sm:h-12 px-6 shadow-lg shadow-black/10 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 active:scale-95 cursor-pointer disabled:opacity-60"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating PDF...' : 'Download Report'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {/* Total Assessments */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Total Recorded</span>
            <FileSpreadsheet className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {stats.totalCount}
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Evaluations on file</p>
        </div>

        {/* Continuous Assessment Average */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">CA Average</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {stats.averagePercentage}%
            </span>
            {stats.gradeEvaluation && (
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                {stats.gradeEvaluation.grade}
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            {stats.gradeEvaluation ? stats.gradeEvaluation.remark : 'Average across tests'}
          </p>
        </div>

        {/* Highest Score Attained */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Highest Score</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {stats.highestScore}%
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Top assessment performance</p>
        </div>

        {/* Released vs Pending */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Released Scores</span>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {stats.releasedCount} <span className="text-xs font-normal text-slate-400">/ {stats.totalCount}</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            {stats.totalCount - stats.releasedCount > 0 ? `${stats.totalCount - stats.releasedCount} pending release` : 'All marks certified'}
          </p>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Search bar */}
          <div className="relative flex-1 group">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
            <input
              type="text"
              placeholder="Search assessment by subject, topic or teacher remarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1.5 self-end lg:self-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-1.5 sm:p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                viewMode === 'grid'
                  ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              )}
            >
              <LayoutGrid size={15} />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                "p-1.5 sm:p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                viewMode === 'table'
                  ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              )}
            >
              <List size={15} />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

        </div>

        {/* Filter dropdowns row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {/* Session filter */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">
              Session
            </label>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="ALL">All Sessions</option>
              {sessionsData.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name || s.id}
                </option>
              ))}
            </select>
          </div>

          {/* Term filter */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">
              Term
            </label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="ALL">All Terms</option>
              <option value="FIRST">1st Term</option>
              <option value="SECOND">2nd Term</option>
              <option value="THIRD">3rd Term</option>
            </select>
          </div>

          {/* Category filter */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">
              Assessment Type
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="CA">Continuous Assessment</option>
              <option value="QUIZ">Quiz &amp; Pop Test</option>
              <option value="MIDTERM">Mid-Term Exam</option>
              <option value="ASSIGNMENT">Homework / Project</option>
              <option value="EXAM">Terminal Exam</option>
            </select>
          </div>

          {/* Subject filter */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="ALL">All Subjects</option>
              {subjectList.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredGrades.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center shadow-sm space-y-3">
          <div className="size-14 rounded-2xl bg-orange-50 dark:bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto">
            <AlertCircle size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No Offline Results Match Current Filters
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Continuous assessment marks, quizzes, and homework scores recorded in the classroom will populate here once published by subject teachers.
          </p>
          {(selectedSessionId !== 'ALL' || selectedTerm !== 'ALL' || selectedCategory !== 'ALL' || selectedSubject !== 'ALL' || searchQuery) && (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedSessionId('ALL');
                setSelectedTerm('ALL');
                setSelectedCategory('ALL');
                setSelectedSubject('ALL');
                setSearchQuery('');
              }}
              className="text-xs font-bold rounded-xl mt-2"
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-in fade-in duration-300">
          {filteredGrades.map((g: ProcessedOfflineGrade) => {
            const cat = normalizeOfflineCategory(g.category || undefined, (g.assessmentType || g.remarks || '') as string);
            const catBadge = getCategoryBadge(cat);
            const maxMarks = Number(g.maxMarks) || 100;
            const score = g.isReleased && typeof g.score === 'number' ? Number(g.score) : null;
            const pct = score != null ? Math.round((score / maxMarks) * 100) : null;
            const gradingSystem = (schoolProfile as Record<string, unknown>)?.gradingSystem || (activeChild as unknown as { school?: { gradingSystem?: unknown[] } })?.school?.gradingSystem;
            const gradeEval = pct != null ? getGradeEvaluation(pct, Array.isArray(gradingSystem) ? gradingSystem : undefined) : null;
            const dateStr = g.createdAt ? format(new Date(g.createdAt as string), 'MMM d, yyyy') : '—';
            const teacherName = (g.teacher as Record<string, unknown>)?.name as string || '';

            return (
              <div 
                key={String(g.id)}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Top Category Badge & Date */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border",
                      catBadge.className
                    )}>
                      {catBadge.label}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <Clock size={11} />
                      {dateStr}
                    </span>
                  </div>

                  {/* Subject Name */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug line-clamp-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      {String(g.subject || 'Subject')}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      {String(g.term || 'Term')} • {(g.session as Record<string, unknown>)?.name as string || 'Session'}
                    </p>
                  </div>

                  {/* Score & Performance Card */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Attained Score
                      </span>
                      {score != null ? (
                        <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                          {score} <span className="text-xs font-bold text-slate-400">/ {maxMarks}</span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs font-bold mt-1">
                          <Eye size={12} /> Pending Release
                        </span>
                      )}
                    </div>

                    {pct != null && gradeEval && (
                      <div className="text-right">
                        <span className={cn(
                          "inline-block px-2.5 py-1 rounded-lg text-xs font-black uppercase",
                          gradeEval.bg,
                          gradeEval.color
                        )}>
                          {gradeEval.grade} ({pct}%)
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                          {gradeEval.remark}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Teacher Remarks */}
                  {g.remarks ? (
                    <div className="text-xs text-slate-600 dark:text-slate-300 bg-orange-50/50 dark:bg-orange-950/20 p-2.5 rounded-xl border border-orange-100 dark:border-orange-900/30">
                      <span className="text-[10px] font-black uppercase text-orange-600 dark:text-orange-400 block mb-0.5">
                        Remarks
                      </span>
                      <p className="line-clamp-2 italic">&ldquo;{String(g.remarks)}&rdquo;</p>
                    </div>
                  ) : null}
                </div>

                {/* Footer: Instructor */}
                {teacherName && (
                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Teacher: <strong className="text-slate-600 dark:text-slate-300 font-semibold">{teacherName}</strong></span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm animate-in fade-in duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Subject Course</th>
                  <th className="px-5 py-3.5">Assessment Category</th>
                  <th className="px-5 py-3.5 text-center">Score / Max</th>
                  <th className="px-5 py-3.5 text-center">Percentage</th>
                  <th className="px-5 py-3.5 text-center">WAEC Grade</th>
                  <th className="px-5 py-3.5">Date Logged</th>
                  <th className="px-5 py-3.5">Teacher Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                {filteredGrades.map((g: ProcessedOfflineGrade) => {
                  const cat = normalizeOfflineCategory(g.category || undefined, (g.assessmentType || g.remarks || '') as string);
                  const catBadge = getCategoryBadge(cat);
                  const maxMarks = Number(g.maxMarks) || 100;
                  const score = g.isReleased && typeof g.score === 'number' ? Number(g.score) : null;
                  const pct = score != null ? Math.round((score / maxMarks) * 100) : null;
                  const gradingSystem = (schoolProfile as Record<string, unknown>)?.gradingSystem || (activeChild as unknown as { school?: { gradingSystem?: unknown[] } })?.school?.gradingSystem;
                  const gradeEval = pct != null ? getGradeEvaluation(pct, Array.isArray(gradingSystem) ? gradingSystem : undefined) : null;
                  const dateStr = g.createdAt ? format(new Date(g.createdAt as string), 'dd/MM/yyyy') : '—';

                  return (
                    <tr 
                      key={String(g.id)} 
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-5 py-4 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                        {String(g.subject || 'Subject')}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border",
                          catBadge.className
                        )}>
                          {catBadge.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center whitespace-nowrap font-black text-slate-800 dark:text-slate-200">
                        {score != null ? `${score} / ${maxMarks}` : <span className="text-amber-500 font-semibold">Pending</span>}
                      </td>
                      <td className="px-5 py-4 text-center whitespace-nowrap font-bold">
                        {pct != null ? `${pct}%` : '—'}
                      </td>
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        {gradeEval ? (
                          <span className={cn(
                            "px-2 py-0.5 rounded-md text-xs font-black uppercase",
                            gradeEval.bg,
                            gradeEval.color
                          )}>
                            {gradeEval.grade}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-400">
                        {dateStr}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        {String(g.remarks || '—')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
