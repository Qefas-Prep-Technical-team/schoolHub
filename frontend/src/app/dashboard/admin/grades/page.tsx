'use client';

import { useState, useMemo, useEffect } from 'react';
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
  CheckCircle2,
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
import { useFeatureAccess } from '@/lib/api/hooks/useFeatureAccess';
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
import Pagination from './components/Pagination';
import { useGradeHub } from '@/lib/api/hooks/useGrades';
import { useClasses } from '@/lib/api/hooks/useClasses';
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminGradesDashboard() {
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  const { data: settings } = useSchoolSettings(schoolId);
  const primaryColor = settings?.themeColor || '#2563eb';

  const router = useRouter();
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedPaperId, setSelectedPaperId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'exams' | 'standalone' | 'papers'>('exams');
  const [searchTerm, setSearchTerm] = useState('');
  const [isInstitutionReportModalOpen, setIsInstitutionReportModalOpen] = useState(false);

  // Data fetching
  const { data: exams, isLoading: isLoadingExams } = useExams();
  const { data: standaloneGrades, isLoading: isLoadingGrades } = useGradeHub(schoolId, { limit: 10000 });
  const { data: subjectPapers, isLoading: isLoadingPapers } = useSubjectPapers();
  const { data: school } = useSchoolProfile(schoolId);

  const handleBackToExams = () => {
    setSelectedExamId(null);
    setSelectedStudentId(null);
    setSelectedPaperId('');
  };

  const handleBackToStudents = () => {
    setSelectedStudentId(null);
  };

  const handleSelectPaper = (examId: string, paperId: string) => {
    router.push(`/dashboard/admin/exams/papers/${paperId}`);
  };

  const totalAttemptsCount = useMemo(() => {
    if (!exams || !Array.isArray(exams)) return 0;
    return exams.reduce((acc, exam: any) => acc + (exam._count?.examAttempts || 0), 0);
  }, [exams]);

  const globalScoreAverage = useMemo(() => {
    if (!exams || !Array.isArray(exams)) return 84;
    return 78;
  }, [exams]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-4 sm:p-6 lg:p-10 transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto space-y-8 lg:space-y-12">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
              <div className="size-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Grades Dashboard</span>
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.9]">
                Grades<span style={{ color: primaryColor }}>.</span>
              </h1>
              <p className="mt-4 text-lg font-medium text-slate-500 max-w-xl">
                Detailed grade summaries, student results, and overall progress tracking.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
              <Button 
                onClick={() => setIsInstitutionReportModalOpen(true)}
                className="group h-12 lg:h-16 px-6 lg:px-10 rounded-2xl lg:rounded-[2rem] font-black uppercase tracking-widest gap-3 transition-all duration-300 text-xs lg:text-base w-full lg:w-auto relative overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1 text-white border-0"
                style={{ 
                  backgroundColor: primaryColor,
                  boxShadow: `0 10px 25px -5px ${primaryColor}60`
                }}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ boxShadow: `inset 0 0 20px 0px ${primaryColor}` }} />
                <Download size={20} strokeWidth={3} className="relative z-10 group-hover:animate-bounce" />
                <span className="relative z-10">School Report</span>
                <div className="absolute -inset-1 rounded-[2.5rem] animate-ping opacity-20 pointer-events-none" style={{ border: `2px solid ${primaryColor}` }} />
              </Button>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            {/* Card 1: Total Exams */}
            <div className="p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -mt-10 -mr-10 opacity-20 transition-colors duration-500" style={{ backgroundColor: `${primaryColor}20` }} />
                <div className="relative z-10 space-y-4">
                    <div className="size-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-white/5" style={{ color: primaryColor }}>
                        <Trophy size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Exams</p>
                        <h3 className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                            {isLoadingExams ? (
                              <Skeleton className="h-8 w-16 bg-slate-100 dark:bg-white/[0.02] rounded-lg" />
                            ) : (
                              exams?.length || 0
                            )}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Card 2: Subject Papers */}
            <div className="p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -mt-10 -mr-10 opacity-20 transition-colors duration-500" style={{ backgroundColor: `${primaryColor}20` }} />
                <div className="relative z-10 space-y-4">
                    <div className="size-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-white/5" style={{ color: primaryColor }}>
                        <Layers size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subject Papers</p>
                        <h3 className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                            {isLoadingPapers ? (
                              <Skeleton className="h-8 w-16 bg-slate-100 dark:bg-white/[0.02] rounded-lg" />
                            ) : (
                              subjectPapers?.length || 0
                            )}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Card 3: Graded Students */}
            <div className="p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -mt-10 -mr-10 opacity-20 transition-colors duration-500" style={{ backgroundColor: `${primaryColor}20` }} />
                <div className="relative z-10 space-y-4">
                    <div className="size-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-white/5" style={{ color: primaryColor }}>
                        <Users size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Students Graded</p>
                        <h3 className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                            {isLoadingExams ? (
                              <Skeleton className="h-8 w-16 bg-slate-100 dark:bg-white/[0.02] rounded-lg" />
                            ) : (
                              totalAttemptsCount
                            )}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Card 4: Average Score */}
            <div className="p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -mt-10 -mr-10 opacity-20 transition-colors duration-500" style={{ backgroundColor: `${primaryColor}20` }} />
                <div className="relative z-10 space-y-4">
                    <div className="size-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-white/5" style={{ color: primaryColor }}>
                        <Award size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Average Score</p>
                        <h3 className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                            {isLoadingExams ? (
                              <Skeleton className="h-8 w-16 bg-slate-100 dark:bg-white/[0.02] rounded-lg" />
                            ) : (
                              `${globalScoreAverage}%`
                            )}
                        </h3>
                    </div>
                </div>
            </div>
        </div>


        {/* Operational Control Tabs */}
        <div className="flex justify-start lg:justify-center overflow-x-auto no-scrollbar -mx-4 px-4 pb-2">
            <div className="p-1.5 bg-slate-50 dark:bg-white/5 rounded-[2rem] lg:rounded-[2.5rem] border border-slate-100 dark:border-white/10 shadow-inner flex items-center gap-1.5 min-w-max">
                <button 
                    onClick={() => setActiveTab('exams')}
                    className={cn(
                        "px-6 lg:px-10 py-3 lg:py-4 rounded-2xl lg:rounded-[2rem] text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap",
                        activeTab === 'exams' ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl scale-105" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    )}
                >
                    Exams
                </button>
                <button 
                    onClick={() => setActiveTab('standalone')}
                    className={cn(
                        "px-6 lg:px-10 py-3 lg:py-4 rounded-2xl lg:rounded-[2rem] text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap",
                        activeTab === 'standalone' ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl scale-105" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    )}
                >
                    All Grades
                </button>
                <button 
                    onClick={() => setActiveTab('papers')}
                    className={cn(
                        "px-6 lg:px-10 py-3 lg:py-4 rounded-2xl lg:rounded-[2rem] text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap",
                        activeTab === 'papers' ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl scale-105" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    )}
                >
                    Papers
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
                    <h2 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Assessments</h2>
                    <p className="text-xs lg:text-sm font-medium text-slate-500">Breakdown of all student exam results.</p>
                  </div>
                </div>
                {selectedExamId && (
                   <Button variant="ghost" onClick={handleBackToExams} className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs gap-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                      <ArrowLeft size={16} strokeWidth={3} />
                      All Exams
                   </Button>
                )}
              </div>
              
              <div className="bg-white dark:bg-slate-900/50 rounded-[2rem] lg:rounded-[4rem] border border-slate-100 dark:border-white/5 p-4 lg:p-12 shadow-2xl shadow-slate-200/50 dark:shadow-none min-h-[400px] lg:min-h-[600px] overflow-hidden relative">
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
                  schoolId={schoolId}
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
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">All Student Grades</h2>
                  <p className="text-sm font-medium text-slate-500">Comprehensive record of all student grades, quizzes, and class assessments across the school.</p>
                </div>
              </div>
              
              <GradeHub 
                grades={standaloneGrades || []} 
                isLoading={isLoadingGrades} 
                schoolId={schoolId}
                primaryColor={primaryColor}
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
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Subject Papers</h2>
                  <p className="text-sm font-medium text-slate-500">Review results for specific subject papers.</p>
                </div>
              </div>

              <SubjectPapersView 
                papers={subjectPapers || []} 
                isLoading={isLoadingPapers} 
                onSelectPaper={handleSelectPaper}
                primaryColor={primaryColor}
                schoolId={schoolId}
              />
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      <InstitutionReportModal 
        isOpen={isInstitutionReportModalOpen} 
        onClose={() => setIsInstitutionReportModalOpen(false)} 
        school={school}
        primaryColor={primaryColor}
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
  primaryColor,
  schoolId
}: any) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // New Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  // Query classes data
  const { data: classesData } = useClasses(schoolId);

  // Extract unique categories dynamically from exams
  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>();
    exams?.forEach((e: any) => {
      if (e.category) categories.add(e.category);
    });
    return Array.from(categories).sort();
  }, [exams]);
  
  const filteredExams = (exams || []).filter((e: any) => {
    const matchSearch = searchTerm === '' || 
      e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.class?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategory = selectedCategory === 'all' || e.category === selectedCategory;
    const matchClass = selectedClass === 'all' || e.classId === selectedClass;

    return matchSearch && matchCategory && matchClass;
  });

  const totalPages = Math.ceil(filteredExams.length / itemsPerPage);
  const paginatedExams = filteredExams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const { totalAttempts, totalQuestions, totalPapers } = useMemo(() => {
    let attempts = 0;
    let questions = 0;
    let papers = 0;
    filteredExams.forEach((e: any) => {
        attempts += e._count?.examAttempts || 0;
        questions += e.totalQuestions || 0;
        papers += e.totalPapers || 0;
    });
    return { totalAttempts: attempts, totalQuestions: questions, totalPapers: papers };
  }, [filteredExams]);

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
      {/* Bento Grid Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-[2.5rem] shadow-xl group relative overflow-hidden text-white" style={{ backgroundColor: primaryColor, boxShadow: `0 20px 25px -5px ${primaryColor}30` }}>
                <TrendingUp className="absolute -right-6 -bottom-6 text-white/10 group-hover:scale-110 transition-transform duration-700" size={160} />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Total Exams</p>
                <h3 className="text-4xl font-black tracking-tighter mb-4">{filteredExams.length}</h3>
                <p className="text-xs font-bold bg-white/10 w-fit px-3 py-1 rounded-full border border-white/10 whitespace-nowrap">
                   {totalAttempts} Student Attempts
                </p>
          </div>
          <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Total Questions</p>
                   <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{totalQuestions}</h3>
                </div>
                <div className="flex gap-2 mt-6">
                   <div className="h-1.5 rounded-full flex-1" style={{ backgroundColor: primaryColor }} />
                </div>
          </div>
          <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white border border-slate-800 shadow-xl shadow-slate-900/20 overflow-hidden relative group">
                <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Structure Overview</p>
                    <div className="space-y-4 mt-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold flex items-center gap-2"><Layers className="text-emerald-400" size={14} /> Total Papers</span>
                            <span className="text-xs font-black">{totalPapers}</span>
                        </div>
                        <div className="flex items-center justify-between opacity-60">
                            <span className="text-xs font-bold flex items-center gap-2"><User className="text-amber-400" size={14} /> Global Attempts</span>
                            <span className="text-xs font-black">{totalAttempts}</span>
                        </div>
                    </div>
                </div>
                <History className="absolute -left-6 -bottom-6 text-white/5" size={120} />
          </div>
      </div>

      {/* Search & Actions Terminal */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-slate-900/40 p-6 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 w-full">
          {/* Text Search */}
          <div className="relative group flex-1 w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" style={{ color: searchTerm ? primaryColor : undefined } as any} />
              <input 
                  type="text" 
                  placeholder="Search exams, categories..."
                  value={searchTerm}
                  onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                  }}
                  className="w-full pl-12 h-12 bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-4 transition-all font-bold text-slate-700 dark:text-slate-200 text-sm animate-all"
                  style={{ '--tw-ring-color': `${primaryColor}20`, borderColor: searchTerm ? primaryColor : undefined } as any}
              />
          </div>

          {/* Category Filter */}
          <div className="w-full sm:w-48">
            <Select value={selectedCategory} onValueChange={(val) => { setSelectedCategory(val); setCurrentPage(1); }}>
              <SelectTrigger className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 font-bold focus:ring-4 transition-all text-sm" style={{ '--tw-ring-color': `${primaryColor}20` } as any}>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Class Filter */}
          <div className="w-full sm:w-48">
            <Select value={selectedClass} onValueChange={(val) => { setSelectedClass(val); setCurrentPage(1); }}>
              <SelectTrigger className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 font-bold focus:ring-4 transition-all text-sm" style={{ '--tw-ring-color': `${primaryColor}20` } as any}>
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <SelectItem value="all">All Classes</SelectItem>
                {classesData?.map((cls: any) => (
                  <SelectItem key={cls.id} value={cls.id}>Class {cls.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-4 self-start lg:self-center">
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
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 rounded-[3rem] bg-slate-50 dark:bg-white/[0.02] animate-pulse border border-slate-100 dark:border-white/5" />)}
        </div>
      ) : paginatedExams.length === 0 ? (
        <div className="text-center py-40 bg-slate-50 dark:bg-white/[0.02] rounded-[4rem] border-2 border-dashed border-slate-100 dark:border-white/5 flex flex-col items-center justify-center gap-6">
           <Trophy className="h-20 w-20 text-slate-200 dark:text-slate-800" strokeWidth={1} />
           <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">No Exams Found</p>
        </div>
      ) : (
        <div className="space-y-12">
            <div className={cn(
                viewMode === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
                    : "flex flex-col gap-4 lg:gap-6"
            )}>
                {paginatedExams.map((exam: any, index: number) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={exam.id} 
                        onClick={() => setSelectedExamId(exam.id)}
                        className={cn(
                            "group relative overflow-hidden bg-white dark:bg-slate-900/40 backdrop-blur-3xl border border-slate-100 dark:border-white/5 transition-all duration-500 cursor-pointer",
                            viewMode === 'grid' 
                                ? "rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-2" 
                                : "rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-xl flex items-center justify-between gap-4 lg:gap-8"
                        )}
                        style={{ '--hover-border': `${primaryColor}40` } as any}
                    >
                        {viewMode === 'list' ? (
                            <div className="flex items-center gap-4 lg:gap-8 w-full">
                                <div className="size-12 lg:size-16 rounded-xl lg:rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-white/5 flex-shrink-0" style={{ color: primaryColor }}>
                                    <Trophy size={20} strokeWidth={2.5} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base lg:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter truncate">{exam.title}</h3>
                                    <div className="flex items-center gap-2 lg:gap-4 mt-1">
                                        <span className="text-[8px] lg:text-[10px] text-slate-500 font-black uppercase tracking-widest">{exam.category || 'General'}</span>
                                        <div className="size-1 rounded-full bg-slate-200 dark:bg-slate-800" />
                                        <span className="text-[8px] lg:text-[10px] text-slate-500 font-black uppercase tracking-widest">Class {exam.class?.name || "Global"}</span>
                                    </div>
                                </div>
                                <div className="hidden sm:flex items-center gap-6 lg:gap-10 px-6 border-x border-slate-100 dark:border-white/5">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Papers</span>
                                        <span className="text-sm font-black text-slate-900 dark:text-white">{exam.totalPapers || 0}</span>
                                    </div>
                                    <div className="flex flex-col items-center border-x border-slate-100 dark:border-white/5 px-6 lg:px-10">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Questions</span>
                                        <span className="text-sm font-black text-slate-900 dark:text-white">{exam.totalQuestions || 0}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Students</span>
                                        <span className="text-sm font-black text-slate-900 dark:text-white">{exam._count?.examAttempts || 0}</span>
                                    </div>
                                </div>
                                <div className="size-10 lg:size-12 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-white transition-all duration-500 shadow-sm flex-shrink-0" style={{ '--hover-bg': primaryColor } as any}>
                                    <ChevronRight size={18} strokeWidth={3} className="translate-x-0.5" />
                                </div>
                            </div>
                        ) : (
                            <>
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
                                        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-4">
                                            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                            <Layers size={12} className="text-slate-400" />
                                            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">{exam.totalPapers || 0} Papers</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                            <FileText size={12} className="text-slate-400" />
                                            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">{exam.totalQuestions || 0} Questions</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                            <User size={12} className="text-slate-400" />
                                            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">Class {exam.class?.name || "Global"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-8 border-t border-slate-100 dark:border-white/5">
                                        <div className="flex items-center gap-3 lg:gap-4">
                                            <div className="flex -space-x-3">
                                                {Array.from({ length: Math.min(exam._count?.examAttempts || 0, 3) }).map((_, i) => (
                                                    <div key={i} className="size-10 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shadow-sm relative z-10 transition-transform group-hover:-translate-x-1">
                                                        <User size={16} />
                                                    </div>
                                                ))}
                                                { (exam._count?.examAttempts || 0) > 3 && (
                                                    <div className="size-10 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-black text-white shadow-sm relative z-20" style={{ backgroundColor: primaryColor }}>
                                                        +{ (exam._count?.examAttempts || 0) - 3}
                                                    </div>
                                                )}
                                                { (exam._count?.examAttempts || 0) === 0 && (
                                                    <div className="size-10 rounded-full border-4 border-white dark:border-slate-900 bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300 shadow-sm relative z-10">
                                                        <User size={16} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                                    {exam._count?.examAttempts || 0} Students
                                                </span>
                                                <span className="text-[8px] font-medium text-slate-500 uppercase tracking-widest">Attempts</span>
                                            </div>
                                        </div>
                                        <div className="size-12 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:text-white text-slate-400 transition-all duration-500 shadow-sm" style={{ '--hover-bg': primaryColor } as any}>
                                            <ChevronRight size={20} strokeWidth={3} className="translate-x-0.5" />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                ))}
            </div>
            {filteredExams.length > 0 && (
                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredExams.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    primaryColor={primaryColor}
                />
            )}
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
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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
          className="h-14 px-8 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-500 transition-all text-xs font-black uppercase tracking-[0.2em] gap-3 mb-6 border border-slate-100 dark:border-white/5"
          style={{ '--hover-text': primaryColor } as any}
        >
          <ArrowLeft size={16} strokeWidth={3} />
          Back to Exams
        </Button>

        {/* Exam Title Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {exams?.find((e: any) => e.id === examId)?.title || 'Exam Details'}
            </h2>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mt-2">
              Viewing Cohort Performance
            </p>
          </div>
        </div>

        {/* High-Level Analytics Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 mb-8 lg:mb-12">
            <div className="p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] bg-primary text-white shadow-2xl shadow-primary/20 relative overflow-hidden group" style={{ backgroundColor: primaryColor }}>
                <TrendingUp className="absolute -right-6 -bottom-6 text-white/10 group-hover:scale-110 transition-transform duration-700" size={120} />
                <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Average Score</p>
                    <h3 className="text-3xl lg:text-5xl font-black tracking-tighter leading-none">
                        {attempts?.length ? Math.round(attempts.reduce((acc: number, a: any) => acc + (a.totalScore || a.percentage || 0), 0) / attempts.length) : 0}%
                    </h3>
                </div>
            </div>
            <div className="p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm group">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Passing Rate</p>
                <div className="flex items-end gap-2">
                    <h3 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                        {attempts?.length ? Math.round((attempts.filter((a: any) => (a.totalScore || a.percentage || 0) >= 50).length / attempts.length) * 100) : 0}%
                    </h3>
                    <CheckCircle2 className="text-emerald-500 mb-1 lg:mb-2" size={24} />
                </div>
            </div>
            <div className="hidden md:flex flex-col justify-between p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Students</p>
                <h3 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mt-2">
                    {attempts?.length || 0}
                </h3>
            </div>
            <div className="hidden lg:flex flex-col justify-between p-10 rounded-[3rem] bg-slate-900 text-white border border-slate-800 shadow-xl shadow-slate-900/20 overflow-hidden relative group">
                <History className="absolute -left-6 -bottom-6 text-white/5" size={100} />
                <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Highest Score</p>
                    <h3 className="text-5xl font-black tracking-tighter leading-none mt-2">
                        {attempts?.length ? Math.max(...attempts.map((a: any) => a.totalScore || a.percentage || 0)) : 0}%
                    </h3>
                </div>
            </div>
        </div>

        <div className="flex overflow-x-auto pb-6 -mx-4 px-4 no-scrollbar gap-4 lg:grid lg:grid-cols-4 lg:gap-8 lg:overflow-visible lg:pb-0 lg:mx-0 lg:px-0 mb-12">

            {papers.map((paper: any) => {
                const isSelected = selectedPaperId === paper.id;
                const paperScores = attempts?.map((a: any) => a.subjectAttempts?.find((sa: any) => sa.subjectPaperId === paper.id)?.score).filter((s: any) => s !== undefined) || [];
                const avg = paperScores.length > 0 ? Math.round(paperScores.reduce((a: number, b: number) => a + b, 0) / paperScores.length) : 0;

                return (
                    <div 
                      key={paper.id}
                      onClick={() => { setSelectedPaperId(paper.id); setCurrentPage(1); }}
                      className={cn(
                        "min-w-[240px] sm:min-w-0 p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] border-2 transition-all cursor-pointer group relative overflow-hidden shrink-0 lg:shrink",
                        isSelected 
                          ? "bg-primary text-white border-primary shadow-2xl shadow-primary/20 scale-[1.02]" 
                          : "bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5 hover:border-primary/30"
                      )}
                      style={{ 
                          backgroundColor: isSelected ? primaryColor : undefined,
                          borderColor: isSelected ? primaryColor : undefined,
                      } as any}
                    >
                        <div className="relative z-10 space-y-4 lg:space-y-6">
                            <div className="flex justify-between items-start">
                                <div className={cn(
                                    "size-12 lg:size-14 rounded-2xl flex items-center justify-center border transition-all duration-500",
                                    isSelected ? "bg-white/20 border-white/30" : "bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5"
                                )}
                                style={{ color: isSelected ? undefined : primaryColor }}
                                >
                                    <FileText size={22} strokeWidth={2.5} />
                                </div>
                                <div className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black",
                                    isSelected ? "bg-white/20 text-white" : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600"
                                )}>
                                    {avg}% AVG
                                </div>
                            </div>
                            <div>
                                <p className={cn(
                                    "text-[9px] lg:text-[10px] font-black uppercase tracking-widest opacity-60 mb-1",
                                    isSelected ? "text-white" : "text-slate-400"
                                )}>Subject Paper</p>
                                <h3 className="text-lg lg:text-2xl font-black tracking-tighter uppercase leading-none truncate">{paper.name}</h3>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Search & Actions Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div className="relative group flex-1 w-full max-w-xl order-2 lg:order-1">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" size={20} />
                <input 
                    type="text" 
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="w-full h-14 lg:h-16 pl-16 pr-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl lg:rounded-3xl focus:outline-none focus:ring-4 transition-all font-bold text-slate-700 dark:text-slate-200 text-sm lg:text-base shadow-sm"
                    style={{ '--tw-ring-color': `${primaryColor}20` } as any}
                />
            </div>
            <div className="flex items-center gap-4 w-full lg:w-auto order-1 lg:order-2">
                <Button 
                    onClick={handleBatchDownloadZip}
                    disabled={isBatchDownloading || !attempts?.length}
                    className="h-14 lg:h-16 w-full lg:px-8 rounded-2xl lg:rounded-3xl font-black uppercase tracking-widest gap-3 shadow-xl active:scale-95 transition-all text-white"
                    style={{ backgroundColor: primaryColor }}
                >
                    {isBatchDownloading ? (
                        <Loader2 className="animate-spin" size={18} strokeWidth={3} />
                    ) : (
                        <Download size={18} strokeWidth={3} />
                    )}
                    Export Results
                </Button>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 rounded-[3rem] lg:rounded-[4rem] overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none">
          <div className="overflow-x-auto">
            {/* Desktop Table View */}
            <table className="w-full hidden lg:table">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.01]">
                  <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student Name</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Percentage</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rank</th>
                  <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pr-16">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                {isLoading ? (
                    <tr><td colSpan={4} className="px-10 py-32 text-center text-slate-400 font-black uppercase tracking-widest animate-pulse">Analyzing Hub...</td></tr>
                ) : paginatedAttempts.length === 0 ? (
                    <tr><td colSpan={4} className="px-10 py-32 text-center text-slate-400 font-black uppercase tracking-widest">No candidates found</td></tr>
                ) : paginatedAttempts.map((attempt: any, idx: number) => {
                  const scorePercent = attempt.totalMarks ? Math.round((attempt.totalScore / attempt.totalMarks) * 100) : Math.round(attempt.totalScore || attempt.percentage || 0);
                  return (
                  <tr key={attempt.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => onSelectStudent(attempt.studentId)}>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors" style={{ '--hover-bg': primaryColor } as any}>
                          <User size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                          <p className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">{attempt.student?.name}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{attempt.student?.studentId || "UID-UNSET"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden max-w-[120px]">
                          <div 
                            className="h-full transition-all duration-1000" 
                            style={{ width: `${scorePercent}%`, backgroundColor: primaryColor }} 
                          />
                        </div>
                        <span className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">{scorePercent}%</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                        <div className="size-10 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center text-sm font-black text-slate-500">
                            #{idx + 1 + (currentPage - 1) * itemsPerPage}
                        </div>
                    </td>
                    <td className="px-10 py-8 text-right pr-16">
                       <div className="flex items-center justify-end gap-6">
                            <div className={cn(
                              "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                              scorePercent >= 50 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"
                            )}>
                              <div className={cn("size-1.5 rounded-full", scorePercent >= 50 ? "bg-emerald-500" : "bg-red-500")} />
                              {scorePercent >= 50 ? "Passed" : "Needs Review"}
                            </div>
                            <div className="size-12 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-white transition-all shadow-sm" style={{ '--hover-bg': primaryColor } as any}>
                                {isNavigating === attempt.id ? (
                                    <Loader2 className="animate-spin" size={18} strokeWidth={3} />
                                ) : (
                                    <ChevronRight size={20} strokeWidth={3} />
                                )}
                            </div>
                       </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-slate-100 dark:divide-white/5">
                {isLoading ? (
                    <div className="p-20 text-center text-slate-400 font-black uppercase tracking-widest animate-pulse">Analyzing...</div>
                ) : paginatedAttempts.length === 0 ? (
                    <div className="p-20 text-center text-slate-400 font-black uppercase tracking-widest">No candidates found</div>
                ) : paginatedAttempts.map((attempt: any, idx: number) => {
                  const scorePercent = attempt.totalMarks ? Math.round((attempt.totalScore / attempt.totalMarks) * 100) : Math.round(attempt.totalScore || attempt.percentage || 0);
                  return (
                  <div key={attempt.id} className="p-6 space-y-6 active:bg-slate-50 dark:active:bg-white/[0.02]" onClick={() => onSelectStudent(attempt.studentId)}>
                      <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="size-10 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400" style={{ color: primaryColor }}>
                                <User size={18} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tighter">{attempt.student?.name}</p>
                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Rank #{idx + 1 + (currentPage - 1) * itemsPerPage}</p>
                            </div>
                          </div>
                          <div className="text-right">
                              <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{scorePercent}%</p>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Student Score</p>
                          </div>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                          <div className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                            scorePercent >= 50 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"
                          )}>
                            <div className={cn("size-1 rounded-full", scorePercent >= 50 ? "bg-emerald-500" : "bg-red-500")} />
                            {scorePercent >= 50 ? "Passed" : "Needs Review"}
                          </div>
                          <div className="size-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                             {isNavigating === attempt.id ? <Loader2 className="animate-spin" size={16} /> : <ChevronRight size={18} />}
                          </div>
                      </div>
                  </div>
                )})}
            </div>
          </div>
          
          {filteredAttempts.length > 0 && (
            <div className="p-8 lg:p-12 border-t border-slate-100 dark:border-white/5">
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
      </div>
    </div>
  );
}

/**
 * Detailed Student Result - Level 3
 */
function DetailedStudentResult({ examId, studentId, onBack, school, primaryColor }: any) {
  const { data: result, isLoading } = useExamResult(examId, studentId);
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  const { data: hasPerformanceAccess } = useFeatureAccess('aiInsights', school?.id || schoolId);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [circleSize, setCircleSize] = useState(320);
  const [strokeWidth, setStrokeWidth] = useState(28);

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
            className="h-12 lg:h-14 w-full sm:w-auto px-6 lg:px-8 rounded-xl lg:rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-500 transition-all text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] gap-3 border border-slate-100 dark:border-white/5"
            style={{ '--hover-text': primaryColor } as any}
          >
            <ArrowLeft size={16} strokeWidth={3} />
            Student List
          </Button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
             <div className="hidden md:flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
                <ShieldCheck size={16} strokeWidth={2.5} /> Verified Record
             </div>
             <PDFDownloadLink
                document={<IndividualStudentReport result={result} school={school} hasPerformanceAccess={hasPerformanceAccess} />}
                fileName={`${result.student?.name || 'Student'}_${result.title || 'Result'}.pdf`}
                className="w-full sm:w-auto"
              >
                {({ loading }) => (
                  <Button 
                    disabled={loading}
                    className="h-12 lg:h-14 w-full sm:px-8 rounded-xl lg:rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest text-[10px] lg:text-xs gap-3 hover:scale-105 transition-all shadow-xl"
                  >
                    <Download size={18} strokeWidth={3} /> {loading ? 'Preparing...' : 'Export'}
                  </Button>
                )}
              </PDFDownloadLink>
          </div>
        </div>

        {/* Main Result Hub */}
        <div className="relative overflow-hidden rounded-[2rem] lg:rounded-[4rem] bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 shadow-2xl p-6 sm:p-12 lg:p-20">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                  <GraduationCap size={500} className="text-slate-400 rotate-12 -translate-y-10 lg:-translate-y-20 translate-x-10 lg:translate-x-20" style={{ color: primaryColor }} />
              </div>
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 lg:gap-16 relative z-10">
                  <div className="space-y-8 lg:space-y-12 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-3 lg:gap-4">
                        <div className="inline-flex items-center gap-2 lg:gap-3 px-4 lg:px-6 py-2 rounded-xl lg:rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-500 text-[10px] lg:text-xs font-black uppercase tracking-widest border border-slate-100 dark:border-white/10">
                            <User size={16} /> Student Result
                        </div>
                        <div className="px-4 lg:px-5 py-2 rounded-xl lg:rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] lg:text-[10px] font-black uppercase tracking-widest">
                           {result.startedAt ? format(new Date(result.startedAt), "yyyy") : new Date().getFullYear()} SESSION
                        </div>
                      </div>
                      
                      <div>
                          <h1 className="text-4xl md:text-6xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.9] mb-4">
                             {result.student?.name}
                          </h1>
                          <p className="text-sm lg:text-xl text-slate-500 font-medium border-l-4 pl-4 lg:pl-6" style={{ borderColor: primaryColor }}>
                            Metrics for <span className="text-slate-900 dark:text-white font-black">{result.title}</span> 
                            <span className="ml-2 font-black opacity-50 uppercase tracking-widest text-[10px] lg:text-sm" style={{ color: primaryColor }}>• {result.className}</span>
                          </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-8">
                        <div className="p-6 lg:p-8 rounded-[1.5rem] lg:rounded-[2rem] bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 shadow-inner">
                          <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 lg:mb-2">Class Rank</p>
                          <p className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase leading-none" style={{ color: primaryColor }}>
                            #{result.position || '-'}
                          </p>
                        </div>

                        <div className="p-6 lg:p-8 rounded-[1.5rem] lg:rounded-[2rem] bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 shadow-inner">
                          <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 lg:mb-2">Total Score</p>
                          <p className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{result.totalScore}/{result.totalMarks}</p>
                        </div>

                         <div className="p-6 lg:p-8 rounded-[1.5rem] lg:rounded-[2rem] bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 shadow-inner">
                          <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 lg:mb-2">Grade</p>
                          <p className={cn(
                            "text-2xl lg:text-4xl font-black uppercase tracking-tighter leading-none",
                            scorePercentage >= 75 ? "text-emerald-500" : scorePercentage >= 40 ? "text-amber-500" : "text-rose-500"
                          )}>{result.grade || (scorePercentage >= 75 ? 'A1' : scorePercentage >= 40 ? 'C6' : 'F9')}</p>
                        </div>
                      </div>
                  </div>

                  <div className="shrink-0 flex justify-center lg:block">
                      <div className="relative group p-4 lg:p-10">
                          <div className="absolute inset-0 blur-[60px] lg:blur-[100px] rounded-full scale-125 opacity-20 lg:opacity-30 animate-pulse" style={{ backgroundColor: primaryColor }} />
                          <div className="relative z-10 transition-transform duration-1000 hover:rotate-6">
                            <ProgressCircle 
                                value={scorePercentage}
                                size={circleSize}
                                strokeWidth={strokeWidth}
                                label={`${scorePercentage}%`}
                                sublabel="Mastery"
                                className="drop-shadow-2xl"
                                primaryColor={primaryColor}
                            />
                            <div className="absolute inset-x-0 bottom-[35%] flex flex-col items-center pointer-events-none">
                               <div className="px-4 py-1.5 bg-white dark:bg-slate-900 rounded-lg lg:rounded-xl shadow-2xl border border-slate-100 dark:border-white/10">
                                  <span className="text-[9px] lg:text-xs font-black uppercase tracking-[0.2em] inline-block" style={{ color: primaryColor }}>
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
                      <h3 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-3 lg:gap-4">
                          <BarChart3 size={22} style={{ color: primaryColor }} /> Analysis
                      </h3>
                  </div>
                  <div className="space-y-4 lg:space-y-6">
                      {result.subjects?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((sub: any, i: number) => {
                          const percent = Math.round((sub.score / sub.totalMarks) * 100);
                          const subGrade = percent >= 75 ? 'A1' : percent >= 70 ? 'B2' : percent >= 65 ? 'B3' : percent >= 50 ? 'C6' : percent >= 40 ? 'D7' : 'F9';
                          
                          return (
                              <div key={i} className="p-5 sm:p-6 lg:p-10 rounded-2xl sm:rounded-[2rem] lg:rounded-[3rem] bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group hover:-translate-y-1 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none">
                                  <div className="flex items-center gap-4 lg:gap-8">
                                      <div className={cn(
                                        "size-12 lg:size-16 shrink-0 rounded-xl lg:rounded-[1.5rem] flex items-center justify-center font-black text-lg lg:text-2xl shadow-inner border border-white/10",
                                        percent >= 75 ? "bg-emerald-500/10 text-emerald-500" : percent >= 40 ? "bg-amber-500/10 text-amber-500" : "bg-rose-500/10 text-rose-500"
                                      )}>
                                        {subGrade}
                                      </div>
                                      <div className="space-y-1 lg:space-y-1.5">
                                          <p className="text-lg lg:text-2xl font-black text-slate-900 dark:text-white leading-none uppercase tracking-tighter line-clamp-1">{sub.subjectName}</p>
                                          <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{sub.score} / {sub.totalMarks} Questions</p>
                                      </div>
                                  </div>
                                  <div className="flex items-center justify-between sm:justify-end gap-4 lg:gap-10 text-right border-t sm:border-t-0 border-slate-50 dark:border-white/5 pt-4 sm:pt-0">
                                      <div className="h-10 lg:h-16 w-1 bg-slate-50 dark:bg-white/5 rounded-full hidden sm:block" />
                                      <div className="sm:w-16 lg:w-20">
                                          <p className={cn(
                                              "text-2xl lg:text-3xl font-black uppercase tracking-tighter",
                                              percent >= 75 ? "text-emerald-500" : percent >= 45 ? "text-amber-500" : "text-rose-500"
                                          )}>{percent}%</p>
                                      </div>
                                      <div className="sm:hidden text-[8px] font-black text-slate-400 uppercase tracking-widest">Performance</div>
                                  </div>
                              </div>
                          );
                      })}

                      {result.subjects?.length > itemsPerPage && (
                        <div className="pt-6">
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

              <div className="space-y-8">
                  <h3 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-3 lg:gap-4 px-4">
                      <Percent size={22} className="text-primary" /> Class Comparison
                  </h3>
                  <div className="p-6 lg:p-12 rounded-[2rem] lg:rounded-[4rem] bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 space-y-8 lg:space-y-12 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 lg:p-12 opacity-[0.02] pointer-events-none">
                         <TrendingUp size={window.innerWidth < 640 ? 150 : 300} />
                      </div>

                      <div className="space-y-6 lg:space-y-8 relative z-10">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                                <div>
                                    <p className="text-[9px] lg:text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">Overall Standing <Info size={14} /></p>
                                    <p className="text-xl lg:text-4xl font-black uppercase tracking-tighter" style={{ color: primaryColor }}>Superior to {(result.globalStanding || 0).toFixed(2)}%</p>
                                </div>
                              
                              <div className={cn(
                                "size-14 lg:size-20 rounded-xl lg:rounded-[1.5rem] flex items-center justify-center font-black text-xl lg:text-3xl shadow-2xl border-4 border-white/20",
                                scorePercentage >= 75 ? "bg-emerald-500 text-white" : "text-white"
                              )}
                              style={{ backgroundColor: scorePercentage >= 75 ? undefined : primaryColor }}
                              >
                                  {result.grade || (scorePercentage >= 75 ? 'A1' : 'C6')}
                              </div>
                          </div>
                          <div className="h-4 lg:h-6 bg-slate-50 dark:bg-white/5 rounded-full overflow-hidden shadow-inner p-1">
                              <div 
                                className="h-full rounded-full transition-all duration-1000 shadow-lg" 
                                style={{ width: `${result.globalStanding || 92}%`, background: `linear-gradient(to right, ${primaryColor}, #2563eb)` }}
                              />
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 lg:gap-8 relative z-10">
                          <div className="p-6 lg:p-10 rounded-[1.5rem] lg:rounded-[2.5rem] bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 text-center shadow-inner">
                              <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 lg:mb-4">Class Average</p>
                              <p className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">{Math.round((result.classAverage / result.totalMarks) * 100) || "76"}%</p>
                          </div>

                           <div className="p-6 lg:p-10 rounded-[1.5rem] lg:rounded-[2.5rem] bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 text-center shadow-inner">
                              <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 lg:mb-4">Progress</p>
                              <div className="flex items-center justify-center gap-2 lg:gap-3">
                                  <span className={cn(
                                    "size-2 lg:size-3 rounded-full animate-pulse",
                                    (result.velocity || 0) >= 0 ? "bg-emerald-500" : "bg-rose-500"
                                  )} />
                                  <p className={cn(
                                    "text-2xl lg:text-4xl font-black tracking-tighter leading-none",
                                    (result.velocity || 0) >= 0 ? "text-emerald-500" : "text-rose-500"
                                  )}>{(result.velocity || 0) >= 0 ? '+' : ''}{result.velocity || "0"}%</p>
                              </div>
                          </div>
                      </div>
                      
                      {hasPerformanceAccess ? (
                        <div className="p-6 lg:p-10 rounded-2xl lg:rounded-[3rem] border border-primary dark:border-primary/20 relative group overflow-hidden" style={{ backgroundColor: `${primaryColor}05` }}>
                            <History className="absolute -right-4 -bottom-4 lg:-right-8 lg:-bottom-8 opacity-5 transition-opacity duration-700 group-hover:opacity-10" size={160} style={{ color: primaryColor }} />
                            <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.3em] mb-4 lg:mb-6 flex items-center gap-3" style={{ color: primaryColor }}>
                               <Zap size={14} fill="currentColor" /> AI's Comment
                            </p>
                            <p className="text-sm lg:text-lg font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic relative z-10">
                                "{result.performanceInsight || "The student shows consistent progress and high performance across all subjects."}"
                            </p>
                        </div>
                      ) : (
                        <div className="p-6 lg:p-10 rounded-2xl lg:rounded-[3rem] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center text-center">
                            <Zap size={24} className="text-slate-400 mb-4" />
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">AI Insights Locked</h4>
                            <p className="text-xs text-slate-500 max-w-xs">Upgrade your plan to unlock AI-generated performance insights for your students.</p>
                        </div>
                      )}
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
function SubjectPapersView({ papers, isLoading, onSelectPaper, primaryColor, schoolId }: any) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isNavigating, setIsNavigating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // New Filters State
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  // Query classes data
  const { data: classesData } = useClasses(schoolId);

  // Extract unique subjects dynamically from papers
  const uniqueSubjects = useMemo(() => {
    const subjects = new Set<string>();
    papers?.forEach((p: any) => {
      if (p.subject?.name) subjects.add(p.subject.name);
    });
    return Array.from(subjects).sort();
  }, [papers]);

  const filteredPapers = (papers || []).filter((p: any) => {
    const matchSearch = searchTerm === '' || 
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchSubject = selectedSubject === 'all' || p.subject?.name === selectedSubject;
    const matchClass = selectedClass === 'all' || p.exams?.some((pe: any) => pe.exam?.classId === selectedClass);

    return matchSearch && matchSubject && matchClass;
  });

  const totalPages = Math.ceil(filteredPapers.length / itemsPerPage);
  const paginatedPapers = filteredPapers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const { totalAttempts, totalQuestions } = useMemo(() => {
    let attempts = 0;
    let questions = 0;
    filteredPapers.forEach((p: any) => {
        attempts += p._count?.examAttempts || 0;
        questions += p.questions?.length || 0;
    });
    return { totalAttempts: attempts, totalQuestions: questions };
  }, [filteredPapers]);

  return (
    <div className="space-y-8 lg:space-y-12">
      {/* Bento Grid Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-[2.5rem] shadow-xl group relative overflow-hidden text-white" style={{ backgroundColor: primaryColor, boxShadow: `0 20px 25px -5px ${primaryColor}30` }}>
                <TrendingUp className="absolute -right-6 -bottom-6 text-white/10 group-hover:scale-110 transition-transform duration-700" size={160} />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Total Papers</p>
                <h3 className="text-4xl font-black tracking-tighter mb-4">{filteredPapers.length}</h3>
                <p className="text-xs font-bold bg-white/10 w-fit px-3 py-1 rounded-full border border-white/10 whitespace-nowrap">
                   {totalAttempts} Student Attempts
                </p>
          </div>
          <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Total Questions</p>
                   <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{totalQuestions}</h3>
                </div>
                <div className="flex gap-2 mt-6">
                   <div className="h-1.5 rounded-full flex-1" style={{ backgroundColor: primaryColor }} />
                </div>
          </div>
          <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white border border-slate-800 shadow-xl shadow-slate-900/20 overflow-hidden relative group">
                <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Subject Overview</p>
                    <div className="space-y-4 mt-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold flex items-center gap-2"><Layers className="text-emerald-400" size={14} /> Unique Subjects</span>
                            <span className="text-xs font-black">{uniqueSubjects.length}</span>
                        </div>
                        <div className="flex items-center justify-between opacity-60">
                            <span className="text-xs font-bold flex items-center gap-2"><User className="text-amber-400" size={14} /> Global Attempts</span>
                            <span className="text-xs font-black">{totalAttempts}</span>
                        </div>
                    </div>
                </div>
                <History className="absolute -left-6 -bottom-6 text-white/5" size={120} />
          </div>
      </div>

      {/* Search & Actions Terminal */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-slate-900/40 p-6 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 w-full">
          {/* Text Search */}
          <div className="relative group flex-1 w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" style={{ color: searchTerm ? primaryColor : undefined } as any} />
              <input 
                  type="text" 
                  placeholder="Search subject papers..."
                  value={searchTerm}
                  onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                  }}
                  className="w-full pl-12 h-12 bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-4 transition-all font-bold text-slate-700 dark:text-slate-200 text-sm animate-all"
                  style={{ '--tw-ring-color': `${primaryColor}20`, borderColor: searchTerm ? primaryColor : undefined } as any}
              />
          </div>

          {/* Subject Filter */}
          <div className="w-full sm:w-48">
            <Select value={selectedSubject} onValueChange={(val) => { setSelectedSubject(val); setCurrentPage(1); }}>
              <SelectTrigger className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 font-bold focus:ring-4 transition-all text-sm" style={{ '--tw-ring-color': `${primaryColor}20` } as any}>
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <SelectItem value="all">All Subjects</SelectItem>
                {uniqueSubjects.map((sub) => (
                  <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Class Filter */}
          <div className="w-full sm:w-48">
            <Select value={selectedClass} onValueChange={(val) => { setSelectedClass(val); setCurrentPage(1); }}>
              <SelectTrigger className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 font-bold focus:ring-4 transition-all text-sm" style={{ '--tw-ring-color': `${primaryColor}20` } as any}>
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <SelectItem value="all">All Classes</SelectItem>
                {classesData?.map((cls: any) => (
                  <SelectItem key={cls.id} value={cls.id}>Class {cls.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl p-1.5 shadow-inner self-start lg:self-center">
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
      </div>

      <div className="space-y-12">
          <div className={cn(
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
                : "flex flex-col gap-4 lg:gap-6"
          )}>
            {isLoading ? (
              [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 rounded-[3.5rem] bg-slate-50 dark:bg-white/[0.02] animate-pulse border border-slate-100 dark:border-white/5" />)
            ) : paginatedPapers.length === 0 ? (
              <div className="col-span-full py-40 text-center bg-slate-50 dark:bg-white/[0.02] rounded-[4rem] border-2 border-dashed border-slate-100 dark:border-white/5 flex flex-col items-center justify-center gap-6">
                 <BarChart3 className="h-20 w-20 text-slate-200 dark:text-slate-800" strokeWidth={1} />
                 <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">No Papers Found</p>
              </div>
            ) : (
              paginatedPapers.map((paper: any, index: number) => (
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
                      "group relative overflow-hidden bg-white dark:bg-slate-900/40 backdrop-blur-3xl border border-slate-100 dark:border-white/5 transition-all duration-500 cursor-pointer",
                      viewMode === 'grid' 
                        ? "rounded-[2rem] lg:rounded-[3.5rem] p-6 lg:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-2" 
                        : "rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-xl flex items-center justify-between gap-4 lg:gap-8",
                      isNavigating === paper.id ? "opacity-70 pointer-events-none scale-[0.98]" : ""
                  )}
                >
                    {viewMode === 'list' ? (
                       <div className="flex items-center gap-4 lg:gap-8 w-full">
                            <div className="size-12 lg:size-16 rounded-xl lg:rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-center font-black shadow-xl text-lg lg:text-xl flex-shrink-0" style={{ color: primaryColor }}>
                                {paper.subject?.name?.charAt(0) || 'P'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base lg:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter truncate">{paper.title}</h3>
                                <div className="flex items-center gap-2 lg:gap-4 mt-1">
                                    <span className="text-[8px] lg:text-[10px] text-slate-500 font-black uppercase tracking-widest">{paper.subject?.name || 'Unassigned'}</span>
                                    <div className="size-1 rounded-full bg-slate-200 dark:bg-slate-800" />
                                    <span className="text-[8px] lg:text-[10px] text-slate-500 font-black uppercase tracking-widest truncate">{paper.exams?.[0]?.exam?.title || 'Standalone'}</span>
                                    <div className="size-1 rounded-full bg-slate-200 dark:bg-slate-800" />
                                    <span className="text-[8px] lg:text-[10px] text-slate-500 font-black uppercase tracking-widest">{paper.questions?.length || 0} Questions</span>
                                </div>
                            </div>
                            <div className="size-10 lg:size-12 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-white transition-all duration-500 shadow-sm flex-shrink-0" style={{ '--hover-bg': primaryColor } as any}>
                                {isNavigating === paper.id ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    <ChevronRight size={18} strokeWidth={3} className="translate-x-0.5" />
                                )}
                            </div>
                       </div>
                    ) : (
                        <>
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-700 pointer-events-none">
                                <BarChart3 size={200} className="text-slate-400 -mr-12 lg:-mr-16 -mt-12 lg:-mt-16 rotate-12" style={{ color: primaryColor }} />
                            </div>
                            
                            <div className="relative z-10 space-y-6 lg:space-y-10">
                                <div className="size-12 lg:size-16 rounded-xl lg:rounded-[1.5rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-center font-black shadow-xl text-xl lg:text-2xl group-hover:scale-110 transition-all duration-500" style={{ color: primaryColor }}>
                                    {paper.subject?.name?.charAt(0) || 'P'}
                                </div>
    
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-tight uppercase tracking-tighter mb-2 lg:mb-3" style={{ '--primary': primaryColor } as any}>{paper.title}</h3>
                                        <p className="text-[9px] lg:text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em] bg-slate-50 dark:bg-white/5 w-fit px-3 lg:px-4 py-1 lg:py-1.5 rounded-full border border-slate-100 dark:border-white/5">{paper.subject?.name || 'Unassigned'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg lg:text-2xl font-black text-slate-900 dark:text-white leading-none">{paper.questions?.length || 0}</p>
                                        <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Questions</p>
                                    </div>
                                </div>
    
                                <div className="flex items-center justify-between pt-6 lg:pt-8 border-t border-slate-100 dark:border-white/5">
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Exam Group</span>
                                            <span className="text-[10px] lg:text-xs font-black text-slate-700 dark:text-slate-300 truncate max-w-[120px] lg:max-w-[160px] uppercase tracking-tighter">
                                                {paper.exams?.[0]?.exam?.title || 'Standalone'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col border-l border-slate-100 dark:border-white/5 pl-6">
                                            <span className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Students</span>
                                            <span className="text-[10px] lg:text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-tighter">
                                                {paper._count?.examAttempts || 0} Taken
                                            </span>
                                        </div>
                                    </div>
                                    <div className="size-10 lg:size-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl bg-slate-50 dark:bg-white/5 text-slate-400 group-hover:text-white" style={{ '--hover-bg': primaryColor } as any}>
                                        {isNavigating === paper.id ? (
                                            <Loader2 className="animate-spin" size={18} />
                                        ) : (
                                            <ChevronRight size={20} strokeWidth={3} className="translate-x-0.5" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </motion.div>
              ))
            )}
          </div>
          {filteredPapers.length > 0 && (
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredPapers.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
          )}
      </div>
    </div>
  );
}
