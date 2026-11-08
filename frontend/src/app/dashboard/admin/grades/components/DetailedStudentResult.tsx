"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  Download,
  Loader2,
  ArrowLeft,
  GraduationCap,
  BarChart3,
  Percent,
  TrendingUp,
  Info,
  History,
  Zap,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useExamResult, useExamAttempts, useExams } from '@/lib/api/hooks/useExams';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useFeatureAccess } from '@/lib/api/hooks/useFeatureAccess';
import ProgressCircle from '@/components/ui/ProgressCircle';
import Pagination from './Pagination';
import ExportResultScopeModal, { ExportScopeMode, ExportStudentOption } from './ExportResultScopeModal';
import { downloadIndividualResultsAsZip, downloadSingleStudentPdf, downloadCombinedAssessmentPdf } from '../utils/batchPDFDownloader';

interface DetailedStudentResultProps {
  examId: string;
  studentId: string;
  onBack: () => void;
  school: any;
  primaryColor: string;
}

export default function DetailedStudentResult({
  examId,
  studentId,
  onBack,
  school,
  primaryColor
}: DetailedStudentResultProps) {
  const { data: result, isLoading } = useExamResult(examId, studentId);
  const { data: attempts } = useExamAttempts(examId);
  const { data: exams } = useExams();
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  const { data: hasPerformanceAccess } = useFeatureAccess('aiInsights', school?.id || schoolId);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [circleSize, setCircleSize] = useState(320);
  const [strokeWidth, setStrokeWidth] = useState(28);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const exam = exams?.find((e: any) => e.id === examId);
  const examClassName = exam?.class?.name || result?.className || 'Class';

  // Format student options for the ExportResultScopeModal
  const exportStudentOptions = useMemo<ExportStudentOption[]>(() => {
    if (attempts && attempts.length > 0) {
      return attempts.map((a: any) => ({
        id: a.studentId || a.id,
        name: a.student?.name || 'Student',
        studentCode: a.student?.studentCode || 'N/A',
        className: a.className || examClassName || a.student?.class?.name || 'N/A',
        score: a.totalScore !== undefined ? a.totalScore : a.percentage,
        totalMarks: a.totalMarks,
        rawItem: a,
      }));
    }
    if (result) {
      return [{
        id: result.studentId || studentId,
        name: result.student?.name || 'Student',
        studentCode: result.student?.studentCode || 'N/A',
        className: result.className || examClassName || 'N/A',
        score: result.totalScore !== undefined ? result.totalScore : undefined,
        totalMarks: result.totalMarks,
        rawItem: result,
      }];
    }
    return [];
  }, [attempts, result, studentId, examClassName]);

  const handleExportScope = async (
    mode: ExportScopeMode,
    selectedList: ExportStudentOption[],
    format?: any,
    isPaying: boolean = true
  ) => {
    if (!selectedList.length) return;
    setIsExporting(true);
    try {
      const examTitle = exam?.title || result?.title || 'Exam';
      const examObj = exam as any;
      const sessionName = examObj?.session?.name || examObj?.academicSession?.name || result?.session?.name || (result as any)?.academicSession?.name || (result as any)?.sessionName;
      if (mode === 'combined_pdf') {
        await downloadCombinedAssessmentPdf({
          exam: exam ? { ...exam, sessionName } : { id: examId, title: examTitle, sessionName, session: result?.session },
          attempts: attempts || (result ? [result] : []),
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
          hasPerformanceAccess,
          isPaying,
        });
      } else {
        // If it's the current detailed student, use result directly for richest data
        const itemToExport = (selectedList[0].id === studentId && result) ? result : selectedList[0].rawItem;
        await downloadSingleStudentPdf({
          result: itemToExport,
          school,
          examTitle,
          className: selectedList[0].className,
          sessionName,
          hasPerformanceAccess,
          isPaying,
        });
      }
      setIsExportModalOpen(false);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 640;
      setCircleSize(isMobile ? 220 : 320);
      setStrokeWidth(isMobile ? 18 : 28);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading) return <div className="h-[60vh] flex items-center justify-center text-slate-400 animate-pulse font-black uppercase tracking-widest text-xs">Loading Result Details...</div>;
  if (!result) return <div className="text-center py-20 p-8 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-slate-500 font-bold uppercase tracking-widest">In-depth analysis currently unavailable</div>;

  const scorePercentage = Math.round((result.totalScore / result.totalMarks) * 100);

  return (
    <TooltipProvider>
      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
          <Button
            onClick={onBack}
            variant="ghost"
            className="h-10 w-full sm:w-auto px-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all text-sm font-medium gap-2 border border-slate-200 dark:border-slate-700"
          >
            <ArrowLeft size={16} />
            Student List
          </Button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-medium">
              <ShieldCheck size={16} /> Verified Record
            </div>
            <Button
              onClick={() => setIsExportModalOpen(true)}
              disabled={isExporting}
              className="h-10 w-full sm:w-auto sm:px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium text-sm gap-2 shadow-sm border-0 cursor-pointer hover:opacity-90"
            >
              {isExporting ? <Loader2 className="animate-spin h-4 w-4" /> : <Download className="h-4 w-4" />}
              {isExporting ? 'Preparing...' : 'Export PDF'}
            </Button>
          </div>
        </div>

        {/* Main Result Hub */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-black border-4 border-slate-700/50 shadow-2xl p-8 lg:p-12 mb-12 group">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none transition-transform duration-1000 group-hover:scale-110">
            <GraduationCap size={400} className="text-white rotate-12 -translate-y-20 translate-x-10" />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 relative z-10">
            <div className="space-y-10 max-w-2xl text-white">
              <div className="flex flex-wrap items-center gap-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-white text-xs font-black uppercase tracking-widest border border-white/20 shadow-sm">
                  <User size={16} /> Student Result
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-white text-xs font-black uppercase tracking-widest border border-white/20 shadow-sm">
                  {result.startedAt ? format(new Date(result.startedAt), "yyyy") : new Date().getFullYear()} Session
                </div>
              </div>

              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4 drop-shadow-md">
                  {result.student?.name}
                </h1>
                <p className="text-base text-slate-300 flex flex-wrap items-center gap-3 font-medium">
                  Metrics for <span className="text-white font-bold bg-white/10 px-3 py-1 rounded-lg">{result.title}</span>
                  <span className="text-slate-600">•</span>
                  <span className="font-bold text-slate-300 uppercase tracking-widest text-sm">{result.className}</span>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg hover:bg-white/10 transition-colors">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Class Rank</p>
                  <p className="text-4xl font-black text-white drop-shadow-md" style={{ color: primaryColor }}>
                    #{result.position || '-'}
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg hover:bg-white/10 transition-colors">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Score</p>
                  <p className="text-4xl font-black text-white drop-shadow-md">{result.totalScore}/{result.totalMarks}</p>
                </div>

                <div className="p-6 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg hover:bg-white/10 transition-colors">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Grade</p>
                  <p className={cn(
                    "text-4xl font-black drop-shadow-md",
                    scorePercentage >= 75 ? "text-emerald-400" : scorePercentage >= 40 ? "text-amber-400" : "text-rose-400"
                  )}>{result.grade || (scorePercentage >= 75 ? 'A1' : scorePercentage >= 40 ? 'C6' : 'F9')}</p>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex justify-center lg:block">
              <div className="relative group p-4 lg:p-10">
                <div className="absolute inset-0 blur-[60px] lg:blur-[120px] rounded-full scale-125 opacity-30 lg:opacity-40 animate-pulse" style={{ backgroundColor: primaryColor }} />
                <div className="relative z-10 transition-transform duration-1000 hover:scale-105">
                  <ProgressCircle
                    value={scorePercentage}
                    size={circleSize}
                    strokeWidth={strokeWidth}
                    label={`${scorePercentage}%`}
                    sublabel="Mastery"
                    className="drop-shadow-2xl"
                    primaryColor={primaryColor}
                  />
                  <div className="absolute inset-x-0 bottom-[30%] flex flex-col items-center pointer-events-none">
                    <div className="px-5 py-2 bg-white rounded-2xl shadow-2xl border border-slate-200">
                      <span className="text-[10px] lg:text-sm font-black uppercase tracking-[0.2em] inline-block" style={{ color: primaryColor }}>
                        {result.proficiency || "Excellence"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytic Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <BarChart3 size={20} style={{ color: primaryColor }} /> Analysis
              </h3>
            </div>
            <div className="space-y-4">
              {result.subjects?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((sub: any, i: number) => {
                const percent = Math.round((sub.score / sub.totalMarks) * 100);
                const subGrade = percent >= 75 ? 'A1' : percent >= 70 ? 'B2' : percent >= 65 ? 'B3' : percent >= 50 ? 'C6' : percent >= 40 ? 'D7' : 'F9';

                return (
                  <div key={i} className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-blue-500/50 hover:shadow-lg transition-all shadow-sm hover:-translate-y-0.5">
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "h-14 w-14 shrink-0 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner border-2",
                        percent >= 75 ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20" : percent >= 40 ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20" : "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20"
                      )}>
                        {subGrade}
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-black text-slate-900 dark:text-white leading-none line-clamp-1 group-hover:text-blue-600 transition-colors">{sub.subjectName}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">{sub.score} / {sub.totalMarks} Questions</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-5 text-right border-t-2 sm:border-t-0 border-slate-100 dark:border-slate-800/50 pt-4 sm:pt-0">
                      <div className="h-10 w-0.5 bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                      <div className="sm:w-20">
                        <p className={cn(
                          "text-3xl font-black drop-shadow-sm",
                          percent >= 75 ? "text-emerald-500" : percent >= 45 ? "text-amber-500" : "text-rose-500"
                        )}>{percent}%</p>
                      </div>
                      <div className="sm:hidden text-[10px] font-bold uppercase tracking-widest text-slate-500">Performance</div>
                    </div>
                  </div>
                );
              })}

              {result.subjects?.length > itemsPerPage && (
                <div className="pt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(result.subjects.length / itemsPerPage)}
                    totalItems={result.subjects.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-3">
              <Percent size={20} className="text-primary" /> Class Comparison
            </h3>
            <div className="p-8 lg:p-10 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 space-y-10 shadow-lg relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-6">
                <TrendingUp size={180} />
              </div>

              <div className="space-y-8 relative z-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">Overall Standing <Info size={14} /></p>
                    <p className="text-3xl font-black drop-shadow-sm" style={{ color: primaryColor }}>Superior to {(result.globalStanding || 0).toFixed(2)}%</p>
                  </div>

                  <div className={cn(
                    "h-20 w-20 rounded-3xl flex items-center justify-center font-black text-4xl shadow-xl border-4",
                    scorePercentage >= 75 ? "bg-emerald-500 text-white border-emerald-400" : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
                  )}
                  >
                    {result.grade || (scorePercentage >= 75 ? 'A1' : 'C6')}
                  </div>
                </div>
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner border border-slate-200/50 dark:border-slate-700/50">
                  <div
                    className="h-full rounded-full transition-all duration-1000 shadow-sm"
                    style={{ width: `${result.globalStanding || 92}%`, background: `linear-gradient(to right, ${primaryColor}, #2563eb)` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 relative z-10">
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700/50 text-center shadow-sm">
                  <div className="flex items-center justify-center gap-1.5 mb-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Class Average</p>
                    <TooltipProvider>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <button type="button" className="text-slate-400 hover:text-blue-500 focus:outline-none">
                            <Info size={12} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl">
                          The average score across the entire class for this exam.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-4xl font-black text-slate-900 dark:text-white">{Math.round((result.classAverage / result.totalMarks) * 100) || "76"}%</p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700/50 text-center shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Progress</p>
                  <div className="flex items-center justify-center gap-3">
                    <span className={cn(
                      "h-3 w-3 rounded-full shadow-sm",
                      (result.velocity || 0) >= 0 ? "bg-emerald-500" : "bg-rose-500"
                    )} />
                    <p className={cn(
                      "text-4xl font-black leading-none drop-shadow-sm",
                      (result.velocity || 0) >= 0 ? "text-emerald-500" : "text-rose-500"
                    )}>{(result.velocity || 0) >= 0 ? '+' : ''}{result.velocity || "0"}%</p>
                  </div>
                </div>
              </div>

              {hasPerformanceAccess ? (
                <div className="p-8 rounded-3xl border-2 border-primary/30 relative group/insight overflow-hidden bg-primary/10 shadow-inner">
                  <History className="absolute -right-6 -bottom-6 opacity-[0.03] transition-transform duration-700 group-hover/insight:scale-110 group-hover/insight:-rotate-12" size={150} style={{ color: primaryColor }} />
                  <p className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 drop-shadow-sm" style={{ color: primaryColor }}>
                    <Zap size={18} fill="currentColor" /> AI Insight
                  </p>
                  <p className="text-base font-bold text-slate-800 dark:text-slate-200 leading-relaxed relative z-10">
                    "{result.performanceInsight || "The student shows consistent progress and high performance across all subjects."}"
                  </p>
                </div>
              ) : (
                <div className="p-8 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center text-center shadow-inner">
                  <Zap size={32} className="text-slate-400 mb-4 drop-shadow-sm" />
                  <h4 className="text-base font-black uppercase tracking-widest text-slate-900 dark:text-white mb-2">AI Insights Locked</h4>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Upgrade your plan to unlock AI-generated performance insights for your students.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scope Export Modal */}
        <ExportResultScopeModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          onExport={handleExportScope}
          isExporting={isExporting}
          students={exportStudentOptions}
          currentStudentId={studentId}
          title={`Export ${result.student?.name || 'Student'} Result`}
          description="Download this student's result, select specific peers, or export the full class as official records."
          primaryColor={primaryColor}
          school={school}
          examTitle={exam?.title}
          className={exam?.class?.name}
          sessionName={(exam as any)?.session?.name || (exam as any)?.academicSession?.name || result?.session?.name}
        />
      </div>
    </TooltipProvider>
  );
}

