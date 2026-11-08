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
  Zap,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useExamResult } from '@/lib/api/hooks/useExams';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useFeatureAccess } from '@/lib/api/hooks/useFeatureAccess';
import Pagination from '../../components/Pagination';
import ProgressCircle from '@/components/ui/ProgressCircle';
import ExportResultScopeModal, { ExportScopeMode, ExportStudentOption } from '../../components/ExportResultScopeModal';
import { downloadIndividualResultsAsZip, downloadSingleStudentPdf, downloadCombinedAssessmentPdf } from '../../utils/batchPDFDownloader';

interface DedicatedDetailedStudentResultProps {
  examId: string;
  studentId: string;
  onBack: () => void;
  school: any;
  primaryColor: string;
  examTitle?: string;
  attempts?: any[];
}

export function DedicatedDetailedStudentResult({
  examId,
  studentId,
  onBack,
  school,
  primaryColor,
  examTitle,
  attempts,
}: DedicatedDetailedStudentResultProps) {
  const { data: result, isLoading } = useExamResult(examId, studentId);
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  const { data: hasPerformanceAccess } = useFeatureAccess('aiInsights', school?.id || schoolId);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [circleSize, setCircleSize] = useState(320);
  const [strokeWidth, setStrokeWidth] = useState(28);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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

  const exportStudentOptions = useMemo<ExportStudentOption[]>(() => {
    if (attempts && attempts.length > 0) {
      return attempts.map((a: any) => ({
        id: a.studentId || a.id,
        name: a.student?.name || 'Student',
        studentCode: a.student?.studentCode || 'N/A',
        className: a.className || result?.className || 'N/A',
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
        className: result.className || 'N/A',
        score: result.totalScore !== undefined ? result.totalScore : undefined,
        totalMarks: result.totalMarks,
        rawItem: result,
      }];
    }
    return [];
  }, [attempts, result, studentId]);

  const handleExportScope = async (mode: ExportScopeMode, selectedList: ExportStudentOption[]) => {
    if (!selectedList.length) return;
    setIsExporting(true);
    try {
      const title = examTitle || result?.title || 'Exam';
      const sessionName =
        result?.session?.name ||
        (result as any)?.academicSession?.name ||
        (result as any)?.sessionName ||
        (school as any)?.currentSession?.name ||
        (school as any)?.session?.name ||
        `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`;
      if (mode === 'combined_pdf') {
        await downloadCombinedAssessmentPdf({
          exam: { id: examId, title, sessionName, session: result?.session },
          attempts: attempts || (result ? [result] : []),
          school,
          sessionName,
        });
      } else if (mode === 'all_zip' || (mode === 'custom' && selectedList.length > 1)) {
        await downloadIndividualResultsAsZip({
          results: selectedList.map(s => s.rawItem),
          school,
          examTitle: title,
          className: result?.className,
          sessionName,
          hasPerformanceAccess,
        });
      } else {
        const itemToExport = (selectedList[0].id === studentId && result) ? result : selectedList[0].rawItem;
        await downloadSingleStudentPdf({
          result: itemToExport,
          school,
          examTitle: title,
          className: selectedList[0].className,
          sessionName,
          hasPerformanceAccess,
        });
      }
      setIsExportModalOpen(false);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">
        Loading Candidate Result...
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-20 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md text-slate-500 font-bold uppercase tracking-widest text-xs">
        Candidate result record currently unavailable
      </div>
    );
  }

  const scorePercentage = result.totalMarks ? Math.round((result.totalScore / result.totalMarks) * 100) : 0;

  return (
    <TooltipProvider>
      <div className="space-y-8 animate-in fade-in duration-500 pb-12">
        {/* Navigation Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
          <Button
            onClick={onBack}
            variant="ghost"
            className="h-10 w-full sm:w-auto px-4 rounded-xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all text-xs font-bold gap-2 border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back to Cohort List
          </Button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold">
              <ShieldCheck size={16} /> Verified Academic Record
            </div>
            <Button
              onClick={() => setIsExportModalOpen(true)}
              disabled={isExporting}
              className="h-10 w-full sm:w-auto sm:px-4 rounded-xl text-white font-bold text-xs gap-2 shadow-sm border-0 cursor-pointer hover:opacity-95"
              style={{ backgroundColor: primaryColor }}
            >
              {isExporting ? <Loader2 className="animate-spin h-4 w-4" /> : <Download className="h-4 w-4" />}
              <span>Export PDF Options</span>
            </Button>
          </div>
        </div>

        {/* Main Result Card */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-black border-4 border-slate-700/50 shadow-2xl p-8 lg:p-12 group">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none transition-transform duration-1000 group-hover:scale-110">
            <GraduationCap size={400} className="text-white rotate-12 -translate-y-20 translate-x-10" />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 relative z-10">
            <div className="space-y-8 max-w-2xl text-white">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm text-white text-[11px] font-black uppercase tracking-widest border border-white/20">
                  <User size={14} /> Student Result
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm text-white text-[11px] font-black uppercase tracking-widest border border-white/20">
                  {result.startedAt ? format(new Date(result.startedAt), "yyyy") : new Date().getFullYear()} Session
                </div>
              </div>

              <div>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-3 drop-shadow-md">
                  {result.student?.name}
                </h1>
                <p className="text-sm text-slate-300 flex flex-wrap items-center gap-2 font-medium">
                  Metrics for <span className="text-white font-bold bg-white/10 px-2.5 py-0.5 rounded-lg">{result.title}</span>
                  <span className="text-slate-600">•</span>
                  <span className="font-bold text-slate-300 uppercase tracking-wider text-xs">{result.className}</span>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Class Rank</p>
                  <p className="text-3xl font-black text-white" style={{ color: primaryColor }}>
                    #{result.position || '-'}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Score</p>
                  <p className="text-3xl font-black text-white">{result.totalScore}/{result.totalMarks}</p>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Grade</p>
                  <p className={cn(
                    "text-3xl font-black",
                    scorePercentage >= 75 ? "text-emerald-400" : scorePercentage >= 40 ? "text-amber-400" : "text-rose-400"
                  )}>{result.grade || (scorePercentage >= 75 ? 'A1' : scorePercentage >= 40 ? 'C6' : 'F9')}</p>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex justify-center lg:block">
              <div className="relative group p-4 lg:p-8">
                <div className="absolute inset-0 blur-[60px] lg:blur-[100px] rounded-full scale-125 opacity-30 lg:opacity-40 animate-pulse" style={{ backgroundColor: primaryColor }} />
                <div className="relative z-10 transition-transform duration-700 hover:scale-105">
                  <ProgressCircle
                    value={scorePercentage}
                    size={circleSize}
                    strokeWidth={strokeWidth}
                    label={`${scorePercentage}%`}
                    sublabel="Mastery"
                    className="drop-shadow-2xl"
                    primaryColor={primaryColor}
                  />
                  <div className="absolute inset-x-0 bottom-[28%] flex flex-col items-center pointer-events-none">
                    <div className="px-4 py-1.5 bg-white rounded-xl shadow-xl border border-slate-200">
                      <span className="text-[10px] lg:text-xs font-black uppercase tracking-wider inline-block" style={{ color: primaryColor }}>
                        {result.proficiency || "Excellence"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytical Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 size={18} style={{ color: primaryColor }} /> Subject Papers Breakdown
            </h3>
            <div className="space-y-3">
              {result.subjects?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((sub: any, i: number) => {
                const percent = Math.round((sub.score / sub.totalMarks) * 100);
                const subGrade = percent >= 75 ? 'A1' : percent >= 70 ? 'B2' : percent >= 65 ? 'B3' : percent >= 50 ? 'C6' : percent >= 40 ? 'D7' : 'F9';

                return (
                  <div key={i} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4 shadow-xs">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "size-12 rounded-xl flex items-center justify-center font-black text-lg border",
                        percent >= 75 ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20" : percent >= 40 ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20" : "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20"
                      )}>
                        {subGrade}
                      </div>
                      <div>
                        <p className="text-base font-bold text-slate-900 dark:text-white leading-tight">{sub.subjectName}</p>
                        <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{sub.score} / {sub.totalMarks} Questions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "text-2xl font-black",
                        percent >= 75 ? "text-emerald-500" : percent >= 45 ? "text-amber-500" : "text-rose-500"
                      )}>{percent}%</p>
                    </div>
                  </div>
                );
              })}

              {result.subjects?.length > itemsPerPage && (
                <div className="pt-2">
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

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Percent size={18} style={{ color: primaryColor }} /> Cohort Standing & Insights
            </h3>
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-6 shadow-xs">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Overall Standing</p>
                <p className="text-2xl font-black" style={{ color: primaryColor }}>
                  Superior to {(result.globalStanding || 0).toFixed(1)}% of cohort
                </p>
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${result.globalStanding || 90}%`, backgroundColor: primaryColor }}
                  />
                </div>
              </div>

              {hasPerformanceAccess ? (
                <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5 space-y-2">
                  <p className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5" style={{ color: primaryColor }}>
                    <Zap size={14} fill="currentColor" /> AI Performance Diagnostic
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                    "{result.performanceInsight || "The candidate shows consistent performance with strong mastery in core subject topics."}"
                  </p>
                </div>
              ) : (
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Insights available with advanced tier</p>
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
          examTitle={examTitle || result?.title || 'Exam'}
          className={result?.className}
          sessionName={
            result?.session?.name ||
            (result as any)?.academicSession?.name ||
            (result as any)?.sessionName ||
            (school as any)?.currentSession?.name ||
            (school as any)?.session?.name ||
            `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`
          }
        />
      </div>
    </TooltipProvider>
  );
}
