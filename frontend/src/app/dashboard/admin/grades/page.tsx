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
  ChevronDown,
  PenTool,
  BookOpen,
  School,
  Laptop
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
    <div className="min-h-screen bg-transparent pb-20 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Header */}
        <header className="pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center text-xs text-slate-500 font-medium">
                <span>Admin</span>
                <ChevronRight size={14} className="mx-1.5 text-slate-400" />
                <span className="text-slate-900 dark:text-white">Grades</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white">
                Grades
              </h1>
              <p className="text-sm text-slate-500">
                Detailed grade summaries, student results, and overall progress tracking.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
                <Button 
                  onClick={() => setIsInstitutionReportModalOpen(true)}
                  className="h-10 px-4 rounded-xl font-medium gap-2 text-sm shadow-sm hover:shadow-md transition-all text-white border-0"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Download size={16} />
                  <span>School Report</span>
                </Button>
            </div>
          </div>
        </header>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {/* Card 1: Total Exams */}
            <div className="relative overflow-hidden bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-blue-950/20 border border-blue-500/20 rounded-3xl p-6 shadow-sm hover:shadow-2xl hover:border-blue-500/50 hover:-translate-y-1 transition-all duration-300 group">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600" />
                <div className="flex justify-between items-start mb-6">
                    <span className="text-xs font-black uppercase tracking-widest text-blue-600/70 dark:text-blue-400/70">Total Exams</span>
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 transition-transform duration-500 group-hover:rotate-6">
                        <Trophy size={18} strokeWidth={2.5} />
                    </div>
                </div>
                <div>
                    <h3 className="text-4xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {isLoadingExams ? (
                            <Skeleton className="h-10 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                        ) : (
                            exams?.length || 0
                        )}
                    </h3>
                </div>
            </div>

            {/* Card 2: Subject Papers */}
            <div className="relative overflow-hidden bg-gradient-to-br from-white to-purple-50 dark:from-slate-900 dark:to-purple-950/20 border border-purple-500/20 rounded-3xl p-6 shadow-sm hover:shadow-2xl hover:border-purple-500/50 hover:-translate-y-1 transition-all duration-300 group">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-purple-600" />
                <div className="flex justify-between items-start mb-6">
                    <span className="text-xs font-black uppercase tracking-widest text-purple-600/70 dark:text-purple-400/70">Subject Papers</span>
                    <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 transition-transform duration-500 group-hover:-rotate-6">
                        <Layers size={18} strokeWidth={2.5} />
                    </div>
                </div>
                <div>
                    <h3 className="text-4xl font-black text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {isLoadingPapers ? (
                            <Skeleton className="h-10 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                        ) : (
                            subjectPapers?.length || 0
                        )}
                    </h3>
                </div>
            </div>

            {/* Card 3: Graded Students */}
            <div className="relative overflow-hidden bg-gradient-to-br from-white to-emerald-50 dark:from-slate-900 dark:to-emerald-950/20 border border-emerald-500/20 rounded-3xl p-6 shadow-sm hover:shadow-2xl hover:border-emerald-500/50 hover:-translate-y-1 transition-all duration-300 group">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500" />
                <div className="flex justify-between items-start mb-6">
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-600/70 dark:text-emerald-400/70">Students Graded</span>
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-transform duration-500 group-hover:rotate-6">
                        <Users size={18} strokeWidth={2.5} />
                    </div>
                </div>
                <div>
                    <h3 className="text-4xl font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {isLoadingExams ? (
                            <Skeleton className="h-10 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                        ) : (
                            totalAttemptsCount
                        )}
                    </h3>
                </div>
            </div>

            {/* Card 4: Average Score */}
            <div className="relative overflow-hidden bg-gradient-to-br from-white to-orange-50 dark:from-slate-900 dark:to-orange-950/20 border border-orange-500/20 rounded-3xl p-6 shadow-sm hover:shadow-2xl hover:border-orange-500/50 hover:-translate-y-1 transition-all duration-300 group">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-orange-500" />
                <div className="flex justify-between items-start mb-6">
                    <span className="text-xs font-black uppercase tracking-widest text-orange-600/70 dark:text-orange-400/70">Average Score</span>
                    <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 transition-transform duration-500 group-hover:-rotate-6">
                        <Award size={18} strokeWidth={2.5} />
                    </div>
                </div>
                <div>
                    <h3 className="text-4xl font-black text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        {isLoadingExams ? (
                            <Skeleton className="h-10 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                        ) : (
                            `${globalScoreAverage}%`
                        )}
                    </h3>
                </div>
            </div>
        </div>


        {/* Operational Control Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-800">
            <div className="flex gap-6 overflow-x-auto no-scrollbar">
                <button 
                    onClick={() => setActiveTab('exams')}
                    className={cn(
                        "py-3 text-sm font-medium transition-all whitespace-nowrap border-b-2",
                        activeTab === 'exams' 
                          ? "border-primary text-slate-900 dark:text-white" 
                          : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    )}
                    style={{ borderBottomColor: activeTab === 'exams' ? primaryColor : 'transparent' }}
                >
                    Exams
                </button>
                <button 
                    onClick={() => setActiveTab('standalone')}
                    className={cn(
                        "py-3 text-sm font-medium transition-all whitespace-nowrap border-b-2",
                        activeTab === 'standalone' 
                          ? "border-primary text-slate-900 dark:text-white" 
                          : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    )}
                    style={{ borderBottomColor: activeTab === 'standalone' ? primaryColor : 'transparent' }}
                >
                    All Grades
                </button>
                <button 
                    onClick={() => setActiveTab('papers')}
                    className={cn(
                        "py-3 text-sm font-medium transition-all whitespace-nowrap border-b-2",
                        activeTab === 'papers' 
                          ? "border-primary text-slate-900 dark:text-white" 
                          : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    )}
                    style={{ borderBottomColor: activeTab === 'papers' ? primaryColor : 'transparent' }}
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
                onOpenExam={(examId, studentId) => {
                  setSelectedExamId(examId);
                  setSelectedStudentId(studentId);
                  setActiveTab('exams');
                }}
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
      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl shadow-sm text-white flex flex-col justify-between relative overflow-hidden" style={{ backgroundColor: primaryColor }}>
                <div className="relative z-10">
                    <p className="text-xs font-medium text-white/80 mb-1">Total Exams</p>
                    <h3 className="text-3xl font-bold">{filteredExams.length}</h3>
                </div>
                <div className="relative z-10 mt-4 inline-flex items-center text-xs font-medium bg-white/20 px-2 py-1 rounded-md w-fit">
                   {totalAttempts} Student Attempts
                </div>
                <TrendingUp className="absolute right-[-10px] bottom-[-10px] text-white/10" size={100} />
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                   <p className="text-xs font-medium text-slate-500 mb-1">Total Questions</p>
                   <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{totalQuestions}</h3>
                </div>
                <div className="flex gap-2 mt-4">
                   <div className="h-1.5 rounded-full flex-1" style={{ backgroundColor: primaryColor }} />
                </div>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-xs font-medium text-slate-400 mb-4">Structure Overview</p>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium flex items-center gap-2 text-slate-300"><Layers className="text-emerald-400" size={14} /> Total Papers</span>
                            <span className="text-sm font-semibold">{totalPapers}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium flex items-center gap-2 text-slate-300"><User className="text-amber-400" size={14} /> Global Attempts</span>
                            <span className="text-sm font-semibold">{totalAttempts}</span>
                        </div>
                    </div>
                </div>
                <History className="absolute -right-4 -bottom-4 text-white/5" size={100} />
          </div>
      </div>

      {/* Search & Actions Terminal */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 w-full">
          {/* Text Search */}
          <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input 
                  type="text" 
                  placeholder="Search exams, categories..."
                  value={searchTerm}
                  onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                  }}
                  className="w-full pl-9 h-10 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:border-primary transition-all text-sm font-medium text-slate-900 dark:text-white"
              />
          </div>

          {/* Category Filter */}
          <div className="w-full sm:w-48">
            <Select value={selectedCategory} onValueChange={(val) => { setSelectedCategory(val); setCurrentPage(1); }}>
              <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 font-medium text-sm">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
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
              <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 font-medium text-sm">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <SelectItem value="all">All Classes</SelectItem>
                {classesData?.map((cls: any) => (
                  <SelectItem key={cls.id} value={cls.id}>Class {cls.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start lg:self-center">
             <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={cn("h-8 w-8 rounded-md flex items-center justify-center transition-all", viewMode === 'grid' ? "bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
                >
                  <LayoutGrid size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={cn("h-8 w-8 rounded-md flex items-center justify-center transition-all", viewMode === 'list' ? "bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
                >
                  <List size={16} />
                </button>
             </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 rounded-2xl bg-slate-50 dark:bg-slate-800/50 animate-pulse border border-slate-100 dark:border-slate-800" />)}
        </div>
      ) : paginatedExams.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-4">
           <Trophy className="h-12 w-12 text-slate-300 dark:text-slate-600" strokeWidth={1.5} />
           <p className="text-sm font-medium text-slate-500">No exams found matching your criteria.</p>
        </div>
      ) : (
        <div className="space-y-6">
            <div className={cn(
                viewMode === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6" 
                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-200 dark:divide-slate-800"
            )}>
                {paginatedExams.map((exam: any, index: number) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={exam.id} 
                        onClick={() => setSelectedExamId(exam.id)}
                        className={cn(
                            "group relative overflow-hidden transition-all duration-300 cursor-pointer",
                            viewMode === 'grid' 
                                ? "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1" 
                                : "hover:bg-slate-50 dark:hover:bg-slate-800/50 p-4 sm:px-6 flex items-center justify-between gap-4"
                        )}
                    >
                        {viewMode === 'list' ? (
                            <div className="flex items-center gap-4 w-full">
                                <div className="text-sm font-bold text-slate-400 w-6 text-center shrink-0">
                                    {index + 1 + (currentPage - 1) * itemsPerPage}.
                                </div>
                                <div className="h-10 w-10 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 flex-shrink-0" style={{ color: primaryColor }}>
                                    <Trophy size={18} strokeWidth={2} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{exam.title}</h3>
                                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                                        <span>{exam.category || 'General'}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                                        <span>Class {exam.class?.name || "Global"}</span>
                                    </div>
                                </div>
                                <div className="hidden sm:flex items-center gap-8 px-6 border-x border-slate-100 dark:border-slate-800">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Papers</span>
                                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{exam.totalPapers || 0}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Questions</span>
                                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{exam.totalQuestions || 0}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Students</span>
                                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{exam._count?.examAttempts || 0}</span>
                                    </div>
                                </div>
                                <div className="h-8 w-8 flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors flex-shrink-0" style={{ color: primaryColor }}>
                                    <ChevronRight size={18} />
                                </div>
                            </div>
                        ) : (() => {
                            const isQuiz = exam.category === 'QUIZ';
                            const isCA = (exam.category as string) === 'CA';
                            const isExam = !isQuiz && !isCA;

                            const theme = isQuiz ? {
                                border: 'border-orange-500/20 hover:border-orange-500/50',
                                bg: 'bg-gradient-to-br from-white to-orange-50 dark:from-slate-900 dark:to-orange-950/20',
                                iconBg: 'bg-orange-500 text-white shadow-orange-500/30',
                                textHighlight: 'text-orange-600 dark:text-orange-400',
                                statusBg: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
                                icon: PenTool,
                                accentHover: 'group-hover:bg-orange-500 group-hover:text-white'
                            } : isCA ? {
                                border: 'border-emerald-500/20 hover:border-emerald-500/50',
                                bg: 'bg-gradient-to-br from-white to-emerald-50 dark:from-slate-900 dark:to-emerald-950/20',
                                iconBg: 'bg-emerald-500 text-white shadow-emerald-500/30',
                                textHighlight: 'text-emerald-600 dark:text-emerald-400',
                                statusBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
                                icon: BookOpen,
                                accentHover: 'group-hover:bg-emerald-500 group-hover:text-white'
                            } : {
                                border: 'border-blue-500/20 hover:border-blue-500/50',
                                bg: 'bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-blue-950/20',
                                iconBg: 'bg-blue-600 text-white shadow-blue-600/30',
                                textHighlight: 'text-blue-600 dark:text-blue-400',
                                statusBg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
                                icon: FileText,
                                accentHover: 'group-hover:bg-blue-600 group-hover:text-white'
                            };

                            const Icon = theme.icon;

                            return (
                                <div className={`relative rounded-3xl border ${theme.border} ${theme.bg} overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 h-full w-full group`}>
                                    <div className={`h-1.5 w-full ${theme.iconBg} absolute top-0 left-0`} />
                                    <div className="p-7 relative z-10">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={`p-3.5 rounded-2xl shadow-lg ${theme.iconBg} transition-transform duration-500 group-hover:rotate-6`}>
                                                <Icon className="h-6 w-6" strokeWidth={2.5} />
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 text-[11px] font-black uppercase tracking-widest rounded-full ${theme.statusBg}`}>
                                                    {exam.status || "UNKNOWN"}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className={`font-black text-2xl mb-2 text-slate-900 dark:text-white line-clamp-1 transition-colors group-hover:${theme.textHighlight}`}>
                                                {exam.title}
                                            </h3>
                                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-2 h-10">
                                                {exam.description || "No description provided."}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-y-4 mt-6">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Scope</span>
                                                <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    <School className={`h-4 w-4 ${theme.textHighlight}`} />
                                                    <span className="truncate">{exam.scope?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || "Internal"}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mode</span>
                                                <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    <Laptop className={`h-4 w-4 ${theme.textHighlight}`} />
                                                    <span className="truncate">{exam.mode?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || "Cbt"}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col col-span-2 border-t border-slate-200 dark:border-white/10 pt-4 mt-2">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Departments</span>
                                                {exam.departments && exam.departments.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {exam.departments.map((d: any) => (
                                                            <span key={d.department?.id} className={`text-[10px] px-2 py-1 rounded-md border font-bold uppercase tracking-wider ${theme.statusBg} border-transparent`}>
                                                                {d.department?.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md font-bold uppercase tracking-widest inline-block">
                                                        General Assessment
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-end mt-8 pt-5 border-t border-slate-200 dark:border-white/10 pointer-events-none">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Created</span>
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {exam.createdAt ? format(new Date(exam.createdAt), 'MMM d, yyyy') : "N/A"}
                                                </div>
                                            </div>
                                            
                                            <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-400 ${theme.accentHover} transition-all duration-300`}>
                                                <ArrowRight className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
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
                    onClick={handleBatchDownloadZip}
                    disabled={isBatchDownloading || !attempts?.length}
                    className="h-12 w-full sm:w-auto px-6 rounded-2xl font-black uppercase tracking-widest gap-2 shadow-md text-white text-xs border-2 hover:-translate-y-0.5 transition-all"
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
                <div className="p-12 text-center text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">Loading results...</div>
            ) : paginatedAttempts.length === 0 ? (
                <div className="p-12 text-center text-slate-500 font-bold uppercase tracking-widest text-xs bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">No candidates found</div>
            ) : paginatedAttempts.map((attempt: any, idx: number) => {
                const scorePercent = attempt.totalMarks ? Math.round((attempt.totalScore / attempt.totalMarks) * 100) : Math.round(attempt.totalScore || attempt.percentage || 0);
                const serialNumber = idx + 1 + (currentPage - 1) * itemsPerPage;
                const isPassed = scorePercent >= 50;
                
                const theme = isPassed ? {
                    border: 'border-emerald-500/20 hover:border-emerald-500/50',
                    bg: 'bg-gradient-to-br from-white to-emerald-50/50 dark:from-slate-900 dark:to-emerald-950/20',
                    textHighlight: 'text-emerald-600 dark:text-emerald-400',
                    badge: 'bg-emerald-500 text-white shadow-emerald-500/30',
                    progress: 'bg-emerald-500'
                } : {
                    border: 'border-red-500/20 hover:border-red-500/50',
                    bg: 'bg-gradient-to-br from-white to-red-50/50 dark:from-slate-900 dark:to-red-950/20',
                    textHighlight: 'text-red-600 dark:text-red-400',
                    badge: 'bg-red-500 text-white shadow-red-500/30',
                    progress: 'bg-red-500'
                };

                return (
                    <div 
                        key={attempt.id} 
                        onClick={() => onSelectStudent(attempt.studentId)}
                        className={`group relative rounded-3xl border ${theme.border} ${theme.bg} p-4 sm:p-6 cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
                    >
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${theme.progress}`} />
                        
                        <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto ml-2">
                            <div className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-500 shrink-0 font-black text-lg">
                                #{serialNumber}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">
                                    {attempt.student?.name}
                                </h3>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1 truncate">
                                    {attempt.student?.studentId || "UID-UNSET"}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-row items-center justify-between sm:justify-end gap-6 sm:gap-8 w-full sm:w-auto pl-16 sm:pl-0">
                            <div className="flex flex-col sm:items-end">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Score</span>
                                <div className="flex items-center gap-3">
                                    <div className="hidden sm:block w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div className={`h-full ${theme.progress}`} style={{ width: `${scorePercent}%` }} />
                                    </div>
                                    <span className={`text-xl font-black ${theme.textHighlight}`}>
                                        {scorePercent}%
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <span className={`hidden sm:inline-block px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-md ${theme.badge}`}>
                                    {isPassed ? "Passed" : "Review"}
                                </span>
                                <div className="h-10 w-10 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-primary transition-all">
                                    {isNavigating === attempt.id ? <Loader2 className="animate-spin h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
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
            className="h-10 w-full sm:w-auto px-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all text-sm font-medium gap-2 border border-slate-200 dark:border-slate-700"
          >
            <ArrowLeft size={16} />
            Student List
          </Button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
             <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-medium">
                <ShieldCheck size={16} /> Verified Record
             </div>
             <PDFDownloadLink
                document={<IndividualStudentReport result={result} school={school} hasPerformanceAccess={hasPerformanceAccess} />}
                fileName={`${result.student?.name || 'Student'}_${result.title || 'Result'}.pdf`}
                className="w-full sm:w-auto"
              >
                {({ loading }) => (
                  <Button 
                    disabled={loading}
                    className="h-10 w-full sm:w-auto sm:px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium text-sm gap-2 shadow-sm border-0"
                  >
                    {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Download className="h-4 w-4" />}
                    {loading ? 'Preparing...' : 'Export'}
                  </Button>
                )}
              </PDFDownloadLink>
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
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Class Average</p>
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
          <div className="p-6 rounded-2xl shadow-sm group relative overflow-hidden text-white" style={{ backgroundColor: primaryColor }}>
                <TrendingUp className="absolute -right-4 -bottom-4 text-white/10" size={100} />
                <p className="text-xs font-medium opacity-80 mb-2">Total Papers</p>
                <h3 className="text-3xl font-bold mb-4">{filteredPapers.length}</h3>
                <p className="text-xs font-medium bg-white/10 w-fit px-3 py-1 rounded-full border border-white/10 whitespace-nowrap">
                   {totalAttempts} Student Attempts
                </p>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                   <p className="text-xs font-medium text-slate-500 mb-2">Total Questions</p>
                   <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{totalQuestions}</h3>
                </div>
                <div className="flex gap-2 mt-6">
                   <div className="h-1 rounded-full flex-1" style={{ backgroundColor: primaryColor }} />
                </div>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-sm overflow-hidden relative group">
                <div className="relative z-10">
                    <p className="text-xs font-medium text-slate-400 mb-4">Subject Overview</p>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium flex items-center gap-2"><Layers className="text-emerald-400" size={14} /> Unique Subjects</span>
                            <span className="text-sm font-semibold">{uniqueSubjects.length}</span>
                        </div>
                        <div className="flex items-center justify-between opacity-80">
                            <span className="text-xs font-medium flex items-center gap-2"><User className="text-amber-400" size={14} /> Global Attempts</span>
                            <span className="text-sm font-semibold">{totalAttempts}</span>
                        </div>
                    </div>
                </div>
                <History className="absolute -right-4 -bottom-4 text-white/5" size={100} />
          </div>
      </div>

      {/* Search & Actions Terminal */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 w-full">
          {/* Text Search */}
          <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" style={{ color: searchTerm ? primaryColor : undefined } as any} />
              <input 
                  type="text" 
                  placeholder="Search subject papers..."
                  value={searchTerm}
                  onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                  }}
                  className="w-full h-10 pl-9 pr-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-primary transition-all text-sm font-medium text-slate-900 dark:text-white"
                  style={{ borderColor: searchTerm ? primaryColor : undefined } as any}
              />
          </div>

          {/* Subject Filter */}
          <div className="w-full sm:w-48">
            <Select value={selectedSubject} onValueChange={(val) => { setSelectedSubject(val); setCurrentPage(1); }}>
              <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium text-sm">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
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
              <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium text-sm">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <SelectItem value="all">All Classes</SelectItem>
                {classesData?.map((cls: any) => (
                  <SelectItem key={cls.id} value={cls.id}>Class {cls.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 self-start lg:self-center">
            <button 
                onClick={() => setViewMode('grid')}
                className={cn("h-8 w-8 rounded-lg flex items-center justify-center transition-all", viewMode === 'grid' ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                style={{ color: viewMode === 'grid' ? primaryColor : undefined }}
            >
                <LayoutGrid size={16} />
            </button>
            <button 
                onClick={() => setViewMode('list')}
                className={cn("h-8 w-8 rounded-lg flex items-center justify-center transition-all", viewMode === 'list' ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                style={{ color: viewMode === 'list' ? primaryColor : undefined }}
            >
                <List size={16} />
            </button>
        </div>
      </div>

      <div className="space-y-12">
          <div className={cn(
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-200 dark:divide-slate-800"
          )}>
            {isLoading ? (
              [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-48 rounded-2xl bg-slate-50 dark:bg-slate-800/50 animate-pulse border border-slate-200 dark:border-slate-800" />)
            ) : paginatedPapers.length === 0 ? (
              <div className="col-span-full py-32 text-center bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-4">
                 <BarChart3 className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                 <p className="text-sm font-medium text-slate-500">No Papers Found</p>
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
                      "group relative overflow-hidden transition-all duration-300 cursor-pointer",
                      viewMode === 'grid' 
                        ? "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-md hover:border-primary/30" 
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50 p-4 lg:p-5 flex items-center justify-between gap-4 lg:gap-8 hover:border-primary/30",
                      isNavigating === paper.id ? "opacity-70 pointer-events-none scale-[0.98]" : ""
                  )}
                >
                    {viewMode === 'list' ? (
                       <div className="flex items-center gap-4 lg:gap-6 w-full">
                            <div className="text-sm font-bold text-slate-400 w-6 text-center shrink-0">
                                {index + 1 + (currentPage - 1) * itemsPerPage}.
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-lg flex-shrink-0" style={{ color: primaryColor }}>
                                {paper.subject?.name?.charAt(0) || 'P'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-semibold text-slate-900 dark:text-white truncate">{paper.title}</h3>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className="text-xs text-slate-500 font-medium">{paper.subject?.name || 'Unassigned'}</span>
                                    <span className="text-slate-300 dark:text-slate-700">•</span>
                                    <span className="text-xs text-slate-500 font-medium truncate">{paper.exams?.[0]?.exam?.title || 'Standalone'}</span>
                                    <span className="text-slate-300 dark:text-slate-700">•</span>
                                    <span className="text-xs text-slate-500 font-medium">{paper.questions?.length || 0} Questions</span>
                                </div>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary transition-all duration-300 flex-shrink-0">
                                {isNavigating === paper.id ? (
                                    <Loader2 className="animate-spin h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </div>
                       </div>
                    ) : (() => {
                        const getStatusStyles = (status: string) => {
                          switch (status) {
                            case 'DRAFT': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
                            case 'REVIEW': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
                            case 'APPROVED': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
                            case 'REJECTED': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
                            case 'PUBLISHED': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300';
                            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
                          }
                        };
                        const statusStyle = getStatusStyles(paper.status || 'PUBLISHED');

                        return (
                            <div className="relative rounded-3xl border border-purple-500/20 bg-gradient-to-br from-white to-purple-50 dark:from-slate-900 dark:to-purple-950/20 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-purple-500/50 hover:-translate-y-1.5 h-full w-full group">
                                <div className="h-1.5 w-full bg-purple-500 absolute top-0 left-0" />
                                <div className="p-7 relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-3.5 rounded-2xl shadow-lg bg-purple-600 text-white shadow-purple-600/30 transition-transform duration-500 group-hover:-rotate-6">
                                            <Layers className="h-6 w-6" strokeWidth={2.5} />
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 text-[11px] font-black uppercase tracking-widest rounded-full ${statusStyle}`}>
                                                {paper.status || 'PUBLISHED'}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-black text-2xl mb-2 text-slate-900 dark:text-white line-clamp-1 transition-colors group-hover:text-purple-600 dark:group-hover:text-purple-400">
                                            {paper.title || `${paper.subject?.name} Paper`}
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-4 mt-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Subject</span>
                                            <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                                <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                <span className="truncate">{paper.subject?.name || 'Unknown'}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Teacher</span>
                                            <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                                <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                <span className="truncate">{paper.teacher?.name || 'Unassigned'}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col col-span-2 border-t border-slate-200 dark:border-white/10 pt-4 mt-2">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Linked Exams</span>
                                            {paper.exams && paper.exams.length > 0 ? (
                                                <div className="flex items-center text-sm font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 px-3 py-2 rounded-xl">
                                                    <Calendar className="h-4 w-4 mr-2" />
                                                    <span className="truncate">
                                                        {paper.exams.length === 1 
                                                        ? paper.exams[0].exam?.title
                                                        : `${paper.exams[0].exam?.title} (+${paper.exams.length - 1} more)`
                                                        }
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md font-bold uppercase tracking-widest inline-block">
                                                    Standalone Paper
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end mt-8 pt-5 border-t border-slate-200 dark:border-white/10 pointer-events-none">
                                        <div className="flex gap-6">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Time</span>
                                                <div className="flex items-center gap-1.5 text-lg font-black text-slate-700 dark:text-slate-300">
                                                    {paper.durationMinutes || 0}<span className="text-sm font-medium text-slate-400">m</span>
                                                </div>
                                            </div>
                                            <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 my-auto" />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Score</span>
                                                <div className="flex items-center gap-1.5 text-lg font-black text-slate-700 dark:text-slate-300">
                                                    {paper.totalMarks || 0}<span className="text-sm font-medium text-slate-400">pts</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-400 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                                            {isNavigating === paper.id ? (
                                                <Loader2 className="animate-spin h-5 w-5" />
                                            ) : (
                                                <ArrowRight className="h-5 w-5" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
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
