'use client';

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
  Loader2,
  Zap,
  Layers,
  ArrowRight,
  LayoutGrid,
  List,
  Printer,
  ChevronDown
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useExams, useExamAttempts, useExamResult, useSubjectPapers } from '@/lib/api/hooks/useExams';
import { useAdminGrades } from '@/lib/api/hooks/useGrades';
import { useSchoolProfile } from '@/lib/api/hooks/useSchool';
import { useSchoolSettings } from '@/lib/api/hooks/useSchool';
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
import InstitutionReportModal from './components/InstitutionReportModal';
import GradeHub from './components/GradeHub';
import { useGradeHub } from '@/lib/api/hooks/useGrades';
import { motion, AnimatePresence } from "framer-motion";

export default function AdminGradesDashboard() {
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  const { data: settings } = useSchoolSettings(schoolId);
  const primaryColor = settings?.themeColor || '#2563eb';

  const router = useRouter();
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedPaperId, setSelectedPaperId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'exams' | 'standalone' | 'papers'>('exams');
  const [searchTerm, setSearchTerm] = useState('');
  const [isInstitutionReportModalOpen, setIsInstitutionReportModalOpen] = useState(false);

  // Data fetching
  const { data: exams, isLoading: isLoadingExams } = useExams();
  const { data: standaloneGrades, isLoading: isLoadingGrades } = useGradeHub(schoolId);
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
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6 lg:p-10 transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto space-y-12">
        
        {/* Tactical Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
              <div className="size-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Academic Intelligence Terminal</span>
            </div>
            <div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.9]">
                Performance<span style={{ color: primaryColor }}>.</span>
              </h1>
              <p className="mt-4 text-lg font-medium text-slate-500 max-w-xl">
                Advanced performance analytics, grade reconciliation, and institutional achievement tracking.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => setIsInstitutionReportModalOpen(true)}
              style={{ borderColor: primaryColor, color: primaryColor }}
              variant="outline"
              className="h-16 px-10 rounded-[2rem] border-2 font-black uppercase tracking-widest gap-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
            >
              <Download size={20} strokeWidth={3} />
              Institution Report
            </Button>
          </div>
        </div>

        {/* Operational Control Tabs */}
        <div className="flex justify-center">
            <div className="p-2 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/10 shadow-inner flex items-center gap-2">
                <button 
                    onClick={() => setActiveTab('exams')}
                    className={cn(
                        "px-10 py-4 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap",
                        activeTab === 'exams' ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl scale-105" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    )}
                >
                    Exam Analytics
                </button>
                <button 
                    onClick={() => setActiveTab('standalone')}
                    className={cn(
                        "px-10 py-4 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap",
                        activeTab === 'standalone' ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl scale-105" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    )}
                >
                    Standalone Grades
                </button>
                <button 
                    onClick={() => setActiveTab('papers')}
                    className={cn(
                        "px-10 py-4 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap",
                        activeTab === 'papers' ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl scale-105" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    )}
                >
                    Subject Papers
                </button>
            </div>
        </div>

        {/* Dynamic Content Terminal */}
        <AnimatePresence mode="wait">
          {activeTab === 'exams' ? (
            <motion.section 
              key="exams"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="size-14 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400" style={{ color: primaryColor }}>
                    <Trophy size={24} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Institutional Assessments</h2>
                    <p className="text-sm font-medium text-slate-500">Hierarchical breakdown of major examination nodes.</p>
                  </div>
                </div>
                {selectedExamId && (
                   <Button variant="ghost" onClick={handleBackToExams} className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs gap-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                      <ArrowLeft size={16} strokeWidth={3} />
                      All Hubs
                   </Button>
                )}
              </div>
              
              <div className="bg-white dark:bg-slate-900/50 rounded-[4rem] border border-slate-100 dark:border-white/5 p-8 lg:p-12 shadow-2xl shadow-slate-200/50 dark:shadow-none min-h-[600px] overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: primaryColor, opacity: 0.2 }} />
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
                  primaryColor={primaryColor}
                />
              </div>
            </motion.section>
          ) : activeTab === 'standalone' ? (
            <motion.section 
              key="standalone"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400" style={{ color: primaryColor }}>
                  <FileText size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Standalone Terminal</h2>
                  <p className="text-sm font-medium text-slate-500">Individual quiz and assessment entries not linked to major hubs.</p>
                </div>
              </div>
              
              <GradeHub 
                grades={standaloneGrades || []} 
                isLoading={isLoadingGrades} 
                schoolId={schoolId}
              />
            </motion.section>
          ) : (
            <motion.section 
              key="papers"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
               <div className="flex items-center gap-4">
                <div className="size-14 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400" style={{ color: primaryColor }}>
                  <BarChart3 size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Subject Paper Modules</h2>
                  <p className="text-sm font-medium text-slate-500">Drill down into institutional curriculum performance nodes.</p>
                </div>
              </div>

              <SubjectPapersView 
                papers={subjectPapers || []} 
                isLoading={isLoadingPapers} 
                onSelectPaper={handleSelectPaper}
                primaryColor={primaryColor}
              />
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      <InstitutionReportModal 
        isOpen={isInstitutionReportModalOpen} 
        onClose={() => setIsInstitutionReportModalOpen(false)} 
        school={school}
      />
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
  school,
  primaryColor
}: any) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  if (selectedStudentId && selectedExamId) {
    return <DetailedStudentResult examId={selectedExamId} studentId={selectedStudentId} onBack={onBackToStudents} school={school} primaryColor={primaryColor} />;
  }

  if (selectedExamId) {
    return <ExamStudentList 
      examId={selectedExamId} 
      onBack={onBackToExams} 
      onSelectStudent={setSelectedStudentId}
      selectedPaperId={selectedPaperId}
      setSelectedPaperId={setSelectedPaperId}
      school={school}
      primaryColor={primaryColor}
    />;
  }

  return (
    <div className="space-y-10">
      {/* Search & Actions Terminal */}
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="relative group flex-1 max-w-xl">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" size={22} />
            <input 
                type="text" 
                placeholder="Refine assessment hub search..."
                className="w-full h-16 pl-16 pr-6 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-3xl focus:outline-none focus:ring-4 transition-all font-bold text-slate-700 dark:text-slate-200"
                style={{ '--tw-ring-color': `${primaryColor}20` } as any}
            />
        </div>
        <div className="flex items-center gap-4">
             <div className="flex bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl p-1.5 shadow-inner">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={cn("size-12 rounded-xl flex items-center justify-center transition-all", viewMode === 'grid' ? "bg-white dark:bg-slate-900 shadow-xl" : "text-slate-400 hover:text-slate-600")}
                  style={{ color: viewMode === 'grid' ? primaryColor : undefined }}
                >
                  <LayoutGrid size={20} strokeWidth={3} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={cn("size-12 rounded-xl flex items-center justify-center transition-all", viewMode === 'list' ? "bg-white dark:bg-slate-900 shadow-xl" : "text-slate-400 hover:text-slate-600")}
                  style={{ color: viewMode === 'list' ? primaryColor : undefined }}
                >
                  <List size={20} strokeWidth={3} />
                </button>
             </div>
             <Button variant="outline" className="h-16 px-8 rounded-3xl border-2 border-slate-100 dark:border-white/5 font-black uppercase tracking-widest gap-3 hidden sm:flex hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                <Filter size={18} strokeWidth={3} /> Refine Nodes
             </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 rounded-[3rem] bg-slate-50 dark:bg-white/[0.02] animate-pulse border border-slate-100 dark:border-white/5" />)}
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center py-40 bg-slate-50 dark:bg-white/[0.02] rounded-[4rem] border-2 border-dashed border-slate-100 dark:border-white/5 flex flex-col items-center justify-center gap-6">
           <Trophy className="h-20 w-20 text-slate-200 dark:text-slate-800" strokeWidth={1} />
           <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">No Assessment Hubs Discovered</p>
        </div>
      ) : (
        <div className={cn(
            viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
                : "flex flex-col space-y-6"
        )}>
            {exams.map((exam: any, index: number) => (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={exam.id} 
                    onClick={() => setSelectedExamId(exam.id)}
                    className="group relative overflow-hidden bg-white dark:bg-slate-900/40 backdrop-blur-3xl border border-slate-100 dark:border-white/5 rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-2 transition-all duration-500 cursor-pointer"
                    style={{ '--hover-border': `${primaryColor}40` } as any}
                >
                    <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[80px] -mt-10 -mr-10 transition-colors duration-700" style={{ backgroundColor: `${primaryColor}10` }} />
                    
                    <div className="relative z-10 space-y-8">
                        <div className="flex justify-between items-start">
                            <div className="size-16 rounded-[1.5rem] bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-all duration-500 border border-slate-100 dark:border-white/5" style={{ color: primaryColor }}>
                                <Trophy size={28} strokeWidth={2.5} />
                            </div>
                            <div className="px-4 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                {exam.category || 'General Assessment'}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-[1.1] uppercase tracking-tighter" style={{ '--primary': primaryColor } as any} title={exam.title}>{exam.title}</h3>
                            <div className="flex items-center gap-4 mt-3">
                                <div className="flex items-center gap-2">
                                  <Layers size={14} className="text-slate-300" />
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">Class {exam.classId || "Global"}</span>
                                </div>
                                <div className="size-1 rounded-full bg-slate-200 dark:bg-slate-800" />
                                <div className="flex items-center gap-2">
                                  <FileText size={14} className="text-slate-300" />
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">{exam.questions?.length || 0} Modules</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-8 border-t border-slate-100 dark:border-white/5">
                            <div className="flex -space-x-3">
                                {[1,2,3].map(i => (
                                    <div key={i} className="size-10 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shadow-sm relative z-10 transition-transform group-hover:-translate-x-1">
                                        <User size={16} />
                                    </div>
                                ))}
                                <div className="size-10 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-black text-white shadow-sm relative z-20" style={{ backgroundColor: primaryColor }}>
                                    +12
                                </div>
                            </div>
                            <div className="size-12 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:text-white text-slate-400 transition-all duration-500 shadow-sm" style={{ '--hover-bg': primaryColor } as any}>
                                <ChevronRight size={20} strokeWidth={3} className="translate-x-0.5" />
                            </div>
                        </div>
                    </div>
                </motion.div>
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
  school,
  primaryColor
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

  const filteredAttempts = useMemo(() => {
    if (selectedPaperId === 'all') return attempts;
    return attempts?.filter((a: any) => a.subjectAttempts?.some((sa: any) => sa.subjectPaperId === selectedPaperId));
  }, [attempts, selectedPaperId]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
      <div>
        <Button 
          onClick={onBack}
          variant="ghost"
          className="h-14 px-8 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-500 transition-all text-xs font-black uppercase tracking-[0.2em] gap-3 mb-10 border border-slate-100 dark:border-white/5"
          style={{ '--hover-text': primaryColor } as any}
        >
          <ArrowLeft size={16} strokeWidth={3} />
          Protocol Root
        </Button>

        {/* Tactical Summary Cluster */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div 
              onClick={() => setSelectedPaperId('all')}
              className={cn(
                "p-10 rounded-[3rem] border-2 transition-all cursor-pointer group relative overflow-hidden",
                selectedPaperId === 'all' 
                  ? "text-white shadow-2xl scale-[1.02]" 
                  : "bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5"
              )}
              style={{ 
                backgroundColor: selectedPaperId === 'all' ? primaryColor : undefined,
                borderColor: selectedPaperId === 'all' ? primaryColor : undefined,
                boxShadow: selectedPaperId === 'all' ? `0 25px 50px -12px ${primaryColor}40` : undefined
              }}
            >
                <div className="relative z-10 space-y-6">
                    <div className={cn(
                        "size-14 rounded-2xl flex items-center justify-center transition-all duration-500 border",
                        selectedPaperId === 'all' ? "bg-white/20 border-white/30" : "bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5"
                    )}
                    style={{ color: selectedPaperId === 'all' ? undefined : primaryColor }}
                    >
                        <Trophy size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className={cn(
                          "text-[10px] font-black uppercase tracking-widest opacity-60 mb-1",
                          selectedPaperId === 'all' ? "text-white" : "text-slate-400"
                      )}>Registry Mode</p>
                      <h3 className="text-2xl font-black tracking-tighter uppercase leading-tight">Aggregate View</h3>
                    </div>
                </div>
            </div>

            {papers.map((paper: any) => {
                const isSelected = selectedPaperId === paper.id;
                const paperScores = attempts?.map((a: any) => a.subjectAttempts?.find((sa: any) => sa.subjectPaperId === paper.id)?.score).filter((s: any) => s !== undefined) || [];
                const avg = paperScores.length > 0 ? Math.round(paperScores.reduce((a: number, b: number) => a + b, 0) / paperScores.length) : 0;

                return (
                    <div 
                      key={paper.id}
                      onClick={() => setSelectedPaperId(paper.id)}
                      className={cn(
                        "p-10 rounded-[3rem] border-2 transition-all cursor-pointer group relative overflow-hidden",
                        isSelected 
                          ? "bg-primary text-white border-primary shadow-2xl shadow-primary/20 scale-[1.02]" 
                          : "bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5 hover:border-primary/30"
                      )}
                    >
                        <div className="relative z-10 space-y-6">
                            <div className="flex justify-between items-start">
                                <div className={cn(
                                    "size-14 rounded-2xl flex items-center justify-center transition-all duration-500 border",
                                    isSelected ? "bg-white/20 border-white/30" : "bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-primary"
                                )}>
                                    <BarChart3 size={24} strokeWidth={2.5} />
                                </div>
                                <div className={cn(
                                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                                    isSelected ? "bg-white/10 text-white" : "bg-slate-50 dark:bg-white/5 text-slate-400"
                                )}>
                                    Avg: {avg}%
                                </div>
                            </div>
                            <div>
                              <p className={cn(
                                  "text-[10px] font-black uppercase tracking-widest opacity-60 mb-1",
                                  isSelected ? "text-white" : "text-slate-400"
                              )}>Academic Node</p>
                              <h3 className="text-2xl font-black tracking-tighter uppercase leading-tight truncate">{paper.name}</h3>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>

        <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 rounded-[4rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)]">
          <div className="p-10 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-8">
               <div className="flex items-center gap-6">
                  <div className="size-16 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 flex items-center justify-center shadow-xl" style={{ color: primaryColor }}>
                      <Users size={28} strokeWidth={2.5} />
                  </div>
                  <div>
                      <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight">Participant Registry</h2>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">{attempts?.length || 0} Synchronized Nodes</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <Select value={selectedPaperId} onValueChange={setSelectedPaperId}>
                    <SelectTrigger className="h-14 min-w-[240px] rounded-2xl bg-white dark:bg-slate-900 border-slate-100 dark:border-white/10 font-black uppercase tracking-widest text-[10px] text-slate-500">
                      <SelectValue placeholder="Protocol Module" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 dark:border-white/10 bg-white dark:bg-slate-900">
                      <SelectItem value="all" className="font-bold uppercase tracking-widest text-[10px] py-3">Aggregate Results</SelectItem>
                      {papers.map((p: any) => (
                        <SelectItem key={p.id} value={p.id} className="font-bold uppercase tracking-widest text-[10px] py-3">{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button 
                    onClick={handleBatchDownloadZip}
                    disabled={isBatchDownloading}
                    className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs gap-3 hover:scale-105 transition-all disabled:opacity-50"
                    style={{ backgroundColor: primaryColor, color: 'white' }}
                  >
                    {isBatchDownloading ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} strokeWidth={3} />}
                    Batch Export
                  </Button>
               </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.01]">
                  <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Participant Node</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Efficiency Index</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Status</th>
                  <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Command</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                {filteredAttempts?.map((attempt: any) => (
                  <tr key={attempt.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => onSelectStudent(attempt.studentId)}>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors" style={{ '--primary': primaryColor } as any}>
                          <User size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                          <p className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">{attempt.student?.user?.firstName} {attempt.student?.user?.lastName}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{attempt.student?.studentId || "UID-UNSET"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden max-w-[120px]">
                          <div 
                            className="h-full transition-all duration-1000" 
                            style={{ width: `${Math.round(attempt.percentage || 0)}%`, backgroundColor: primaryColor }} 
                          />
                        </div>
                        <span className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">{Math.round(attempt.percentage || 0)}%</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                       <div className={cn(
                         "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                         attempt.percentage >= 50 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"
                       )}>
                         <div className={cn("size-1.5 rounded-full", attempt.percentage >= 50 ? "bg-emerald-500" : "bg-red-500")} />
                         {attempt.percentage >= 50 ? "Achieved" : "Underperforming"}
                       </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <Button 
                        className="h-12 px-6 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white group-hover:text-white font-black uppercase tracking-widest text-[10px] transition-all border border-slate-100 dark:border-white/5"
                        style={{ '--hover-bg': primaryColor } as any}
                      >
                        Inspect Result
                      </Button>
                    </td>
                  </tr>
                ))}
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
function DetailedStudentResult({ examId, studentId, onBack, school, primaryColor }: any) {
  const { data: result, isLoading } = useExamResult(examId, studentId);

  if (isLoading) return <div className="h-[60vh] flex items-center justify-center text-slate-400 animate-pulse font-black uppercase tracking-widest text-xs">Generating Performance Insights...</div>;
  if (!result) return <div className="text-center py-20 p-8 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-slate-500 font-bold uppercase tracking-widest">In-depth analysis currently unavailable</div>;

  const scorePercentage = Math.round((result.totalScore / result.totalMarks) * 100);

  return (
    <TooltipProvider>
      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-12">
        <div className="flex items-center justify-between no-print">
          <Button 
            onClick={onBack}
            variant="ghost"
            className="h-14 px-8 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-500 transition-all text-xs font-black uppercase tracking-[0.2em] gap-3 border border-slate-100 dark:border-white/5"
            style={{ '--hover-text': primaryColor } as any}
          >
            <ArrowLeft size={16} strokeWidth={3} />
            Participant Registry
          </Button>

          <div className="flex items-center gap-3">
             <div className="hidden md:flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
                <ShieldCheck size={16} strokeWidth={2.5} /> Certified Digital Record
             </div>
             <PDFDownloadLink
                document={<IndividualStudentReport result={result} school={school} />}
                fileName={`${result.student?.name || 'Student'}_${result.title || 'Result'}.pdf`}
              >
                {({ loading }) => (
                  <Button 
                    disabled={loading}
                    className="h-14 px-8 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest text-xs gap-3 hover:scale-105 transition-all shadow-xl"
                  >
                    <Download className="mr-2" size={18} strokeWidth={3} /> {loading ? 'Preparing...' : 'Download Transcript'}
                  </Button>
                )}
              </PDFDownloadLink>
          </div>
        </div>

        {/* Main Result Hub */}
        <div className="relative overflow-hidden rounded-[4rem] bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 shadow-2xl p-12 lg:p-20">
              <div className="absolute top-0 right-0 p-8 opacity-[0.05] dark:opacity-[0.03] pointer-events-none">
                  <GraduationCap size={600} className="text-slate-400 rotate-12 -translate-y-20 translate-x-20" style={{ color: primaryColor }} />
              </div>
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-16 relative z-10">
                  <div className="space-y-12 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-500 text-xs font-black uppercase tracking-widest border border-slate-100 dark:border-white/10">
                            <User size={18} /> Performance Transcript
                        </div>
                        <div className="px-5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                           {result.startedAt ? format(new Date(result.startedAt), "yyyy") : new Date().getFullYear()} ACADEMIC SESSION
                        </div>
                      </div>
                      
                      <div>
                          <div className="flex flex-col md:flex-row md:items-baseline gap-4 mb-4">
                             <h1 className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.9]">
                                {result.student?.name}
                             </h1>
                          </div>
                          <p className="text-xl text-slate-500 font-medium border-l-4 pl-6" style={{ borderColor: primaryColor }}>
                            Validated achievement metrics for <span className="text-slate-900 dark:text-white font-black underline decoration-primary/30 decoration-8" style={{ textDecorationColor: `${primaryColor}40` }}>{result.title}</span> 
                            <span className="ml-3 font-black opacity-50 uppercase tracking-widest text-sm" style={{ color: primaryColor }}>• {result.className}</span>
                          </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        <div className="p-8 rounded-[2rem] bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 shadow-inner group transition-all">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Efficiency Percentile</p>
                          <p className="text-4xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase leading-none" style={{ color: primaryColor }}>Top {100 - (result.globalStanding || 0).toFixed(1)}%</p>
                        </div>

                        <div className="p-8 rounded-[2rem] bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 shadow-inner group transition-all">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Aggregate Index</p>
                          <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{result.totalScore}/{result.totalMarks}</p>
                        </div>

                         <div className="p-8 rounded-[2rem] bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 shadow-inner group transition-all">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Validated Grade</p>
                          <p className={cn(
                            "text-4xl font-black uppercase tracking-tighter leading-none",
                            scorePercentage >= 75 ? "text-emerald-500" : scorePercentage >= 40 ? "text-amber-500" : "text-rose-500"
                          )}>{result.grade || (scorePercentage >= 75 ? 'A1' : scorePercentage >= 40 ? 'C6' : 'F9')}</p>
                        </div>
                      </div>
                  </div>

                  <div className="shrink-0 flex justify-center">
                      <div className="relative group p-10">
                          <div className="absolute inset-0 blur-[100px] rounded-full scale-125 opacity-30 animate-pulse" style={{ backgroundColor: primaryColor }} />
                          <div className="relative z-10 transition-transform duration-1000 hover:rotate-12">
                            <ProgressCircle 
                                value={scorePercentage}
                                size={320}
                                strokeWidth={28}
                                label={`${scorePercentage}%`}
                                sublabel="Mastery Index"
                                className="drop-shadow-2xl"
                                primaryColor={primaryColor}
                            />
                            <div className="absolute inset-x-0 bottom-[35%] flex flex-col items-center pointer-events-none">
                               <div className="px-5 py-2 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-100 dark:border-white/10">
                                  <span className="text-xs font-black uppercase tracking-[0.2em] animate-bounce inline-block" style={{ color: primaryColor }}>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                  <div className="flex items-center justify-between px-4">
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-4">
                          <BarChart3 style={{ color: primaryColor }} /> Component Analysis
                      </h3>
                  </div>
                  <div className="space-y-6">
                      {result.subjects?.map((sub: any, i: number) => {
                          const percent = Math.round((sub.score / sub.totalMarks) * 100);
                          const subGrade = percent >= 75 ? 'A1' : percent >= 70 ? 'B2' : percent >= 65 ? 'B3' : percent >= 50 ? 'C6' : percent >= 40 ? 'D7' : 'F9';
                          
                          return (
                              <div key={i} className="p-10 rounded-[3rem] bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 flex items-center justify-between group hover:-translate-y-1 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none">
                                  <div className="flex items-center gap-8">
                                      <div className={cn(
                                        "size-16 rounded-[1.5rem] flex items-center justify-center font-black text-2xl shadow-inner border border-white/10",
                                        percent >= 75 ? "bg-emerald-500/10 text-emerald-500" : percent >= 40 ? "bg-amber-500/10 text-amber-500" : "bg-rose-500/10 text-rose-500"
                                      )}>
                                        {subGrade}
                                      </div>
                                      <div className="space-y-1.5">
                                          <p className="text-2xl font-black text-slate-900 dark:text-white leading-none uppercase tracking-tighter">{sub.subjectName}</p>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Validated Node • {sub.score} / {sub.totalMarks}</p>
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-10 text-right">
                                      <div className="h-16 w-1 bg-slate-50 dark:bg-white/5 rounded-full" />
                                      <div className="w-20">
                                          <p className={cn(
                                              "text-3xl font-black uppercase tracking-tighter",
                                              percent >= 75 ? "text-emerald-500" : percent >= 45 ? "text-amber-500" : "text-rose-500"
                                          )}>{percent}%</p>
                                      </div>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>

              <div className="space-y-8">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-4 px-4">
                      <Percent className="text-primary" /> Institution Benchmark
                  </h3>
                  <div className="p-12 rounded-[4rem] bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 space-y-12 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                         <TrendingUp size={300} />
                      </div>

                      <div className="space-y-8 relative z-10">
                          <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">Global Standing Vector <Info size={14} /></p>
                                    <p className="text-4xl font-black uppercase tracking-tighter" style={{ color: primaryColor }}>Superior to {(result.globalStanding || 0).toFixed(1)}%</p>
                                </div>
                              
                              <div className={cn(
                                "size-20 rounded-[1.5rem] flex items-center justify-center font-black text-3xl shadow-2xl border-4 border-white/20",
                                scorePercentage >= 75 ? "bg-emerald-500 text-white" : "text-white"
                              )}
                              style={{ backgroundColor: scorePercentage >= 75 ? undefined : primaryColor }}
                              >
                                  {result.grade || (scorePercentage >= 75 ? 'A1' : 'C6')}
                              </div>
                          </div>
                          <div className="h-6 bg-slate-50 dark:bg-white/5 rounded-full overflow-hidden shadow-inner p-1">
                              <div 
                                className="h-full rounded-full transition-all duration-1000 shadow-lg" 
                                style={{ width: `${result.globalStanding || 92}%`, background: `linear-gradient(to right, ${primaryColor}, #2563eb)` }}
                              />
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-8 relative z-10">
                          <div className="p-10 rounded-[2.5rem] bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 text-center shadow-inner hover:scale-[1.02] transition-transform">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Cohort Median</p>
                              <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">{Math.round((result.classAverage / result.totalMarks) * 100) || "76"}%</p>
                          </div>

                           <div className="p-10 rounded-[2.5rem] bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 text-center shadow-inner hover:scale-[1.02] transition-transform">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Velocity Vector</p>
                              <div className="flex items-center justify-center gap-3">
                                  <span className={cn(
                                    "size-3 rounded-full animate-pulse",
                                    (result.velocity || 0) >= 0 ? "bg-emerald-500" : "bg-rose-500"
                                  )} />
                                  <p className={cn(
                                    "text-4xl font-black tracking-tighter leading-none",
                                    (result.velocity || 0) >= 0 ? "text-emerald-500" : "text-rose-500"
                                  )}>{(result.velocity || 0) >= 0 ? '+' : ''}{result.velocity || "0"}%</p>
                              </div>
                          </div>
                      </div>
                      
                      <div className="p-10 rounded-[3rem] border border-primary dark:border-primary/20 relative group overflow-hidden" style={{ backgroundColor: `${primaryColor}05` }}>
                          <History className="absolute -right-8 -bottom-8 opacity-5 transition-opacity duration-700 group-hover:opacity-10" size={200} style={{ color: primaryColor }} />
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3" style={{ color: primaryColor }}>
                             <Zap size={14} fill="currentColor" /> Operational Intelligence
                          </p>
                          <p className="text-lg font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic relative z-10">
                              "{result.performanceInsight || "Analysis indicates consistent node synchronization and high-efficiency performance across all academic sectors."}"
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
 * Subject Papers View - Level 1 for Papers
 */
function SubjectPapersView({ papers, isLoading, onSelectPaper, primaryColor }: any) {
  const [showMobileGrid, setShowMobileGrid] = useState(false);
  const [isNavigating, setIsNavigating] = useState<string | null>(null);

  return (
    <div className="space-y-12">
      {/* Search Terminal */}
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="relative group flex-1 max-w-xl">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" size={22} />
            <input 
                type="text" 
                placeholder="Synchronize subject paper nodes..."
                className="w-full h-16 pl-16 pr-6 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-3xl focus:outline-none focus:ring-4 transition-all font-bold text-slate-700 dark:text-slate-200"
                style={{ '--tw-ring-color': `${primaryColor}20` } as any}
            />
        </div>
        <div className="w-full md:hidden">
            <Button 
                onClick={() => setShowMobileGrid(!showMobileGrid)} 
                variant="outline" 
                className="w-full h-14 rounded-2xl border-slate-200 dark:border-white/5 font-black uppercase tracking-widest bg-white dark:bg-slate-900 shadow-sm"
            >
                {showMobileGrid ? "Conceal" : "Reveal"} Subject Registry
            </Button>
        </div>
      </div>

      <div className={cn("grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", showMobileGrid ? "grid" : "hidden md:grid")}>
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 rounded-[3.5rem] bg-slate-50 dark:bg-white/[0.02] animate-pulse border border-slate-100 dark:border-white/5" />)
        ) : papers.length === 0 ? (
          <div className="col-span-full py-40 text-center bg-slate-50 dark:bg-white/[0.02] rounded-[4rem] border-2 border-dashed border-slate-100 dark:border-white/5 flex flex-col items-center justify-center gap-6">
             <BarChart3 className="h-20 w-20 text-slate-200 dark:text-slate-800" strokeWidth={1} />
             <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">No Paper Modules Discovered</p>
          </div>
        ) : (
          papers.map((paper: any, index: number) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              key={paper.id}
              onClick={() => {
                  setIsNavigating(paper.id);
                  onSelectPaper(paper.exams?.[0]?.examId || 'none', paper.id);
              }}
              className={cn(
                  "group relative overflow-hidden bg-white dark:bg-slate-900/40 backdrop-blur-3xl border border-slate-100 dark:border-white/5 rounded-[3.5rem] p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-2 transition-all duration-500 cursor-pointer",
                  isNavigating === paper.id ? "opacity-70 pointer-events-none scale-[0.98]" : ""
              )}
            >
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-700 pointer-events-none">
                    <BarChart3 size={200} className="text-slate-400 -mr-16 -mt-16 rotate-12" style={{ color: primaryColor }} />
                </div>
                
                <div className="relative z-10 space-y-10">
                    <div className="size-16 rounded-[1.5rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-center font-black shadow-xl text-2xl group-hover:scale-110 transition-all duration-500" style={{ color: primaryColor }}>
                        {paper.subject?.name?.charAt(0) || 'P'}
                    </div>

                    <div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-tight uppercase tracking-tighter mb-3" style={{ '--primary': primaryColor } as any}>{paper.title}</h3>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em] bg-slate-50 dark:bg-white/5 w-fit px-4 py-1.5 rounded-full border border-slate-100 dark:border-white/5">{paper.subject?.name || 'Unassigned Node'}</p>
                    </div>

                    <div className="flex items-center justify-between pt-8 border-t border-slate-100 dark:border-white/5">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Parent Node</span>
                            <span className="text-xs font-black text-slate-700 dark:text-slate-300 truncate max-w-[160px] uppercase tracking-tighter">
                                {paper.exams?.[0]?.exam?.title || 'Standalone Module'}
                            </span>
                        </div>
                        <div className="size-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl bg-slate-50 dark:bg-white/5 text-slate-400 group-hover:text-white" style={{ '--hover-bg': primaryColor } as any}>
                            {isNavigating === paper.id ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <ChevronRight size={22} strokeWidth={3} className="translate-x-0.5" />
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

