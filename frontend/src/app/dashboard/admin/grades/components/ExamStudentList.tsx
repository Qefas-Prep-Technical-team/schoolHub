"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  CheckCircle2,
  Users,
  History,
  FileText,
  Search,
  Download,
  Loader2,
  User,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { useExamAttempts, useExams } from '@/lib/api/hooks/useExams';
import Pagination from './Pagination';
import ExportResultScopeModal, { ExportScopeMode, ExportStudentOption } from './ExportResultScopeModal';
import { downloadIndividualResultsAsZip, downloadSingleStudentPdf, downloadCombinedAssessmentPdf } from '../utils/batchPDFDownloader';

interface ExamStudentListProps {
  examId: string;
  onBack: () => void;
  onSelectStudent: (studentId: string) => void;
  selectedPaperId: string;
  setSelectedPaperId: (paperId: string) => void;
  school: any;
  primaryColor: string;
}

export default function ExamStudentList({
  examId,
  onBack,
  onSelectStudent,
  selectedPaperId,
  setSelectedPaperId,
  school,
  primaryColor
}: ExamStudentListProps) {
  const { data: attempts, isLoading } = useExamAttempts(examId);
  const { data: exams } = useExams();
  const router = useRouter();
  const [showMobilePapers, setShowMobilePapers] = useState(false);
  const [isNavigating, setIsNavigating] = useState<string | null>(null);
  const [isBatchDownloading, setIsBatchDownloading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedStudentForExport, setSelectedStudentForExport] = useState<string | undefined>(undefined);

  const exam = exams?.find((e: any) => e.id === examId);
  const examClassName = exam?.class?.name || 'Class';

  // Format student options for the ExportResultScopeModal
  const exportStudentOptions = useMemo<ExportStudentOption[]>(() => {
    if (!attempts) return [];
    return attempts.map((a: any) => {
      const studentClass =
        a.className ||
        examClassName ||
        a.student?.class?.name ||
        (a.student?.classes?.[0]?.class?.name ? `${a.student.classes[0].class.name}${a.student.classes[0].class.section ? ` (${a.student.classes[0].class.section})` : ''}` : '') ||
        'N/A';
      return {
        id: a.studentId || a.id,
        name: a.student?.name || 'Student',
        studentCode: a.student?.studentCode || 'N/A',
        className: studentClass,
        score: a.totalScore !== undefined ? a.totalScore : a.percentage,
        totalMarks: a.totalMarks,
        rawItem: a,
      };
    });
  }, [attempts, examClassName]);

  const handleExportScope = async (
    mode: ExportScopeMode,
    selectedList: ExportStudentOption[],
    format?: any,
    isPaying: boolean = true
  ) => {
    if (!selectedList.length) return;
    setIsBatchDownloading(true);
    try {
      const examTitle = exam?.title || 'Exam';
      const examObj = exam as any;
      const sessionName = examObj?.session?.name || examObj?.academicSession?.name || examObj?.sessionName;
      if (mode === 'combined_pdf') {
        await downloadCombinedAssessmentPdf({
          exam: exam ? { ...exam, sessionName } : { title: examTitle, sessionName },
          attempts: attempts || [],
          school,
          isPaying,
        });
      } else if (mode === 'all_zip' || (mode === 'custom' && selectedList.length > 1)) {
        await downloadIndividualResultsAsZip({
          results: selectedList.map(s => s.rawItem),
          school,
          examTitle,
          className: examClassName,
          sessionName,
          isPaying,
        });
      } else {
        await downloadSingleStudentPdf({
          result: selectedList[0].rawItem,
          school,
          examTitle,
          className: selectedList[0].className,
          sessionName,
          isPaying,
        });
      }
      setIsExportModalOpen(false);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsBatchDownloading(false);
    }
  };

  const handleOpenExportModal = (targetStudentId?: string) => {
    setSelectedStudentForExport(targetStudentId);
    setIsExportModalOpen(true);
  };

  // Extract unique papers for filtering
  const papers = useMemo(() => {
    if (!attempts || attempts.length === 0) return [];
    const firstAttempt = attempts.find((a: any) => a.subjectAttempts?.length > 0);
    if (!firstAttempt) return [];
    return firstAttempt.subjectAttempts.map((sa: any) => ({
      id: sa.subjectPaperId,
      name: sa.subjectPaper?.subject?.name || 'Unknown Paper'
    }));
  }, [attempts]);

  const filteredAttempts = useMemo(() => {
    let result = attempts || [];
    if (selectedPaperId) {
      result = result.filter((a: any) => a.subjectAttempts?.some((sa: any) => sa.subjectPaperId === selectedPaperId));
    }
    if (searchTerm) {
      result = result.filter((a: any) => a.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return result;
  }, [attempts, selectedPaperId, searchTerm]);

  // Set default paper if none selected
  useMemo(() => {
    if (!selectedPaperId && papers.length > 0) {
      setSelectedPaperId(papers[0].id);
    }
  }, [papers, selectedPaperId]);

  const totalPages = Math.ceil(filteredAttempts.length / itemsPerPage);
  const paginatedAttempts = filteredAttempts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
      <div>
        <Button
          onClick={onBack}
          variant="ghost"
          className="h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all text-sm font-medium gap-2 mb-6 border border-slate-200 dark:border-slate-700"
        >
          <ArrowLeft size={16} />
          Back to Exams
        </Button>

        {/* Exam Title Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl lg:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">
              {exams?.find((e: any) => e.id === examId)?.title || 'Exam Details'}
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Viewing Cohort Performance
            </p>
          </div>
        </div>

        {/* High-Level Analytics Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-10">
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-900 border-2 border-blue-400/50 rounded-3xl p-6 shadow-xl hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 group">
            <TrendingUp className="absolute -right-4 -bottom-4 text-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12" size={120} strokeWidth={1} />
            <div className="relative z-10 text-white">
              <p className="text-xs font-black uppercase tracking-widest text-blue-200 mb-2">Average Score</p>
              <h3 className="text-5xl font-black leading-none drop-shadow-md">
                {attempts?.length ? Math.round(attempts.reduce((acc: number, a: any) => acc + (a.totalScore || a.percentage || 0), 0) / attempts.length) : 0}%
              </h3>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-white to-emerald-50 dark:from-slate-900 dark:to-emerald-950/20 border-2 border-emerald-500/30 rounded-3xl p-6 shadow-sm hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-500/60 transition-all duration-300 group">
            <CheckCircle2 className="absolute -right-4 -bottom-4 text-emerald-500/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" size={120} strokeWidth={1} />
            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-widest text-emerald-600/70 dark:text-emerald-400/70 mb-2">Passing Rate</p>
              <div className="flex items-end gap-2">
                <h3 className="text-5xl font-black text-slate-900 dark:text-white leading-none">
                  {attempts?.length ? Math.round((attempts.filter((a: any) => (a.totalScore || a.percentage || 0) >= 50).length / attempts.length) * 100) : 0}%
                </h3>
              </div>
            </div>
          </div>

          <div className="hidden md:flex relative overflow-hidden bg-gradient-to-br from-white to-purple-50 dark:from-slate-900 dark:to-purple-950/20 border-2 border-purple-500/30 rounded-3xl p-6 shadow-sm hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-500/60 transition-all duration-300 group">
            <Users className="absolute -right-4 -bottom-4 text-purple-500/10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12" size={120} strokeWidth={1} />
            <div className="relative z-10 flex flex-col justify-between h-full">
              <p className="text-xs font-black uppercase tracking-widest text-purple-600/70 dark:text-purple-400/70 mb-2">Total Students</p>
              <h3 className="text-5xl font-black text-slate-900 dark:text-white leading-none mt-2">
                {attempts?.length || 0}
              </h3>
            </div>
          </div>

          <div className="hidden md:flex relative overflow-hidden bg-gradient-to-br from-slate-900 to-black border-2 border-slate-700/50 rounded-3xl p-6 shadow-xl hover:-translate-y-1 hover:shadow-2xl hover:shadow-white/10 hover:border-slate-500/60 transition-all duration-300 group text-white">
            <History className="absolute -right-4 -bottom-4 text-white/5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" size={120} strokeWidth={1} />
            <div className="relative z-10 flex flex-col justify-between h-full">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Highest Score</p>
              <h3 className="text-5xl font-black leading-none mt-2 drop-shadow-md text-amber-400">
                {attempts?.length ? Math.max(...attempts.map((a: any) => a.totalScore || a.percentage || 0)) : 0}%
              </h3>
            </div>
          </div>
        </div>

        <div className="flex overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar gap-4 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:pb-0 lg:mx-0 lg:px-0 mb-8">

          {papers.map((paper: any) => {
            const isSelected = selectedPaperId === paper.id;
            const paperScores = attempts?.map((a: any) => a.subjectAttempts?.find((sa: any) => sa.subjectPaperId === paper.id)?.score).filter((s: any) => s !== undefined) || [];
            const avg = paperScores.length > 0 ? Math.round(paperScores.reduce((a: number, b: number) => a + b, 0) / paperScores.length) : 0;

            return (
              <div
                key={paper.id}
                onClick={() => { setSelectedPaperId(paper.id); setCurrentPage(1); }}
                className={cn(
                  "min-w-[200px] sm:min-w-0 p-5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden shrink-0 lg:shrink",
                  isSelected
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary/50 shadow-sm"
                )}
                style={{
                  backgroundColor: isSelected ? primaryColor : undefined,
                  borderColor: isSelected ? primaryColor : undefined,
                } as any}
              >
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center border transition-all",
                      isSelected ? "bg-white/20 border-white/30" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    )}
                      style={{ color: isSelected ? undefined : primaryColor }}
                    >
                      <FileText size={18} strokeWidth={2} />
                    </div>
                    <div className={cn(
                      "px-2 py-1 rounded text-xs font-semibold",
                      isSelected ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    )}>
                      {avg}% AVG
                    </div>
                  </div>
                  <div>
                    <p className={cn(
                      "text-[10px] font-medium uppercase tracking-wider mb-1",
                      isSelected ? "text-white/80" : "text-slate-500"
                    )}>Subject Paper</p>
                    <h3 className="text-base font-semibold truncate">{paper.name}</h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-3xl border-2 border-slate-200 dark:border-slate-800">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-12 pl-12 pr-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-blue-500 transition-all font-bold text-slate-900 dark:text-white shadow-sm"
            />
          </div>
          <div className="flex items-center w-full sm:w-auto px-1">
            <Button
              onClick={() => handleOpenExportModal()}
              disabled={isBatchDownloading || !attempts?.length}
              className="h-12 w-full sm:w-auto px-6 rounded-2xl font-black uppercase tracking-widest gap-2 shadow-md text-white text-xs border-2 hover:-translate-y-0.5 transition-all cursor-pointer"
              style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
            >
              {isBatchDownloading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <Download className="h-5 w-5" />
              )}
              Export Results
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <>
              {/* Mobile Skeleton View */}
              <div className="md:hidden flex flex-col gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/50 rounded-2xl p-4 animate-pulse flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0" />
                      <div>
                        <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded mb-2" />
                        <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="h-5 w-12 bg-slate-100 dark:bg-slate-800 rounded-full" />
                      <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop Skeleton View */}
              <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/80 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
                      <th className="p-4 w-16"><div className="h-4 w-6 rounded-md bg-slate-200 dark:bg-slate-700 mx-auto animate-pulse" /></th>
                      <th className="p-4"><div className="h-4 w-32 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse" /></th>
                      <th className="p-4"><div className="h-4 w-24 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse" /></th>
                      <th className="p-4 text-center"><div className="h-4 w-16 rounded-md bg-slate-200 dark:bg-slate-700 mx-auto animate-pulse" /></th>
                      <th className="p-4 w-12"><div className="h-4 w-4 rounded-md bg-slate-200 dark:bg-slate-700 mx-auto animate-pulse" /></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <tr key={i} className="border-b border-slate-100 dark:border-slate-800/40">
                        <td className="p-4 text-center"><div className="h-4 w-4 rounded-md bg-slate-100 dark:bg-slate-800 mx-auto animate-pulse" /></td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 animate-pulse" />
                            <div className="h-4 w-32 rounded-md bg-slate-100 dark:bg-slate-800 animate-pulse" />
                          </div>
                        </td>
                        <td className="p-4"><div className="h-4 w-24 rounded-md bg-slate-100 dark:bg-slate-800 animate-pulse" /></td>
                        <td className="p-4 text-center"><div className="h-6 w-16 rounded-md bg-slate-100 dark:bg-slate-800 mx-auto animate-pulse" /></td>
                        <td className="p-4 text-center"><div className="h-6 w-6 rounded-md bg-slate-100 dark:bg-slate-800 mx-auto animate-pulse" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : paginatedAttempts.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-bold uppercase tracking-widest text-xs bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">No candidates found</div>
          ) : (
            <>
              {/* Mobile List View */}
              <div className="md:hidden flex flex-col gap-3">
                {paginatedAttempts.map((attempt: any, idx: number) => {
                  const scorePercent = attempt.totalMarks ? Math.round((attempt.totalScore / attempt.totalMarks) * 100) : Math.round(attempt.totalScore || attempt.percentage || 0);
                  const isPassed = scorePercent >= 50;

                  const theme = isPassed ? {
                    textHighlight: 'text-emerald-600 dark:text-emerald-400',
                    badge: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30',
                    progress: 'bg-emerald-500'
                  } : {
                    textHighlight: 'text-rose-600 dark:text-rose-400',
                    badge: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border-rose-100 dark:border-rose-900/30',
                    progress: 'bg-rose-500'
                  };

                  return (
                    <div
                      key={attempt.id}
                      onClick={() => onSelectStudent(attempt.studentId)}
                      className={cn(
                        "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/50 rounded-2xl p-4 flex items-center justify-between shadow-sm cursor-pointer transition-all active:scale-[0.98]",
                        isNavigating === attempt.id ? "opacity-70 pointer-events-none" : ""
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                          <User size={18} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 min-w-0 max-w-[140px]">
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {attempt.student?.name}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                            {attempt.student?.studentId || "UID-UNSET"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-black ${theme.textHighlight}`}>
                            {scorePercent}%
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded border ${theme.badge}`}>
                          {isPassed ? "Passed" : "Review"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/80 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-16 text-center">#</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Details</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Score</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                      <th className="p-4 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                    {paginatedAttempts.map((attempt: any, idx: number) => {
                      const scorePercent = attempt.totalMarks ? Math.round((attempt.totalScore / attempt.totalMarks) * 100) : Math.round(attempt.totalScore || attempt.percentage || 0);
                      const serialNumber = idx + 1 + (currentPage - 1) * itemsPerPage;
                      const isPassed = scorePercent >= 50;

                      const theme = isPassed ? {
                        textHighlight: 'text-emerald-600 dark:text-emerald-400',
                        badge: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30',
                        progress: 'bg-emerald-500'
                      } : {
                        textHighlight: 'text-rose-600 dark:text-rose-400',
                        badge: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border-rose-100 dark:border-rose-900/30',
                        progress: 'bg-rose-500'
                      };

                      return (
                        <tr
                          key={attempt.id}
                          onClick={() => onSelectStudent(attempt.studentId)}
                          className={cn(
                            "group border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors relative cursor-pointer",
                            isNavigating === attempt.id ? "opacity-70 pointer-events-none" : ""
                          )}
                        >
                          <td className="p-4 text-center text-xs font-bold text-slate-400 relative z-10">
                            #{serialNumber}
                          </td>
                          <td className="p-4 relative">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors shrink-0">
                                <User size={18} strokeWidth={2.5} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                  {attempt.student?.name}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                                  {attempt.student?.studentId || "UID-UNSET"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 relative">
                            <div className="flex items-center gap-3 max-w-[200px]">
                              <div className="flex-1 hidden sm:block h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full ${theme.progress}`} style={{ width: `${scorePercent}%` }} />
                              </div>
                              <span className={`text-sm font-black ${theme.textHighlight}`}>
                                {scorePercent}%
                              </span>
                            </div>
                          </td>
                          <td className="p-4 relative text-center">
                            <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded border ${theme.badge}`}>
                              {isPassed ? "Passed" : "Review"}
                            </span>
                          </td>
                          <td className="p-4 relative text-center">
                            <div className="h-8 w-8 flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors">
                              {isNavigating === attempt.id ? (
                                <Loader2 className="animate-spin h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-5 w-5" />
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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

        {/* Scope Export Modal */}
        <ExportResultScopeModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          onExport={handleExportScope}
          isExporting={isBatchDownloading}
          students={exportStudentOptions}
          currentStudentId={selectedStudentForExport}
          title={`Export ${exam?.title || 'Exam'} Results`}
          description="Select whether to export an individual student, the entire class, or specific students as official records."
          primaryColor={primaryColor}
          school={school}
          examTitle={exam?.title || 'Exam'}
          className={exam?.class?.name}
          sessionName={(exam as any)?.session?.name || (exam as any)?.academicSession?.name || (exam as any)?.sessionName}
        />
      </div>
    </div>
  );
}

/**
 * Detailed Student Result - Level 3
 */
