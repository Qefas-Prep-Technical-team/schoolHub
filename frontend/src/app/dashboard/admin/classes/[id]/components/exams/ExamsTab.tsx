'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Upload, PlusCircle, ChevronLeft, ChevronRight,
  FileText, Clock, Users, BookOpen, Edit2, BarChart3, CalendarClock, Download, FileSpreadsheet
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

interface ClassExamsPageProps {
  exams?: any[];
  classData?: any;
}

const PAGE_SIZE = 10;

const TYPE_META: Record<string, { label: string; bg: string; text: string }> = {
  exam:       { label: 'Exam',       bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-300' },
  ca:         { label: 'CA',         bg: 'bg-blue-100 dark:bg-blue-900/30',     text: 'text-blue-700 dark:text-blue-300' },
  quiz:       { label: 'Quiz',       bg: 'bg-amber-100 dark:bg-amber-900/30',   text: 'text-amber-700 dark:text-amber-300' },
  assignment: { label: 'Assignment', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
};

const STATUS_META: Record<string, { label: string; dot: string; text: string }> = {
  active:      { label: 'Active',      dot: 'bg-green-500',  text: 'text-green-700 dark:text-green-400' },
  scheduled:   { label: 'Scheduled',   dot: 'bg-blue-500',   text: 'text-blue-700 dark:text-blue-400' },
  expired:     { label: 'Expired',     dot: 'bg-red-400',    text: 'text-red-600 dark:text-red-400' },
  unpublished: { label: 'Unpublished', dot: 'bg-gray-400',   text: 'text-gray-500 dark:text-gray-400' },
  draft:       { label: 'Draft',       dot: 'bg-gray-400',   text: 'text-gray-500 dark:text-gray-400' },
  published:   { label: 'Published',   dot: 'bg-green-500',  text: 'text-green-700 dark:text-green-400' },
  closed:      { label: 'Closed',      dot: 'bg-slate-500',  text: 'text-slate-600 dark:text-slate-400' },
};

const TypeBadge = ({ type }: { type: string }) => {
  const m = TYPE_META[type] ?? { label: type, bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-300' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${m.bg} ${m.text}`}>
      {m.label}
    </span>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const key = status?.toLowerCase();
  const m = STATUS_META[key] ?? { label: status, dot: 'bg-gray-400', text: 'text-gray-500' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${m.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot} inline-block`} />
      {m.label}
    </span>
  );
};

const FilterPill = ({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
      active
        ? 'bg-primary text-white dark:text-gray-900 shadow-sm shadow-primary/30'
        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary/50'
    }`}
  >
    {label}
  </button>
);

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
    return list;
  }, [allAssessments, typeFilter, statusFilter]);

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
    <div className="flex flex-col gap-6">
      <style>{`
        @keyframes subject-slider {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-subject-slider {
          animation: subject-slider 20s linear infinite;
        }
      `}</style>
      
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-gray-900 dark:text-white text-xl font-bold">Assessments</h2>
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button type="button" className="text-slate-400 hover:text-primary transition-colors">
                    <Info size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                  Chronicles all individual continuous assessments (assignments, quizzes, and midterm tests) scheduled for this class. Use this timeline to monitor short-term student engagement and identify gaps in recent syllabus comprehension.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {filtered.length} record{filtered.length !== 1 ? 's' : ''}
            {' \u00b7 '}{mappedExams.length} exam{mappedExams.length !== 1 ? 's' : ''}
            {' \u00b7 '}{mappedAssignments.length} assignment{mappedAssignments.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button disabled={isExporting} className="flex items-center gap-2 rounded-xl h-10 px-4 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {isExporting ? <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" /> : <Download size={16} />}
                {isExporting ? 'Exporting...' : 'Export'}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => {
                if (!filtered.length) { toast.warning("No exams to export"); return; }
                setIsExporting(true);
                generatePDF({
                  title: `${classData?.name || 'Class'} - Assessments`,
                  filename: `${schoolProfile?.name?.replace(/\\s+/g, '_') || 'School'}_${classData?.name?.replace(/\\s+/g, '_') || 'Class'}_Assessments`,
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
              }} className="cursor-pointer flex items-center gap-2">
                <FileText size={16} className="text-rose-500" />
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
                  '', // blank row
                  headers.join(','),
                  ...rows.map(r => r.join(','))
                ].filter(r => r !== '""').join('\\n');
                
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.setAttribute('download', `${schoolProfile?.name?.replace(/\\s+/g, '_') || 'School'}_${classData?.name?.replace(/\\s+/g, '_') || 'Class'}_Assessments.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success("CSV Exported Successfully!");
              }} className="cursor-pointer flex items-center gap-2">
                <FileSpreadsheet size={16} className="text-emerald-500" />
                <span>Export as CSV</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            onClick={() => router.push(`/dashboard/admin/classes/${classId}/exams/create`)}
            className="flex items-center gap-2 rounded-full h-10 px-5 bg-primary text-white dark:text-gray-900 text-sm font-semibold shadow-sm hover:bg-primary/90 transition-opacity"
          >
            <PlusCircle size={16} />
            Create New
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap gap-y-3 gap-x-6 items-center">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</span>
          {[
            { label: 'All', value: 'all' },
            { label: 'Exam', value: 'exam' },
            { label: 'CA', value: 'ca' },
            { label: 'Quiz', value: 'quiz' },
            { label: 'Assignment', value: 'assignment' },
          ].map(opt => (
            <FilterPill key={opt.value} label={opt.label} active={typeFilter === opt.value}
              onClick={() => { setTypeFilter(opt.value); resetPage(); }} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
          {[
            { label: 'All', value: 'all' },
            { label: 'Active', value: 'active' },
            { label: 'Scheduled', value: 'scheduled' },
            { label: 'Unpublished', value: 'unpublished' },
            { label: 'Expired', value: 'expired' },
          ].map(opt => (
            <FilterPill key={opt.value} label={opt.label} active={statusFilter === opt.value}
              onClick={() => { setStatusFilter(opt.value); resetPage(); }} />
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="hidden md:grid md:grid-cols-[30px_2.5fr_0.8fr_0.9fr_0.9fr_0.7fr_1fr_56px] gap-x-4 px-6 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
          {['#', 'Assessment', 'Type', 'Status', 'Subject', 'Marks', 'Date / Due', ''].map((h, i) => (
            <span key={i} className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{h}</span>
          ))}
        </div>

        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <FileText className="text-slate-400" size={24} />
            </div>
            <p className="text-base font-semibold text-slate-600 dark:text-slate-300 mb-1">No assessments found</p>
            <p className="text-sm text-slate-400">Try changing the filters or create a new assessment.</p>
          </div>
        ) : (
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
                  className="flex flex-col md:grid md:grid-cols-[30px_2.5fr_0.8fr_0.9fr_0.9fr_0.7fr_1fr_56px] gap-x-4 items-start md:items-center px-6 py-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Numbering */}
                  <div className="hidden md:flex text-xs font-black text-slate-400/70 select-none">
                    #{globalIdx}
                  </div>

                  {/* Title */}
                  <div className="min-w-0 w-full">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{item.title}</p>
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-slate-400">
                      {durLabel && (
                        <span className="flex items-center gap-1"><Clock size={11} />{durLabel}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users size={11} />
                        {item.completedStudents}/{item.totalStudents}
                        {item.totalStudents > 0 && <span>({completion}%)</span>}
                      </span>
                    </div>
                    {item.totalStudents > 0 && (
                      <div className="mt-2 h-1 w-28 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-primary/60 rounded-full" style={{ width: `${completion}%` }} />
                      </div>
                    )}
                    {/* Mobile-only badges */}
                    <div className="flex gap-2 mt-2 md:hidden flex-wrap">
                      <TypeBadge type={item.type} />
                      <StatusBadge status={item.status} />
                    </div>
                  </div>

                  {/* Type (desktop) */}
                  <div className="hidden md:flex"><TypeBadge type={item.type} /></div>
                  {/* Status (desktop) */}
                  <div className="hidden md:flex"><StatusBadge status={item.status} /></div>

                  {/* Subject */}
                  <div className="hidden md:flex items-center gap-2 min-w-0 flex-1 overflow-hidden relative">
                    <BookOpen size={13} className="text-slate-400 shrink-0" />
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
                      <span className="text-sm text-slate-600 dark:text-slate-300 truncate">
                        {item.subjectNames?.[0] || item.subjectName}
                      </span>
                    )}
                  </div>

                  {/* Marks */}
                  <div className="hidden md:block text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {item.totalMarks > 0 ? `${item.totalMarks} pts` : '\u2014'}
                  </div>

                  {/* Date */}
                  <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <CalendarClock size={12} className="shrink-0" />
                    {dateLabel}
                  </div>

                  {/* Actions */}
                  <div className="hidden md:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        if (item.source === 'exam') router.push(`/dashboard/admin/exams/${item.id}/papers`);
                        else router.push(`/dashboard/admin/assignments/${item.id}`);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={15} />
                    </button>
                    {item.source === 'exam' && (item.status === 'active' || item.status === 'expired') && (
                      <button
                        onClick={() => router.push(`/dashboard/admin/exams/${item.id}/results`)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="Results"
                      >
                        <BarChart3 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {(currentPage - 1) * PAGE_SIZE + 1}â€“{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-40 hover:bg-white dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {paginationPages.map((p, i) =>
                p === '...' ? (
                  <span key={`e-${i}`} className="px-1 text-slate-400 text-sm select-none">&hellip;</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${
                      currentPage === p
                        ? 'bg-primary text-white dark:text-gray-900 shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-40 hover:bg-white dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Absolute empty state */}
      {allAssessments.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <PlusCircle className="text-slate-400" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No assessments yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">
            This class doesn&apos;t have any exams, CAs, quizzes or assignments yet.
          </p>
          <button
            onClick={() => router.push(`/dashboard/admin/classes/${classId}/exams/create`)}
            className="px-5 py-2.5 bg-primary text-white dark:text-gray-900 rounded-full hover:bg-primary/90 font-semibold shadow-sm"
          >
            Create First Assessment
          </button>
        </div>
      )}
    </div>
  );
}
