"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { 
  Plus, 
  Search, 
  ChevronRight, 
  ArrowLeft, 
  Trophy, 
  User, 
  Calendar, 
  FileText,
  BarChart3,
  Users,
  GraduationCap,
  Percent,
  Download,
  Filter,
  ShieldCheck,
  Info,
  History,
  TrendingUp,
  Award,
  Loader2
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useExams, useExamAttempts, useExamResult, useSubjectPapers } from '@/lib/api/hooks/useExams';
import { useAdminGrades } from '@/lib/api/hooks/useGrades';
import { useSchoolProfile } from '@/lib/api/hooks/useSchool';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import ProgressCircle from '@/components/ui/ProgressCircle';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ExamGradeReport from './components/ExamGradeReport';
import SubjectPaperReport from '../exams/papers/[id]/components/SubjectPaperReport';
import IndividualStudentReport, { ReportPageContent } from './components/IndividualStudentReport';
import BulkIndividualReports from './components/BulkIndividualReports';
import { downloadIndividualResultsAsZip } from './utils/batchPDFDownloader';

export default function AdminGradesDashboard() {
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.defaultTenantId || '';

  const router = useRouter();
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedPaperId, setSelectedPaperId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'exams' | 'standalone' | 'papers'>('exams');
  const [searchTerm, setSearchTerm] = useState('');

  // Data fetching
  const { data: exams, isLoading: isLoadingExams } = useExams();
  const { data: standaloneGrades, isLoading: isLoadingGrades } = useAdminGrades();
  const { data: subjectPapers, isLoading: isLoadingPapers } = useSubjectPapers();
  const { data: school } = useSchoolProfile(schoolId);

  const handleBackToExams = () => {
    setSelectedExamId(null);
    setSelectedStudentId(null);
    setSelectedPaperId('all');
  };

  const handleBackToStudents = () => {
    setSelectedStudentId(null);
  };

  const handleSelectPaper = (examId: string, paperId: string) => {
    router.push(`/dashboard/admin/exams/papers/${paperId}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-4 md:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
          <div className="space-y-1 md:space-y-2">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Academic Performance
            </h1>
            <p className="text-sm md:text-base text-slate-500 font-medium">Manage and analyze student performance across the institution.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
             <Button variant="outline" className="w-full md:w-auto rounded-xl border-slate-200 dark:border-slate-800 h-12 px-6 font-bold bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center">
                <Download className="mr-2" size={18} /> Export Institution Report
             </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl w-full md:w-fit border border-slate-200 dark:border-slate-800 shadow-inner overflow-x-auto snap-x hide-scrollbar">
            <button 
                onClick={() => setActiveTab('exams')}
                className={cn(
                    "px-4 md:px-8 py-3 rounded-xl text-xs md:text-sm font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap snap-center",
                    activeTab === 'exams' ? "bg-white dark:bg-slate-800 text-primary shadow-lg" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                )}
            >
                Exam Analytics
            </button>
            <button 
                onClick={() => setActiveTab('standalone')}
                className={cn(
                    "px-4 md:px-8 py-3 rounded-xl text-xs md:text-sm font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap snap-center",
                    activeTab === 'standalone' ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-lg" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                )}
            >
                Standalone Grades
            </button>
            <button 
                onClick={() => setActiveTab('papers')}
                className={cn(
                    "px-4 md:px-8 py-3 rounded-xl text-xs md:text-sm font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap snap-center",
                    activeTab === 'papers' ? "bg-white dark:bg-slate-800 text-emerald-600 shadow-lg" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                )}
            >
                Subject Papers
            </button>
        </div>

        {/* Content Area */}
        <div className="pb-20">
          {activeTab === 'exams' ? (
            <section className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="h-10 w-10 md:h-12 md:w-12 shrink-0 rounded-xl md:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                    <Trophy size={20} className="md:w-6 md:h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight line-clamp-1">Institution Examinations</h2>
                    <p className="text-xs md:text-sm font-medium text-slate-500 line-clamp-1">Hierarchical breakdown of major exam performance.</p>
                  </div>
                </div>
                {selectedExamId && (
                   <Button variant="ghost" onClick={handleBackToExams} className="text-primary font-bold hover:bg-primary/5 rounded-xl w-full sm:w-auto mt-2 sm:mt-0">
                      View All Exams
                   </Button>
                )}
              </div>
              
              <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-2 md:p-6 shadow-xl shadow-slate-200/20 dark:shadow-none min-h-[400px]">
                <ExamGradesFlow 
                  exams={exams || []} 
                  selectedExamId={selectedExamId}
                  setSelectedExamId={setSelectedExamId}
                  selectedStudentId={selectedStudentId}
                  setSelectedStudentId={setSelectedStudentId}
                  selectedPaperId={selectedPaperId}
                  setSelectedPaperId={setSelectedPaperId}
                  onBackToExams={handleBackToExams}
                  onBackToStudents={handleBackToStudents}
                  isLoading={isLoadingExams}
                  school={school}
                />
              </div>
            </section>
          ) : activeTab === 'standalone' ? (
            <section className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shadow-sm">
                  <FileText size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Standalone Assessment Grades</h2>
                  <p className="text-sm font-medium text-slate-500">Individual quiz and assessment entries not linked to major exams.</p>
                </div>
              </div>
              
              <StandaloneGradesView 
                grades={standaloneGrades || []} 
                isLoading={isLoadingGrades} 
              />
            </section>
          ) : (
            <section className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-sm">
                  <BarChart3 size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Section & Subject Papers</h2>
                  <p className="text-sm font-medium text-slate-500">Drill down into specific subject paper performance across the institution.</p>
                </div>
              </div>

              <SubjectPapersView 
                papers={subjectPapers || []} 
                isLoading={isLoadingPapers} 
                onSelectPaper={handleSelectPaper}
              />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Exam Grades Flow - Handles Level 1 (Exams), Level 2 (Students), Level 3 (Result)
 */
function ExamGradesFlow({ 
  exams, 
  selectedExamId, 
  setSelectedExamId, 
  selectedStudentId, 
  setSelectedStudentId,
  selectedPaperId,
  setSelectedPaperId,
  onBackToExams,
  onBackToStudents,
  isLoading,
  school
}: any) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  if (selectedStudentId && selectedExamId) {
    return <DetailedStudentResult examId={selectedExamId} studentId={selectedStudentId} onBack={onBackToStudents} school={school} />;
  }

  if (selectedExamId) {
    return <ExamStudentList 
      examId={selectedExamId} 
      onBack={onBackToExams} 
      onSelectStudent={setSelectedStudentId}
      selectedPaperId={selectedPaperId}
      setSelectedPaperId={setSelectedPaperId}
      school={school}
    />;
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Search & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative group flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
            <input 
                type="text" 
                placeholder="Search exams..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-slate-700 dark:text-slate-200"
            />
        </div>
        <div className="flex items-center gap-2 md:gap-3">
             <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white dark:bg-slate-800 text-primary shadow-sm" : "text-slate-400 hover:text-slate-600")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white dark:bg-slate-800 text-primary shadow-sm" : "text-slate-400 hover:text-slate-600")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
                </button>
             </div>
             <Button variant="outline" className="rounded-xl border-slate-200 dark:border-slate-800 h-10 md:h-12 px-4 md:px-6 font-bold hidden sm:flex">
                <Filter className="mr-2" size={18} /> Filter
             </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 rounded-[2rem] bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
           <Trophy className="h-12 w-12 text-slate-300 mx-auto mb-4" />
           <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No examination data available</p>
        </div>
      ) : (
        <div className={cn(
            viewMode === 'grid' 
                ? "grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6" 
                : "flex flex-col space-y-4"
        )}>
            {exams.map((exam: any) => (
                <div 
                    key={exam.id} 
                    onClick={() => setSelectedExamId(exam.id)}
                    className="group relative overflow-hidden bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800/60 rounded-[2rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mt-10 -mr-10 group-hover:bg-primary/20 transition-colors duration-500"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl -mb-8 -ml-8 group-hover:bg-indigo-500/10 transition-colors duration-500"></div>
                    
                    {viewMode === 'grid' ? (
                        <div className="relative z-10 space-y-4 md:space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 shadow-inner">
                                    <Trophy size={viewMode === 'grid' ? 24 : 28} className="drop-shadow-sm w-6 h-6 md:w-7 md:h-7" />
                                </div>
                                <div className="px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50 line-clamp-1 max-w-[60%] text-center">
                                    {exam.category || 'General'}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm md:text-xl font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1" title={exam.title}>{exam.title}</h3>
                                <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mt-1 md:mt-1.5 opacity-80">
                                    <span className="text-[9px] md:text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-1.5 md:px-2 py-0.5 rounded-md">C {exam.classId || "All"}</span>
                                    <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700 hidden sm:block" />
                                    <span className="text-[9px] md:text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{exam.questions?.length || 0} Pprs</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
                                <div className="flex -space-x-1 md:-space-x-2">
                                    {[1,2,3].map(i => (
                                        <div key={i} className="h-6 w-6 md:h-8 md:w-8 flex items-center justify-center rounded-full border-2 md:border-[3px] border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 text-[8px] md:text-[10px] font-bold text-slate-500 shadow-sm relative z-10">
                                            <User size={10} className="md:w-3 md:h-3" />
                                        </div>
                                    ))}
                                </div>
                                <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary group-hover:text-white text-slate-400 transition-all duration-300 shadow-sm">
                                    <ChevronRight size={16} className="translate-x-0.5" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1 w-full">
                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 shadow-inner shrink-0">
                                    <Trophy size={22} className="drop-shadow-sm" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">{exam.title}</h3>
                                    <div className="flex items-center flex-wrap gap-2 mt-1">
                                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-500">{exam.category || 'General'}</span>
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Class {exam.classId || "All"}</span>
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{exam.questions?.length || 0} Papers</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                                <div className="flex -space-x-2">
                                    {[1,2,3].map(i => (
                                        <div key={i} className="h-8 w-8 rounded-full border-[3px] border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm relative z-10">
                                            <User size={12} />
                                        </div>
                                    ))}
                                    <div className="h-8 w-8 rounded-full border-[3px] border-white dark:border-slate-900 bg-primary flex items-center justify-center text-[9px] font-black text-white shadow-sm relative z-10">
                                        +12
                                    </div>
                                </div>
                                <div className="h-10 w-10 shrink-0 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary group-hover:text-white text-slate-400 transition-all duration-300 shadow-sm">
                                    <ChevronRight size={18} className="translate-x-0.5" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
      )}
    </div>
  );
}

/**
 * Exam Student List - Level 2
 */
function ExamStudentList({ 
  examId, 
  onBack, 
  onSelectStudent,
  selectedPaperId,
  setSelectedPaperId,
  school
}: any) {
  const { data: attempts, isLoading } = useExamAttempts(examId);
  const { data: exams } = useExams();
  const router = useRouter();
  const [showMobilePapers, setShowMobilePapers] = useState(false);
  const [isNavigating, setIsNavigating] = useState<string | null>(null);
  const [isBatchDownloading, setIsBatchDownloading] = useState(false);

  const handleBatchDownloadZip = async () => {
    if (!attempts || attempts.length === 0) return;
    setIsBatchDownloading(true);
    try {
      const exam = exams?.find((e: any) => e.id === examId);
      await downloadIndividualResultsAsZip({
        results: attempts,
        school,
        examTitle: exam?.title || 'Exam'
      });
    } catch (error) {
      console.error("Batch download failed:", error);
    } finally {
      setIsBatchDownloading(false);
    }
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="p-4 md:p-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-xs font-black uppercase tracking-widest group mb-6"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Exams
        </button>

        {/* Paper Summary Toggle (Mobile) */}
        <div className="w-full md:hidden mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <Button 
                onClick={() => setShowMobilePapers(!showMobilePapers)} 
                variant="outline" 
                className="w-full h-12 rounded-xl border-slate-200 dark:border-slate-800 font-bold bg-white dark:bg-slate-900 shadow-sm"
            >
                {showMobilePapers ? "Hide" : "Show"} Subject Papers
            </Button>
        </div>

        {/* Paper Summary Cards */}
        <div className={cn("grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8", showMobilePapers ? "grid animate-in slide-in-from-top-4 duration-300" : "hidden md:grid")}>
            <div 
              onClick={() => setSelectedPaperId('all')}
              className={cn(
                "p-6 rounded-[2rem] border transition-all cursor-pointer group",
                selectedPaperId === 'all' 
                  ? "bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-[1.02]" 
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary/50"
              )}
            >
                <div className="flex justify-between items-start mb-4">
                    <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                        selectedPaperId === 'all' ? "bg-white/20" : "bg-primary/10 text-primary"
                    )}>
                        <Trophy size={20} />
                    </div>
                </div>
                <p className={cn(
                    "text-[10px] font-black uppercase tracking-widest opacity-60 mb-1",
                    selectedPaperId === 'all' ? "text-white" : "text-slate-400"
                )}>Total Results</p>
                <h3 className="text-xl font-black tracking-tight leading-tight">Overall Performance</h3>
            </div>

            {papers.map((paper: any) => {
                const isSelected = selectedPaperId === paper.id;
                // Calculate average for this paper
                const paperScores = attempts?.map((a: any) => a.subjectAttempts?.find((sa: any) => sa.subjectPaperId === paper.id)?.score).filter((s: any) => s !== undefined) || [];
                const avg = paperScores.length > 0 ? Math.round(paperScores.reduce((a: number, b: number) => a + b, 0) / paperScores.length) : 0;

                return (
                    <div 
                      key={paper.id}
                      onClick={() => setSelectedPaperId(paper.id)}
                      className={cn(
                        "p-6 rounded-[2rem] border transition-all cursor-pointer group",
                        isSelected 
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-500/20 scale-[1.02]" 
                          : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-500/50"
                      )}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={cn(
                                "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                                isSelected ? "bg-white/20" : "bg-indigo-500/10 text-indigo-600"
                            )}>
                                <BarChart3 size={20} />
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <div className={cn(
                                    "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg",
                                    isSelected ? "bg-white/10 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                )}>
                                    Avg: {avg}
                                </div>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsNavigating(paper.id);
                                    router.push(`/dashboard/admin/exams/papers/${paper.id}`);
                                  }}
                                  disabled={isNavigating === paper.id}
                                  className={cn(
                                    "flex items-center gap-1 text-[9px] font-bold uppercase transition-all hover:underline",
                                    isSelected ? "text-white/80 hover:text-white" : "text-indigo-600 hover:text-indigo-700",
                                    isNavigating === paper.id && "opacity-70 cursor-not-allowed"
                                  )}
                                >
                                    {isNavigating === paper.id ? (
                                      <>
                                        <div className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                                        Loading
                                      </>
                                    ) : (
                                      "Details →"
                                    )}
                                </button>
                            </div>
                        </div>
                        <p className={cn(
                            "text-[10px] font-black uppercase tracking-widest opacity-60 mb-1",
                            isSelected ? "text-white" : "text-slate-400"
                        )}>Subject Paper</p>
                        <h3 className="text-xl font-black tracking-tight leading-tight truncate">{paper.name}</h3>
                    </div>
                );
            })}
        </div>

        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shadow-inner">
                      <Users size={24} />
                  </div>
                  <div>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Participant Results</h2>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{attempts?.length || 0} Students Attempted</p>
                  </div>
               </div>
               <div className="flex items-center gap-3 no-print">
                  <div className="relative">
                      <select 
                        value={selectedPaperId}
                        onChange={(e) => setSelectedPaperId(e.target.value)}
                        className="h-11 pl-4 pr-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer min-w-[160px]"
                      >
                          <option value="all">Overall Results</option>
                          {papers.map((p: any) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">▼</span>
                  </div>
                  
                  {selectedPaperId === 'all' ? (
                    <PDFDownloadLink
                      document={<ExamGradeReport exam={exams?.find((e: any) => e.id === examId)} attempts={attempts || []} school={school} />}
                      fileName={`${exams?.find((e: any) => e.id === examId)?.title || 'Exam'}_Report.pdf`}
                    >
                      {({ loading }) => (
                        <Button 
                          variant="outline" 
                          disabled={loading || isLoading}
                          className="rounded-xl font-bold h-11 border-slate-200 dark:border-slate-800 shadow-sm"
                        >
                          <Download size={18} className="mr-2" /> {loading ? 'Preparing Download...' : 'Export PDF'}
                        </Button>
                      )}
                    </PDFDownloadLink>
                  ) : (
                    <PDFDownloadLink
                      document={
                        <SubjectPaperReport 
                          paper={attempts?.[0]?.subjectAttempts?.find((sa: any) => sa.subjectPaperId === selectedPaperId)?.subjectPaper} 
                          attempts={(attempts || []).map((a: any) => ({
                            ...a.subjectAttempts?.find((sa: any) => sa.subjectPaperId === selectedPaperId),
                            examAttempt: { student: a.student }
                          }))} 
                          school={school} 
                        />
                      }
                      fileName={`${papers.find((p: any) => p.id === selectedPaperId)?.name || 'Subject'}_Report.pdf`}
                    >
                      {({ loading }) => (
                        <Button 
                          variant="outline" 
                          disabled={loading || isLoading}
                          className="rounded-xl font-bold h-11 border-slate-200 dark:border-slate-800 shadow-sm"
                        >
                          <Download size={18} className="mr-2" /> {loading ? 'Preparing Download...' : 'Export PDF'}
                        </Button>
                      )}
                    </PDFDownloadLink>
                  )}

                  <Button 
                    variant="outline" 
                    disabled={isBatchDownloading || isLoading || !attempts?.length}
                    onClick={handleBatchDownloadZip}
                    className="rounded-xl font-bold h-11 border-slate-200 dark:border-slate-800 shadow-sm bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    <Download size={18} className="mr-2" /> 
                    {isBatchDownloading ? (
                      <span className="flex items-center">
                        <Loader2 className="mr-2 animate-spin" size={14} /> Archiving...
                      </span>
                    ) : 'Batch Individual PDFs'}
                  </Button>

                  <Button variant="outline" className="rounded-xl font-bold h-11 border-slate-200 dark:border-slate-800 shadow-sm">
                     <Download size={18} className="mr-2" /> Export CSV
                  </Button>
               </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Student</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Score</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Papers</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Performance</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold animate-pulse">Loading participant data...</td></tr>
                ) : attempts?.length === 0 ? (
                  <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No attempts discovered</td></tr>
                ) : attempts?.map((attempt: any) => {
                  const paperAttempt = selectedPaperId === 'all' 
                    ? null 
                    : attempt.subjectAttempts?.find((sa: any) => sa.subjectPaperId === selectedPaperId);
                  
                  const displayScore = paperAttempt ? paperAttempt.score : attempt.totalScore;
                  const displayTotal = paperAttempt ? paperAttempt.totalMarks : attempt.totalMarks;
                  const scorePercent = Math.round((displayScore / displayTotal) * 100);

                  return (
                    <tr 
                      key={attempt.id} 
                      onClick={() => onSelectStudent(attempt.studentId)}
                      className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700 shadow-inner">
                              <User size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-700 dark:text-slate-200">{attempt.student.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{attempt.student.studentCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                          attempt.status === 'COMPLETED' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10" : "bg-amber-50 text-amber-600 dark:bg-amber-500/10"
                        )}>
                          {attempt.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                         <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                          {displayScore}<span className="text-xs text-slate-400 ml-1">/{displayTotal}</span>
                         </p>
                      </td>
                      <td className="px-8 py-6">
                          <div className="flex flex-wrap gap-2 max-w-xs">
                              {attempt.subjectAttempts?.map((sa: any) => (
                                  <div key={sa.id} className={cn(
                                      "px-2 py-1 rounded-lg border flex flex-col min-w-[80px] transition-all",
                                      selectedPaperId === sa.subjectPaperId 
                                        ? "bg-primary/10 border-primary/30" 
                                        : "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800"
                                  )}>
                                      <span className={cn(
                                          "text-[9px] font-black uppercase truncate",
                                          selectedPaperId === sa.subjectPaperId ? "text-primary" : "text-slate-400"
                                      )}>
                                          {sa.subjectPaper?.subject?.name || 'Paper'}
                                      </span>
                                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                          {sa.score}/{sa.totalMarks}
                                      </span>
                                  </div>
                              ))}
                          </div>
                      </td>
                      <td className="px-8 py-6">
                          <div className="flex items-center gap-3 w-40">
                              <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                  <div 
                                      className={cn(
                                          "h-full rounded-full transition-all duration-1000",
                                          scorePercent >= 70 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : scorePercent >= 40 ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                                      )} 
                                      style={{ width: `${scorePercent}%` }}
                                  />
                              </div>
                              <span className="text-xs font-black text-slate-500">{scorePercent}%</span>
                          </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                          <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:scale-105 transition-all shadow-sm">
                              <ChevronRight size={20} />
                          </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Detailed Student Result - Level 3
 */
function DetailedStudentResult({ examId, studentId, onBack, school }: any) {
  const { data: result, isLoading } = useExamResult(examId, studentId);

  if (isLoading) return <div className="h-[60vh] flex items-center justify-center text-slate-400 animate-pulse font-black uppercase tracking-widest text-xs">Generating Performance Insights...</div>;
  if (!result) return <div className="text-center py-20 p-8 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-slate-500 font-bold uppercase tracking-widest">In-depth analysis currently unavailable</div>;

  const scorePercentage = Math.round((result.totalScore / result.totalMarks) * 100);

  return (
    <TooltipProvider>
      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 p-4 md:p-6 pb-12">
        <div className="flex items-center justify-between no-print">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-xs font-black uppercase tracking-widest group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Participant List
          </button>

          <div className="flex items-center gap-3">
             <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
                <ShieldCheck size={14} /> Certified Digital Record
             </div>
             <PDFDownloadLink
                document={<IndividualStudentReport result={result} school={school} />}
                fileName={`${result.student?.name || 'Student'}_${result.title || 'Result'}.pdf`}
              >
                {({ loading }) => (
                  <Button 
                    disabled={loading}
                    className="rounded-2xl h-10 px-6 font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm hover:shadow-lg transition-all"
                    variant="outline"
                  >
                    <Download className="mr-2" size={16} /> {loading ? 'Preparing Download...' : 'Download Statement'}
                  </Button>
                )}
              </PDFDownloadLink>
          </div>
        </div>

        {/* Main Result Card */}
        <div className="relative overflow-hidden rounded-[3rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl p-8 md:p-12">
              <div className="absolute top-0 right-0 p-8 opacity-[0.05] dark:opacity-[0.03] pointer-events-none">
                  <GraduationCap size={400} className="text-primary rotate-12 -translate-y-20 translate-x-20" />
              </div>
              
              {/* Official Seal Watermark (Nigerian Context) */}
              <div className="absolute bottom-10 right-10 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                  <Award size={200} className="rotate-12" />
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 relative z-10">
                  <div className="space-y-8 max-w-2xl text-center md:text-left">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-primary/10 text-primary dark:text-primary-400 text-xs font-black uppercase tracking-widest border border-primary/20">
                            <User size={16} /> Academic Performance Transcript
                        </div>
                        <div className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                           {result.startedAt ? format(new Date(result.startedAt), "yyyy") : new Date().getFullYear()} SESSION
                        </div>
                      </div>
                      
                      <div>
                          <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 mb-2">
                             <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.05]">
                                {result.student?.name}
                             </h1>
                             <span className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">
                                REG: {result.student?.studentCode}
                             </span>
                          </div>
                          <p className="text-lg text-slate-500 font-medium border-l-4 border-primary pl-4">
                            Result for <span className="text-slate-900 dark:text-white font-black underline decoration-primary/30 decoration-4">{result.title}</span> 
                            <span className="ml-2 text-primary font-black opacity-50">• {result.className}</span>
                          </p>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="p-6 rounded-[1.5rem] bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-inner group hover:border-primary/30 transition-colors cursor-help">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-center md:justify-start gap-1">
                                Peer Standing <Info size={10} />
                              </p>
                              <p className="text-2xl font-black text-slate-900 dark:text-white italic">TOP {100 - (result.globalStanding || 0)}%</p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-slate-900 text-white border-none rounded-xl p-3">
                            <p className="text-[10px] font-bold">Your rank compared to all attendees of this assessment.</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                             <div className="p-6 rounded-[1.5rem] bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-inner group hover:border-primary/30 transition-colors cursor-help">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-center md:justify-start gap-1">
                                  Weighted Aggregate <Info size={10} />
                                </p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{result.totalScore}/{result.totalMarks}</p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-slate-900 text-white border-none rounded-xl p-3">
                            <p className="text-[10px] font-bold">Total marks achieved across all subject components.</p>
                          </TooltipContent>
                        </Tooltip>

                         <Tooltip>
                           <TooltipTrigger asChild>
                              <div className="p-6 rounded-[1.5rem] bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-inner group hover:border-primary/30 transition-colors cursor-help">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-center md:justify-start gap-1">
                                  Final Grade <Info size={10} />
                                </p>
                                <p className={cn(
                                  "text-2xl font-black uppercase",
                                  scorePercentage >= 75 ? "text-emerald-500" : scorePercentage >= 40 ? "text-amber-500" : "text-rose-500"
                                )}>{result.grade || (scorePercentage >= 75 ? 'A1' : scorePercentage >= 40 ? 'C6' : 'F9')}</p>
                            </div>
                           </TooltipTrigger>
                           <TooltipContent className="bg-slate-900 text-white border-none rounded-xl p-3">
                            <p className="text-[10px] font-bold">Nigerian standard alphabetical grade reflection.</p>
                          </TooltipContent>
                         </Tooltip>
                      </div>
                  </div>

                  <div className="shrink-0 flex justify-center">
                      <div className="relative group p-4">
                          <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full scale-125 opacity-50 dark:opacity-20 animate-pulse" />
                          <div className="relative z-10 transition-transform duration-700 hover:rotate-6">
                            <ProgressCircle 
                                value={scorePercentage}
                                size={280}
                                strokeWidth={22}
                                label={`${scorePercentage}%`}
                                sublabel="Overall Mastery"
                                className="drop-shadow-2xl"
                            />
                            {/* Inner Grade Hub */}
                            <div className="absolute inset-x-0 bottom-[35%] flex flex-col items-center pointer-events-none">
                               <div className="px-3 py-1 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-100 dark:border-slate-800">
                                  <span className="text-[10px] font-black text-primary uppercase tracking-widest animate-bounce inline-block">
                                    {result.proficiency || "Distinction"}
                                  </span>
                               </div>
                            </div>
                          </div>
                      </div>
                  </div>
              </div>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3 uppercase tracking-wider">
                          <BarChart3 className="text-primary" /> Subject Mastery Breakdown
                      </h3>
                  </div>
                  <div className="space-y-4">
                      {result.subjects?.map((sub: any, i: number) => {
                          const percent = Math.round((sub.score / sub.totalMarks) * 100);
                          const subGrade = percent >= 75 ? 'A1' : percent >= 70 ? 'B2' : percent >= 65 ? 'B3' : percent >= 50 ? 'C6' : percent >= 40 ? 'D7' : 'F9';
                          
                          return (
                              <div key={i} className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-primary transition-all shadow-sm hover:shadow-xl hover:shadow-primary/5">
                                  <div className="flex items-center gap-6">
                                      <div className={cn(
                                        "h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner",
                                        percent >= 75 ? "bg-emerald-500/10 text-emerald-500" : percent >= 40 ? "bg-amber-500/10 text-amber-500" : "bg-rose-500/10 text-rose-500"
                                      )}>
                                        {subGrade}
                                      </div>
                                      <div className="space-y-1">
                                          <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">{sub.subjectName}</p>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weighted Score: {sub.score} / {sub.totalMarks}</p>
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-8 text-right">
                                      <div className="h-14 w-1 bg-slate-100 dark:bg-slate-800 rounded-full" />
                                      <div className="w-16">
                                          <p className={cn(
                                              "text-2xl font-black",
                                              percent >= 75 ? "text-emerald-500" : percent >= 45 ? "text-amber-500" : "text-rose-500"
                                          )}>{percent}%</p>
                                      </div>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>

              <div className="space-y-6">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3 px-2 uppercase tracking-wider">
                      <Percent className="text-indigo-500" /> Statistical Comparison
                  </h3>
                  <div className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-10 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
                         <TrendingUp size={200} />
                      </div>

                      <div className="space-y-6 relative z-10">
                          <div className="flex justify-between items-end">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="cursor-help group">
                                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">Global Standing Rank <Info size={10} /></p>
                                      <p className="text-3xl font-black text-primary group-hover:scale-105 transition-transform duration-300">Superior to {(result.globalStanding || 0).toFixed(1)}%</p>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-slate-900 text-white border-none rounded-xl p-3">
                                  <p className="text-[10px] font-bold">This percentage indicates how many of your peers scored lower than you globally.</p>
                                </TooltipContent>
                              </Tooltip>
                              
                              <div className={cn(
                                "h-14 w-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg border-2",
                                scorePercentage >= 75 ? "bg-emerald-500 text-white border-emerald-400" : "bg-primary text-white border-primary/50"
                              )}>
                                  {result.grade || (scorePercentage >= 75 ? 'A1' : 'C6')}
                              </div>
                          </div>
                          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner p-0.5">
                              <div 
                                className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-1000" 
                                style={{ width: `${result.globalStanding || 92}%` }}
                              />
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6 relative z-10">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center shadow-inner hover:border-primary/20 transition-colors cursor-help">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-1">Class Median <Info size={10} /></p>
                                  <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{Math.round((result.classAverage / result.totalMarks) * 100) || "76"}%</p>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 text-white border-none rounded-xl p-3">
                              <p className="text-[10px] font-bold">The middle score in the entire class for this assessment.</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                               <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center shadow-inner hover:border-emerald-500/20 transition-colors cursor-help">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-1">Trend Velocity <Info size={10} /></p>
                                  <div className="flex items-center justify-center gap-2">
                                      <span className={cn(
                                        "h-2 w-2 rounded-full animate-pulse",
                                        (result.velocity || 0) >= 0 ? "bg-emerald-500" : "bg-rose-500"
                                      )} />
                                      <p className={cn(
                                        "text-2xl font-black",
                                        (result.velocity || 0) >= 0 ? "text-emerald-500" : "text-rose-500"
                                      )}>{(result.velocity || 0) >= 0 ? '+' : ''}{result.velocity || "0"}%</p>
                                  </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 text-white border-none rounded-xl p-3">
                              <p className="text-[10px] font-bold">Your growth trajectory compared to your previous performance average.</p>
                            </TooltipContent>
                          </Tooltip>
                      </div>

                      <div className="p-8 rounded-[2rem] bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/20 relative group overflow-hidden">
                          <History className="absolute -right-4 -bottom-4 text-indigo-500 opacity-5 group-hover:opacity-10 transition-opacity" size={100} />
                          <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                             <TrendingUp size={14} /> Analytical Summary
                          </p>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic relative z-10">
                              "{result.performanceInsight || "The student exhibits consistent engagement and has a solid path towards future academic excellence."}"
                          </p>
                      </div>
                  </div>
              </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

/**
 * Standalone Grades View
 */
function StandaloneGradesView({ grades, isLoading }: any) {
  return (
    <div className="space-y-8">
      {/* Search & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative group flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input 
                type="text" 
                placeholder="Search standalone grades..."
                className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-700 dark:text-slate-200"
            />
        </div>
        <div className="flex items-center gap-3">
             <Button variant="outline" className="rounded-xl h-12 px-6 font-bold border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <Download size={18} className="mr-2" /> Export
             </Button>
             <Button className="rounded-xl h-12 px-6 font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">
                <Plus size={18} className="mr-2" /> Manual Entry
             </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Student</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Subject / Paper</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Score</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Type</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Date Recorded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold animate-pulse uppercase tracking-widest text-[10px]">Retrieving grade records...</td></tr>
              ) : grades.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No standalone entries found</td></tr>
              ) : grades.map((grade: any) => (
                <tr key={grade.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shadow-inner">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-700 dark:text-slate-200">{grade.student?.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Class {grade.class?.name}{grade.class?.section}</p>
                        </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-700 dark:text-slate-200">{grade.subject}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{grade.assessmentType}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                      <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                        {grade.score}<span className="text-xs text-slate-400 ml-1">/{grade.maxMarks}</span>
                      </p>
                  </td>
                  <td className="px-8 py-6">
                      <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-900/30 shadow-sm">
                        {grade.assessmentType || 'General'}
                      </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                      <p className="text-xs text-slate-500 font-bold tracking-tight">{format(new Date(grade.createdAt), "MMMM d, yyyy")}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * Subject Papers View - Level 1 for Papers
 */
function SubjectPapersView({ papers, isLoading, onSelectPaper }: any) {
  const [showMobileGrid, setShowMobileGrid] = useState(false);
  const [isNavigating, setIsNavigating] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* Search & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative group flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input 
                type="text" 
                placeholder="Search subject papers..."                className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-slate-700 dark:text-slate-200"
            />
        </div>
        <div className="w-full md:hidden">
            <Button 
                onClick={() => setShowMobileGrid(!showMobileGrid)} 
                variant="outline" 
                className="w-full h-12 rounded-xl border-slate-200 dark:border-slate-800 font-bold bg-white dark:bg-slate-900 shadow-sm"
            >
                {showMobileGrid ? "Hide" : "Show"} Subject Papers
            </Button>
        </div>
      </div>

      <div className={cn("grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", showMobileGrid ? "grid" : "hidden md:grid")}>
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-48 rounded-[2.5rem] bg-white dark:bg-slate-900 animate-pulse border border-slate-100 dark:border-slate-800" />)
        ) : papers.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
             <BarChart3 className="h-12 w-12 text-slate-200 mx-auto mb-4" />
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No subject papers discovered</p>
          </div>
        ) : (
          papers.map((paper: any) => (
            <div 
              key={paper.id}
              onClick={() => {
                  setIsNavigating(paper.id);
                  onSelectPaper(paper.exams?.[0]?.examId || 'none', paper.id);
              }}
              className={cn(
                  "group bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-[2rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 relative overflow-hidden",
                  isNavigating === paper.id ? "opacity-70 pointer-events-none scale-[0.98] border-emerald-500" : "hover:border-emerald-500/30 hover:-translate-y-1 cursor-pointer"
              )}
            >
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500">
                    <BarChart3 size={150} className="text-emerald-500 -mr-10 -mt-10 rotate-12" />
                </div>
                
                <div className="relative z-10 space-y-6">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-500/20 dark:to-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black shadow-inner text-xl">
                        {paper.subject?.name?.charAt(0) || 'P'}
                    </div>

                    <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors line-clamp-1">{paper.title}</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1.5 bg-slate-100 dark:bg-slate-800 w-fit px-2 py-0.5 rounded-md">{paper.subject?.name || 'Unassigned Subject'}</p>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800/80">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Parent Exam</span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                                {paper.exams?.[0]?.exam?.title || 'Standalone Paper'}
                            </span>
                        </div>
                        <div className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm",
                            isNavigating === paper.id 
                                ? "bg-emerald-500 text-white" 
                                : "bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-emerald-500 group-hover:text-white hover:scale-105"
                        )}>
                            {isNavigating === paper.id ? (
                                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                            ) : (
                                <ChevronRight size={18} className="translate-x-0.5" />
                            )}
                        </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

