'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Upload, PlusCircle, ChevronLeft, ChevronRight,
  FileText, Clock, Users, BookOpen, Edit2, BarChart3, CalendarClock, Download, FileSpreadsheet,
  Search, X, CheckCircle2, Award, Calendar, Layers, ArrowUpRight
} from 'lucide-react';
import { AssessmentItem, ExamType } from './components/types';
import { Info } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { generatePDF } from '@/utils/pdfGenerator';
import { useSchoolProfile, useSchoolSettings } from '@/lib/api/hooks/useSchool';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';

interface ClassExamsPageProps {
  exams?: any[];
  classData?: any;
}

const PAGE_SIZE = 10;

const TYPE_META: Record<string, { label: string; bg: string; text: string; border: string }> = {
  exam:       { label: 'Exam',       bg: 'bg-violet-50 dark:bg-violet-950/40', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-800/60' },
  ca:         { label: 'CA',         bg: 'bg-blue-50 dark:bg-blue-950/40',     text: 'text-blue-700 dark:text-blue-300',     border: 'border-blue-200 dark:border-blue-800/60' },
  quiz:       { label: 'Quiz',       bg: 'bg-amber-50 dark:bg-amber-950/40',   text: 'text-amber-700 dark:text-amber-300',   border: 'border-amber-200 dark:border-amber-800/60' },
  assignment: { label: 'Assignment', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800/60' },
};

const STATUS_META: Record<string, { label: string; dot: string; text: string; bg: string; border: string }> = {
  active:      { label: 'Active',      dot: 'bg-emerald-500',  text: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-200 dark:border-emerald-800' },
  scheduled:   { label: 'Scheduled',   dot: 'bg-blue-500',     text: 'text-blue-700 dark:text-blue-400',       bg: 'bg-blue-50 dark:bg-blue-950/40',     border: 'border-blue-200 dark:border-blue-800' },
  expired:     { label: 'Expired',     dot: 'bg-rose-400',     text: 'text-rose-600 dark:text-rose-400',       bg: 'bg-rose-50 dark:bg-rose-950/40',     border: 'border-rose-200 dark:border-rose-800' },
  unpublished: { label: 'Unpublished', dot: 'bg-slate-400',    text: 'text-slate-600 dark:text-slate-400',     bg: 'bg-slate-100 dark:bg-slate-800',     border: 'border-slate-200 dark:border-slate-700' },
  draft:       { label: 'Draft',       dot: 'bg-slate-400',    text: 'text-slate-600 dark:text-slate-400',     bg: 'bg-slate-100 dark:bg-slate-800',     border: 'border-slate-200 dark:border-slate-700' },
  published:   { label: 'Published',   dot: 'bg-emerald-500',  text: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-200 dark:border-emerald-800' },
  closed:      { label: 'Closed',      dot: 'bg-slate-500',    text: 'text-slate-600 dark:text-slate-400',     bg: 'bg-slate-100 dark:bg-slate-800',     border: 'border-slate-200 dark:border-slate-700' },
};

const TypeBadge = ({ type }: { type: string }) => {
  const m = TYPE_META[type] ?? { label: type, bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${m.bg} ${m.text} ${m.border}`}>
      {m.label}
    </span>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const key = status?.toLowerCase();
  const m = STATUS_META[key] ?? { label: status, dot: 'bg-slate-400', text: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border ${m.bg} ${m.text} ${m.border}`}>
      <span className={`size-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
};

export default function ClassExamsPage({ exams = [], classData }: ClassExamsPageProps) {
  const router = useRouter();
  const params = useParams();
  const classId = params.id as string;
  const totalStudentsCount = classData?.enrollments?.length || 0;
  
  const { data: profileData } = useSchoolProfile(classData?.schoolId);
  const { data: settingsData } = useSchoolSettings(classData?.schoolId);
  const schoolProfile = profileData;
  const settings = settingsData;
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const mapStatus = (status: string, startDate?: string, endDate?: string): string => {
    const s = status?.toUpperCase();
    if (s === 'DRAFT') return 'unpublished';
    if (s === 'ARCHIVED') return 'draft';
    if (s === 'PUBLISHED') {
      const now = new Date();
      if (startDate && now < new Date(startDate)) return 'scheduled';
      if (endDate && now > new Date(endDate)) return 'expired';
      return 'active';
    }
    return 'draft';
  };

  const mappedExams: AssessmentItem[] = useMemo(() =>
    (exams || []).filter(Boolean).map(e => ({
      id: e.id,
      title: e.title || 'Untitled',
      type: (e.category?.toLowerCase() || 'exam') as ExamType,
      status: mapStatus(e.status, e.startDate, e.endDate),
      subjectName: e.subject?.name || '\u2014',
      subjectNames: e.subject?.name ? [e.subject.name] : e.subjectExamPapers?.map((p: any) => p.subjectPaper?.subject?.name).filter(Boolean) || [],
      totalMarks: e.totalMarks || 0,
      duration: e.durationMinutes,
      date: e.startDate || e.createdAt,
      endDate: e.endDate,
      totalStudents: totalStudentsCount,
      completedStudents: e.examAttempts?.filter((a: any) => a.isSubmitted).length || 0,
      source: 'exam' as const,
    })),
  [exams, totalStudentsCount]);

  const mappedAssignments: AssessmentItem[] = useMemo(() =>
    ((classData?.assignments) || []).filter(Boolean).map((a: any) => ({
      id: a.id,
      title: a.title || 'Untitled Assignment',
      type: 'assignment' as ExamType,
      status: a.status?.toLowerCase() || 'draft',
      subjectName: a.subject?.name || '\u2014',
      totalMarks: a.totalMarks || 0,
      dueDate: a.dueDate,
      date: a.createdAt,
      totalStudents: totalStudentsCount,
      completedStudents: a._count?.submissions || 0,
      source: 'assignment' as const,
    })),
  [classData, totalStudentsCount]);

  const allAssessments = useMemo(() =>
    [...mappedExams, ...mappedAssignments].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    ),
  [mappedExams, mappedAssignments]);

  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = allAssessments;
    if (typeFilter !== 'all') list = list.filter(i => i.type === typeFilter);
    if (statusFilter !== 'all') list = list.filter(i => i.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(i => 
        i.title.toLowerCase().includes(q) ||
        i.subjectName.toLowerCase().includes(q) ||
        (i.subjectNames && i.subjectNames.some(s => s.toLowerCase().includes(q)))
      );
    }
    return list;
  }, [allAssessments, typeFilter, statusFilter, searchQuery]);

  // Overall metric calculations
  const totalSubmissions = useMemo(() => 
    allAssessments.reduce((acc, curr) => acc + (curr.completedStudents || 0), 0),
    [allAssessments]
  );
  const activeAssessmentsCount = useMemo(() =>
    allAssessments.filter(a => a.status === 'active' || a.status === 'scheduled').length,
    [allAssessments]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const resetPage = () => setPage(1);

  const formatDate = (d?: string) => {
    if (!d) return '\u2014';
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDuration = (mins?: number) => {
    if (!mins) return null;
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60), m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const paginationPages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
    .reduce<(number | '...')[]>((acc, p, idx, arr) => {
      if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) {
        acc.push('...');
      }
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <style>{`
        @keyframes subject-slider {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-subject-slider {
          animation: subject-slider 20s linear infinite;
        }
      `}</style>
      
      {/* ── Top Assessment KPI Strip ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Metric 1: Total Assessments */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="size-9 sm:size-10 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-100 dark:border-violet-900/40">
              <Layers size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              Total
            </span>
          </div>
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
              Assessments
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {allAssessments.length}
            </h3>
          </div>
        </div>

        {/* Metric 2: Formal Exams */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="size-9 sm:size-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/40">
              <FileText size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-900/40">
              Exams
            </span>
          </div>
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
              Formal Exams
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {mappedExams.length}
            </h3>
          </div>
        </div>

        {/* Metric 3: Assignments & CA */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="size-9 sm:size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/40">
              <BookOpen size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-900/40">
              Continuous
            </span>
          </div>
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
              Assignments & CA
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {mappedAssignments.length}
            </h3>
          </div>
        </div>

        {/* Metric 4: Active / Scheduled */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="size-9 sm:size-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-900/40">
              <CalendarClock size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/40">
              Upcoming
            </span>
          </div>
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active / Scheduled
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {activeAssessmentsCount}
            </h3>
          </div>
        </div>
      </div>

      {/* ── Header & Action Controls ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-slate-900 dark:text-white text-xl font-black tracking-tight">Assessments Timeline</h2>
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button type="button" className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
                    <Info size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs p-3 text-xs leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                  Chronicles all individual continuous assessments (assignments, quizzes, and midterm tests) scheduled for this class. Use this timeline to monitor short-term student engagement and identify gaps in recent syllabus comprehension.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {filtered.length} showing of {allAssessments.length} total assessments
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button disabled={isExporting} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl h-10 px-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs transition-all disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                {isExporting ? <div className="size-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" /> : <Download size={15} />}
                <span>{isExporting ? 'Exporting...' : 'Export'}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1.5 shadow-xl text-slate-800 dark:text-slate-200">
              <DropdownMenuItem onClick={() => {
                if (!filtered.length) { toast.warning("No exams to export"); return; }
                setIsExporting(true);
                generatePDF({
                  title: `${classData?.name || 'Class'} - Assessments`,
                  filename: `${schoolProfile?.name?.replace(/\s+/g, '_') || 'School'}_${classData?.name?.replace(/\s+/g, '_') || 'Class'}_Assessments`,
                  schoolProfile: schoolProfile || settings,
                  metaData: [
                    { label: 'Type Filter', value: typeFilter.toUpperCase() },
                    { label: 'Status Filter', value: statusFilter.toUpperCase() }
                  ],
                  tableHeaders: [['Title', 'Type', 'Status', 'Subject', 'Marks', 'Duration', 'Date']],
                  tableData: filtered.map(e => [
                    e.title,
                    TYPE_META[e.type]?.label || e.type,
                    STATUS_META[e.status]?.label || e.status,
                    e.subjectNames?.join(', ') || e.subjectName || '-',
                    e.totalMarks || '-',
                    formatDuration(e.duration) || '-',
                    formatDate(e.date) || '-'
                  ])
                }).then(() => {
                  setIsExporting(false);
                  toast.success("PDF Exported Successfully!");
                }).catch((e) => {
                  console.error(e);
                  setIsExporting(false);
                  toast.error("Failed to generate PDF");
                });
              }} className="cursor-pointer flex items-center gap-2 text-xs font-semibold py-2 px-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 transition-colors">
                <FileText size={15} className="text-rose-500" />
                <span>Export as PDF</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                if (!filtered.length) { toast.warning("No exams to export"); return; }
                const headers = ['Title', 'Type', 'Status', 'Subject', 'Marks', 'Duration', 'Date'];
                const rows = filtered.map(e => [
                  `"${e.title}"`,
                  `"${TYPE_META[e.type]?.label || e.type}"`,
                  `"${STATUS_META[e.status]?.label || e.status}"`,
                  `"${e.subjectNames?.join(', ') || e.subjectName || '-'}"`,
                  `"${e.totalMarks || '-'}"`,
                  `"${formatDuration(e.duration) || '-'}"`,
                  `"${formatDate(e.date) || '-'}"`
                ]);
                const schoolName = schoolProfile?.name || settings?.schoolName || 'School';
                const schoolAddress = schoolProfile?.address || '';
                const csvContent = [
                  `"${schoolName}"`,
                  `"${schoolAddress}"`,
                  `"Class: ${classData?.name || 'Class'}"`,
                  '',
                  headers.join(','),
                  ...rows.map(r => r.join(','))
                ].filter(r => r !== '""').join('\n');
                
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.setAttribute('download', `${schoolProfile?.name?.replace(/\s+/g, '_') || 'School'}_${classData?.name?.replace(/\s+/g, '_') || 'Class'}_Assessments.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success("CSV Exported Successfully!");
              }} className="cursor-pointer flex items-center gap-2 text-xs font-semibold py-2 px-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 transition-colors">
                <FileSpreadsheet size={15} className="text-emerald-500" />
                <span>Export as CSV</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={() => router.push(`/dashboard/admin/classes/${classId}/exams/create`)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl h-10 px-4 sm:px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-sm shadow-indigo-600/20 dark:shadow-none transition-all active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <PlusCircle size={16} />
            <span>Create New</span>
          </button>
        </div>
      </div>

      {/* ── Search & Filter Pill Controls ───────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
        {/* Search Input */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search assessments by title or subject..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); resetPage(); }}
            className="w-full h-10 pl-9 pr-8 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); resetPage(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Pill Carousels (Smooth touch scrolling on mobile) */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center sm:justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
          {/* Type Filter */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">Type:</span>
            {[
              { label: 'All Types', value: 'all' },
              { label: 'Exams', value: 'exam' },
              { label: 'CA', value: 'ca' },
              { label: 'Quizzes', value: 'quiz' },
              { label: 'Assignments', value: 'assignment' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => { setTypeFilter(opt.value); resetPage(); }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                  typeFilter === opt.value
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 font-bold border border-transparent"
                    : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60 font-semibold"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">Status:</span>
            {[
              { label: 'All', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Scheduled', value: 'scheduled' },
              { label: 'Draft', value: 'unpublished' },
              { label: 'Expired', value: 'expired' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => { setStatusFilter(opt.value); resetPage(); }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                  statusFilter === opt.value
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 font-bold border border-transparent"
                    : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60 font-semibold"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Assessments Container ───────────────────────────────────────────── */}
      {paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center">
          <div className="size-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 text-slate-400">
            <FileText size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
            No assessments found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mb-4">
            Try adjusting your search query, clearing filters, or creating a new assessment for this class.
          </p>
          {(typeFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => { setTypeFilter('all'); setStatusFilter('all'); setSearchQuery(''); resetPage(); }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ── Mobile View (< 768px): Dedicated Assessment Cards ──────────────── */}
          <div className="block md:hidden space-y-3">
            {paginated.map((item, index) => {
              const globalIdx = (currentPage - 1) * PAGE_SIZE + index + 1;
              const completion = item.totalStudents > 0
                ? Math.round((item.completedStudents / item.totalStudents) * 100) : 0;
              const durLabel = formatDuration(item.duration);
              const dateLabel = item.source === 'assignment'
                ? (item.dueDate ? `Due: ${formatDate(item.dueDate)}` : `Created: ${formatDate(item.date)}`)
                : `Date: ${formatDate(item.date)}`;

              return (
                <div 
                  key={`${item.source}-${item.id}`}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3 hover:shadow-md transition-shadow"
                >
                  {/* Card Header: Numbering, Badges & Points */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="size-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-black flex items-center justify-center border border-slate-200/60 dark:border-slate-700/60">
                        #{globalIdx}
                      </span>
                      <TypeBadge type={item.type} />
                      <StatusBadge status={item.status} />
                    </div>

                    <span className="text-xs font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md font-mono border border-slate-200/60 dark:border-slate-700/60">
                      {item.totalMarks > 0 ? `${item.totalMarks} pts` : '—'}
                    </span>
                  </div>

                  {/* Title & Subject */}
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <BookOpen size={13} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {item.subjectNames && item.subjectNames.length > 0 
                          ? item.subjectNames.join(', ') 
                          : item.subjectName}
                      </span>
                    </div>
                  </div>

                  {/* Schedule & Duration Pills */}
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap pt-0.5">
                    <div className="flex items-center gap-1">
                      <CalendarClock size={13} className="text-slate-400" />
                      <span>{dateLabel}</span>
                    </div>
                    {durLabel && (
                      <div className="flex items-center gap-1">
                        <Clock size={13} className="text-slate-400" />
                        <span>{durLabel}</span>
                      </div>
                    )}
                  </div>

                  {/* Submissions & Progress Bar */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-slate-500 font-medium">
                        <Users size={13} />
                        <span>Submitted</span>
                      </span>
                      <span className="font-black text-slate-800 dark:text-slate-200">
                        {item.completedStudents}/{item.totalStudents} <span className="text-[10px] text-slate-400 font-bold">({completion}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, Math.max(0, completion))}%` }} 
                      />
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        if (item.source === 'exam') router.push(`/dashboard/admin/exams/${item.id}/papers`);
                        else router.push(`/dashboard/admin/assignments/${item.id}`);
                      }}
                      className="flex-1 h-9 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-600/20 dark:shadow-none transition-all active:scale-98 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      <Edit2 size={13} />
                      <span>{item.source === 'exam' ? 'Manage Papers' : 'Edit Assignment'}</span>
                    </button>

                    {item.source === 'exam' && (
                      <button
                        onClick={() => router.push(`/dashboard/admin/exams/${item.id}/results`)}
                        className="h-9 px-3.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        title="View Class Exam Results"
                      >
                        <BarChart3 size={14} className="text-blue-500 dark:text-blue-400" />
                        <span>Results</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Desktop View (>= 768px): Structured Table ─────────────────────── */}
          <div className="hidden md:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="grid grid-cols-[36px_2.5fr_0.8fr_0.9fr_1fr_0.7fr_1.1fr_70px] gap-x-4 px-6 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
              {['#', 'Assessment', 'Type', 'Status', 'Subject', 'Marks', 'Date / Schedule', 'Actions'].map((h, i) => (
                <span key={i} className={cn("text-[11px] font-black uppercase tracking-wider text-slate-400", i === 7 ? "text-right" : "")}>
                  {h}
                </span>
              ))}
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {paginated.map((item, index) => {
                const globalIdx = (currentPage - 1) * PAGE_SIZE + index + 1;
                const completion = item.totalStudents > 0
                  ? Math.round((item.completedStudents / item.totalStudents) * 100) : 0;
                const durLabel = formatDuration(item.duration);
                const dateLabel = item.source === 'assignment'
                  ? (item.dueDate ? `Due ${formatDate(item.dueDate)}` : `Created ${formatDate(item.date)}`)
                  : formatDate(item.date);

                return (
                  <div
                    key={`${item.source}-${item.id}`}
                    className="grid grid-cols-[36px_2.5fr_0.8fr_0.9fr_1fr_0.7fr_1.1fr_70px] gap-x-4 items-center px-6 py-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Index */}
                    <div className="text-xs font-black text-slate-400 select-none">
                      #{globalIdx}
                    </div>

                    {/* Title & Progress */}
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{item.title}</p>
                      <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-slate-400">
                        {durLabel && (
                          <span className="flex items-center gap-1"><Clock size={11} />{durLabel}</span>
                        )}
                        <span className="flex items-center gap-1 font-medium">
                          <Users size={11} />
                          {item.completedStudents}/{item.totalStudents} ({completion}%)
                        </span>
                      </div>
                      {item.totalStudents > 0 && (
                        <div className="mt-2 h-1.5 w-32 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all" style={{ width: `${completion}%` }} />
                        </div>
                      )}
                    </div>

                    {/* Type */}
                    <div><TypeBadge type={item.type} /></div>

                    {/* Status */}
                    <div><StatusBadge status={item.status} /></div>

                    {/* Subject */}
                    <div className="flex items-center gap-2 min-w-0 overflow-hidden relative">
                      <BookOpen size={14} className="text-slate-400 shrink-0" />
                      {item.subjectNames && item.subjectNames.length > 1 ? (
                        <div className="flex-1 overflow-hidden relative [mask-image:linear-gradient(to_right,transparent,black_10px,black_calc(100%-10px),transparent)]">
                          <div className="flex gap-2 animate-subject-slider w-max hover:[animation-play-state:paused] items-center">
                            {[...item.subjectNames, ...item.subjectNames].map((s, i) => (
                              <span key={i} className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                          {item.subjectNames?.[0] || item.subjectName}
                        </span>
                      )}
                    </div>

                    {/* Marks */}
                    <div className="text-xs font-black text-slate-800 dark:text-slate-200 font-mono">
                      {item.totalMarks > 0 ? `${item.totalMarks} pts` : '—'}
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <CalendarClock size={13} className="shrink-0 text-slate-400" />
                      <span className="truncate">{dateLabel}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          if (item.source === 'exam') router.push(`/dashboard/admin/exams/${item.id}/papers`);
                          else router.push(`/dashboard/admin/assignments/${item.id}`);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer"
                        title={item.source === 'exam' ? 'Manage Papers' : 'Edit Assignment'}
                      >
                        <Edit2 size={15} />
                      </button>
                      {item.source === 'exam' && (
                        <button
                          onClick={() => router.push(`/dashboard/admin/exams/${item.id}/results`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                          title="View Exam Results"
                        >
                          <BarChart3 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── Responsive Pagination ───────────────────────────────────────────── */}
      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between p-3.5 sm:px-6 sm:py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            {paginationPages.map((p, i) =>
              p === '...' ? (
                <span key={`e-${i}`} className="px-1 text-slate-400 text-xs select-none">&hellip;</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={cn(
                    "size-8 rounded-xl text-xs font-bold transition-all cursor-pointer",
                    currentPage === p
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 dark:shadow-none"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  )}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
