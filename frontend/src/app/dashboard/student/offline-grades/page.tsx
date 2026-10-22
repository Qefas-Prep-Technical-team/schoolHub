"use client";

import React, { useState, useMemo } from 'react';
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
  HelpCircle,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Info,
  Lock,
  Eye
} from 'lucide-react';
import { useGrades } from '@/lib/api/hooks/useGrades';
import { useSessions } from '@/lib/api/hooks/useSessions';
import { useStudentProfile } from '@/lib/api/hooks/useStudent';
import { useSchoolProfile } from '@/lib/api/hooks/useSchool';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { isOfflineGradeRecord, normalizeOfflineCategory } from '@/app/dashboard/admin/offline-grades/components/OfflineGradesDashboard';
import { OfflineAssessmentCategory } from '@/app/dashboard/admin/offline-grades/types';
import { generatePDF } from '@/utils/pdfGenerator';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { getGradeEvaluation } from '@/utils/gradingSystem';

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
        label: 'Quiz & Test',
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

export default function StudentOfflineGradesPage() {
  const { user } = useAuthStore();
  const { data: studentProfile } = useStudentProfile();
  const schoolId = studentProfile?.schoolId || user?.schools?.[0]?.schoolId || '';
  const { data: sessionsRes, isLoading: isLoadingSessions } = useSessions(schoolId);
  const sessionsData = sessionsRes?.data || (Array.isArray(sessionsRes) ? sessionsRes : []);
  const { data: schoolProfile } = useSchoolProfile(schoolId);

  // Fetch all grades for current student (1000 limit)
  const { data: gradesResponse, isLoading: isLoadingGrades } = useGrades(undefined, { limit: 1000 });

  // Filtering states
  const [selectedSessionId, setSelectedSessionId] = useState<string>('ALL');
  const [selectedTerm, setSelectedTerm] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Auto-select active session & term on initial load
  React.useEffect(() => {
    if (sessionsData && Array.isArray(sessionsData) && sessionsData.length > 0 && selectedSessionId === 'ALL') {
      const activeSession = sessionsData.find(
        (s: any) => s.isCurrent === true || s.isActive === true || s.status === 'ACTIVE'
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

  // Extract strictly the student's own offline grades
  const allOfflineGrades = useMemo(() => {
    const rawList = gradesResponse?.grades || [];
    const myStudentId = studentProfile?.id || user?.id;

    return rawList
      .filter((g: any) => {
        // Strictly only physical classroom offline grades
        if (!isOfflineGradeRecord(g)) return false;
        // Strictly verify grade belongs to the authenticated student
        if (myStudentId && g.studentId && g.studentId !== myStudentId) return false;
        return true;
      })
      .map((g: any) => {
        const isComingSoon = g.status === 'SCHEDULED' || g.score === null || (g.releaseDate && new Date(g.releaseDate) > new Date());
        return {
          ...g,
          isComingSoon,
          isReleased: !isComingSoon,
        };
      });
  }, [gradesResponse, studentProfile?.id, user?.id]);

  // Unique subjects list for filter dropdown
  const subjectList = useMemo(() => {
    const subs = new Set<string>();
    allOfflineGrades.forEach((g: any) => {
      if (g.subject) subs.add(g.subject.trim());
    });
    return Array.from(subs).sort();
  }, [allOfflineGrades]);

  // Filtered grades according to active controls
  const filteredGrades = useMemo(() => {
    return allOfflineGrades.filter((g: any) => {
      // 1. Session Filter
      if (selectedSessionId !== 'ALL' && g.sessionId && g.sessionId !== selectedSessionId) {
        return false;
      }

      // 2. Term Filter
      if (selectedTerm !== 'ALL') {
        const itemTerm = (g.term || '').toUpperCase();
        if (itemTerm && !itemTerm.includes(selectedTerm)) {
          return false;
        }
      }

      // 3. Category Filter
      if (selectedCategory === 'RELEASED') {
        if (!g.isReleased) return false;
      } else if (selectedCategory === 'COMING_SOON') {
        if (!g.isComingSoon) return false;
      } else if (selectedCategory !== 'ALL') {
        const cat = normalizeOfflineCategory(g.category, g.assessmentType);
        if (cat !== selectedCategory) return false;
      }

      // 4. Subject Filter
      if (selectedSubject !== 'ALL' && g.subject?.trim().toLowerCase() !== selectedSubject.toLowerCase()) {
        return false;
      }

      // 5. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const subjectMatch = (g.subject || '').toLowerCase().includes(q);
        const titleMatch = (g.assessmentType || '').toLowerCase().includes(q);
        const remarksMatch = (g.remarks || '').toLowerCase().includes(q);
        if (!subjectMatch && !titleMatch && !remarksMatch) {
          return false;
        }
      }

      return true;
    });
  }, [allOfflineGrades, selectedSessionId, selectedTerm, selectedCategory, selectedSubject, searchQuery]);

  // KPI Computations
  const stats = useMemo(() => {
    if (filteredGrades.length === 0) {
      return { total: 0, releasedCount: 0, comingSoonCount: 0, averagePercent: 0, highestPercent: 0, highestSubject: '', passCount: 0, passRate: 0 };
    }

    let totalScoreSum = 0;
    let totalMaxSum = 0;
    let highestPct = 0;
    let highestSub = '';
    let passCount = 0;
    let releasedCount = 0;
    let comingSoonCount = 0;

    filteredGrades.forEach((g: any) => {
      if (g.isComingSoon) {
        comingSoonCount += 1;
        return;
      }

      releasedCount += 1;
      const score = Number(g.score) || 0;
      const max = Number(g.maxMarks) || 100;
      const pct = max > 0 ? (score / max) * 100 : 0;

      totalScoreSum += score;
      totalMaxSum += max;

      if (pct > highestPct) {
        highestPct = pct;
        highestSub = g.subject || 'Assessment';
      }

      if (pct >= 50) {
        passCount += 1;
      }
    });

    const averagePercent = totalMaxSum > 0 ? Math.round((totalScoreSum / totalMaxSum) * 100) : 0;
    const passRate = releasedCount > 0 ? Math.round((passCount / releasedCount) * 100) : 0;

    return {
      total: filteredGrades.length,
      releasedCount,
      comingSoonCount,
      averagePercent,
      highestPercent: Math.round(highestPct),
      highestSubject: highestSub,
      passCount,
      passRate
    };
  }, [filteredGrades]);

  // Handle PDF Export
  const handleExportPDF = () => {
    if (filteredGrades.length === 0) return;

    const sessionObj = Array.isArray(sessionsData) 
      ? sessionsData.find((s: any) => s.id === selectedSessionId) 
      : null;
    const sessionName = sessionObj?.name || 'All Sessions';
    const termLabel = selectedTerm !== 'ALL' ? `${selectedTerm} Term` : 'All Terms';

    generatePDF({
      title: 'Student Offline Continuous Assessment & Grades Transcript',
      filename: `Offline_Grades_${studentProfile?.studentCode || 'Student'}.pdf`,
      schoolProfile,
      orientation: 'landscape',
      metaData: [
        { label: 'Student Name', value: studentProfile?.name || user?.name || 'Student' },
        { label: 'Student Code', value: studentProfile?.studentCode || 'N/A' },
        { label: 'Academic Session', value: sessionName },
        { label: 'Academic Term', value: termLabel },
        { label: 'Assessments Recorded', value: String(filteredGrades.length) },
        { label: 'Released Assessments', value: String(stats.releasedCount) },
        { label: 'Overall Average (Released)', value: `${stats.averagePercent}%` },
      ],
      tableHeaders: [['#', 'Subject', 'Assessment Title', 'Category', 'Score Obtained', 'Max Marks', '% Score', 'Status / Grade', 'Teacher Remarks']],
      tableData: filteredGrades.map((g: any, idx: number) => {
        const cat = normalizeOfflineCategory(g.category, g.assessmentType);
        const score = g.isComingSoon ? '—' : String(Number(g.score) || 0);
        const max = String(Number(g.maxMarks) || 100);
        const pct = g.isComingSoon ? 'Pending' : `${Math.round(((Number(g.score) || 0) / (Number(g.maxMarks) || 100)) * 100)}%`;
        const gradeInfo = g.isComingSoon ? null : getGradeEvaluation(Number(pct.replace('%', '')), schoolProfile?.gradingSystem);
        const statusOrGrade = g.isComingSoon 
          ? `Coming Soon (${g.releaseDate ? format(new Date(g.releaseDate), 'MMM d, yyyy') : 'Scheduled'})` 
          : `${gradeInfo?.grade} (${gradeInfo?.remark})`;

        return [
          String(idx + 1),
          g.subject || 'N/A',
          g.assessmentType || `${cat} Mark`,
          cat,
          score,
          max,
          pct,
          statusOrGrade,
          g.remarks || 'Satisfactory'
        ];
      })
    });
  };

  const categories = [
    { key: 'ALL', label: 'All Assessments' },
    { key: 'RELEASED', label: 'Released Results', count: stats.releasedCount },
    { key: 'COMING_SOON', label: 'Coming Soon / Scheduled', count: stats.comingSoonCount },
    { key: 'CA', label: 'Continuous Assessment (CA)' },
    { key: 'QUIZ', label: 'Quizzes & Class Tests' },
    { key: 'MIDTERM', label: 'Mid-Term Exams' },
    { key: 'ASSIGNMENT', label: 'Homework & Projects' },
    { key: 'EXAM', label: 'Terminal Exams' },
  ];

  return (
    <div className="w-full space-y-6 pb-12 font-sans">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 rounded-xl">
              <FileSpreadsheet className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Offline Grades & Continuous Assessments
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Official classroom test scores, homework marks, lab exercises, midterms, and terminal examination records entered by your teachers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Session Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer pr-2"
            >
              <option value="ALL" className="dark:bg-slate-900">All Sessions</option>
              {Array.isArray(sessionsData) && sessionsData.map((s: any) => (
                <option key={s.id} value={s.id} className="dark:bg-slate-900">
                  {s.name} {s.isCurrent ? '(Current)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Term Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer pr-2"
            >
              <option value="ALL" className="dark:bg-slate-900">All Terms</option>
              <option value="FIRST" className="dark:bg-slate-900">1st Term</option>
              <option value="SECOND" className="dark:bg-slate-900">2nd Term</option>
              <option value="THIRD" className="dark:bg-slate-900">3rd Term</option>
            </select>
          </div>

          {/* Export PDF Button */}
          <Button
            onClick={handleExportPDF}
            disabled={filteredGrades.length === 0}
            className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Export Transcript</span>
          </Button>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* Card 1: Total Recorded */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total Assessments</span>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white">{stats.total}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3 h-3" /> {stats.releasedCount} Released
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                <Clock className="w-3 h-3" /> {stats.comingSoonCount} Upcoming
              </span>
            </p>
          </div>
        </div>

        {/* Card 2: Cumulative Average */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Cumulative Average</span>
            <div className="p-2.5 bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
              {stats.averagePercent}%
              <span className="text-xs font-bold text-slate-400">released average</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Grade Tier: <span className="font-bold text-slate-700 dark:text-slate-200">{getGradeEvaluation(stats.averagePercent, schoolProfile?.gradingSystem).remark}</span>
            </p>
          </div>
        </div>

        {/* Card 3: Highest Score */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Highest Score</span>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 flex items-baseline gap-1">
              {stats.highestPercent}%
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
              In <span className="font-bold text-slate-700 dark:text-slate-200">{stats.highestSubject || 'N/A'}</span>
            </p>
          </div>
        </div>

        {/* Card 4: Pass Rate */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Passed Marks</span>
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
              {stats.passRate}%
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{stats.passCount}</span> of {stats.releasedCount} released &ge; 50%
            </p>
          </div>
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((c: any) => {
          const isActive = selectedCategory === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setSelectedCategory(c.key)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border shrink-0 flex items-center gap-1.5",
                isActive
                  ? "bg-slate-900 text-white dark:bg-pink-600 dark:text-white border-transparent shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              <span>{c.label}</span>
              {c.count !== undefined && (
                <span className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px] font-black",
                  isActive 
                    ? "bg-white/20 text-white" 
                    : c.key === 'COMING_SOON' 
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" 
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                )}>
                  {c.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search, Subject Filter & View Toggle Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm w-full">
        <div className="flex flex-1 items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search subject, assessment name, or feedback..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-pink-500 transition-colors"
            />
          </div>

          {/* Subject Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer max-w-[150px] truncate"
            >
              <option value="ALL" className="dark:bg-slate-900">All Subjects</option>
              {subjectList.map((sub) => (
                <option key={sub} value={sub} className="dark:bg-slate-900">{sub}</option>
              ))}
            </select>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 self-end sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            title="Grid View"
            className={cn(
              "p-1.5 rounded-lg transition-all",
              viewMode === 'grid'
                ? "bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-400 shadow-xs"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            title="Table View"
            className={cn(
              "p-1.5 rounded-lg transition-all",
              viewMode === 'table'
                ? "bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-400 shadow-xs"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Rendering: Loading / Empty / Grid / Table */}
      {isLoadingGrades ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-pulse">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-24 rounded-md" />
                <Skeleton className="h-6 w-12 rounded-md" />
              </div>
              <Skeleton className="h-5 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
              <div className="space-y-2 pt-2">
                <Skeleton className="h-2 w-full rounded-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredGrades.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center space-y-4 shadow-sm w-full">
          <div className="w-16 h-16 bg-pink-50 dark:bg-pink-950/50 rounded-2xl flex items-center justify-center mx-auto text-pink-500">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Offline Grades Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              You currently have no offline Continuous Assessments (CA), quizzes, homework, or exam marks recorded for this session and term. Once your teachers enter and publish your scores, they will appear right here.
            </p>
          </div>
          {(selectedCategory !== 'ALL' || selectedSubject !== 'ALL' || searchQuery) && (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCategory('ALL');
                setSelectedSubject('ALL');
                setSearchQuery('');
              }}
              className="text-xs rounded-xl"
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 w-full">
          {filteredGrades.map((g: any) => {
            const cat = normalizeOfflineCategory(g.category, g.assessmentType);
            const badge = getCategoryBadge(cat);
            const isComingSoon = g.isComingSoon;
            const score = isComingSoon ? null : (Number(g.score) || 0);
            const maxMarks = Number(g.maxMarks) || 100;
            const pct = (score !== null && maxMarks > 0) ? Math.round((score / maxMarks) * 100) : 0;
            const gradeInfo = !isComingSoon ? getGradeEvaluation(pct, schoolProfile?.gradingSystem) : null;
            const recordedDate = g.createdAt ? format(new Date(g.createdAt), 'MMM d, yyyy') : null;
            const releaseDateFormatted = g.releaseDate ? format(new Date(g.releaseDate), "MMM d, yyyy • h:mm a") : null;

            return (
              <div
                key={g.id}
                className={cn(
                  "bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden",
                  isComingSoon 
                    ? "border-amber-200/80 dark:border-amber-800/40 bg-gradient-to-b from-amber-50/20 to-transparent" 
                    : "border-slate-200/80 dark:border-slate-800"
                )}
              >
                <div>
                  {/* Category Pill and Status / Grade Pill */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={cn("px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border", badge.className)}>
                      {badge.shortLabel}
                    </span>

                    {isComingSoon ? (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider border bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        Coming Soon
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className={cn("px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider border", gradeInfo?.bg, gradeInfo?.color)}>
                          {gradeInfo?.grade} • {gradeInfo?.remark}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Released
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Subject and Assessment Title */}
                  <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                    {g.subject}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 font-medium">
                    {g.assessmentType || `${badge.label}`}
                  </p>

                  {/* Score Area: Released State vs Coming Soon State */}
                  {isComingSoon ? (
                    /* Coming Soon State */
                    <div className="mt-4 p-4 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-dashed border-amber-200 dark:border-amber-800/60">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5" /> Score Locked
                        </span>
                        <span className="text-xs font-semibold text-slate-400">Total Marks: {maxMarks}</span>
                      </div>
                      <div className="w-full bg-amber-200/60 dark:bg-amber-900/40 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full w-2/3 animate-pulse" />
                      </div>
                      <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mt-2.5 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Unlocks on {releaseDateFormatted || 'Scheduled Release Date'}</span>
                      </p>
                    </div>
                  ) : (
                    /* Released State */
                    <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-baseline justify-between mb-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Score Obtained</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-slate-900 dark:text-white">{score}</span>
                          <span className="text-xs font-semibold text-slate-400">/ {maxMarks}</span>
                          <span className="ml-1 text-xs font-bold text-pink-600 dark:text-pink-400">({pct}%)</span>
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            pct >= 70 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-rose-500"
                          )}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Teacher Feedback / Remarks */}
                  {g.remarks && (
                    <div className="mt-3 text-xs bg-slate-50/60 dark:bg-slate-800/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 italic line-clamp-2">
                      &ldquo;{g.remarks}&rdquo;
                    </div>
                  )}
                </div>

                {/* Footer Meta */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {g.term ? `${g.term} Term` : 'Class Term'}
                  </span>
                  <span>
                    {isComingSoon ? (
                      <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Scheduled
                      </span>
                    ) : (
                      recordedDate ? `Recorded ${recordedDate}` : 'Official Record'
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Tabular View adhering to list_grid_design skill */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm w-full">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Subject</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Assessment Name</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Score / Max</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">% Score</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status / WAEC Grade</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Teacher Remarks</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Date / Release</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredGrades.map((g: any) => {
                  const cat = normalizeOfflineCategory(g.category, g.assessmentType);
                  const badge = getCategoryBadge(cat);
                  const isComingSoon = g.isComingSoon;
                  const score = isComingSoon ? null : (Number(g.score) || 0);
                  const maxMarks = Number(g.maxMarks) || 100;
                  const pct = (score !== null && maxMarks > 0) ? Math.round((score / maxMarks) * 100) : 0;
                  const gradeInfo = !isComingSoon ? getGradeEvaluation(pct, schoolProfile?.gradingSystem) : null;
                  const recordedDate = g.createdAt ? format(new Date(g.createdAt), 'MMM d, yyyy') : 'N/A';
                  const releaseDateFormatted = g.releaseDate ? format(new Date(g.releaseDate), 'MMM d, yyyy') : null;

                  return (
                    <tr
                      key={g.id}
                      className={cn(
                        "border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors",
                        isComingSoon && "bg-amber-50/10 dark:bg-amber-950/10"
                      )}
                    >
                      <td className="p-4 font-bold text-xs text-slate-900 dark:text-white">
                        {g.subject}
                      </td>
                      <td className="p-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {g.assessmentType || `${badge.label}`}
                      </td>
                      <td className="p-4">
                        <span className={cn("px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border", badge.className)}>
                          {badge.shortLabel}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-black text-slate-900 dark:text-white text-right">
                        {isComingSoon ? (
                          <span className="text-slate-400 flex items-center justify-end gap-1 font-semibold">
                            <Lock className="w-3 h-3 text-amber-500" /> — / {maxMarks}
                          </span>
                        ) : (
                          <>
                            {score} <span className="font-normal text-slate-400">/ {maxMarks}</span>
                          </>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {isComingSoon ? (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            Coming Soon
                          </span>
                        ) : (
                          <span className={cn(
                            "px-2 py-0.5 rounded-md text-xs font-black",
                            pct >= 70 ? "text-emerald-600 dark:text-emerald-400" : pct >= 50 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"
                          )}>
                            {pct}%
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {isComingSoon ? (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold border border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3 text-amber-500" /> Pending Release
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className={cn("px-2 py-0.5 rounded-md text-[11px] font-bold border", gradeInfo?.bg, gradeInfo?.color)}>
                              {gradeInfo?.grade} ({gradeInfo?.remark})
                            </span>
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Released
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-xs text-slate-500 dark:text-slate-400 max-w-[200px] truncate italic">
                        {g.remarks || '—'}
                      </td>
                      <td className="p-4 text-[11px] font-medium text-right whitespace-nowrap">
                        {isComingSoon ? (
                          <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center justify-end gap-1">
                            <Clock className="w-3 h-3" /> Unlocks {releaseDateFormatted || 'Soon'}
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            {recordedDate}
                          </span>
                        )}
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
