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
import { downloadIndividualResultsAsZip, downloadSingleStudentPdf } from './utils/batchPDFDownloader';
import ExportResultScopeModal, { ExportStudentOption, ExportScopeMode } from './components/ExportResultScopeModal';
import InstitutionReportModal from './components/InstitutionReportModal';
import GradeHub from './components/GradeHub';
import Pagination from './components/Pagination';
import ExamGradesFlow from './components/ExamGradesFlow';
import SubjectPapersView from './components/SubjectPapersView';
import { useGradeHub } from '@/lib/api/hooks/useGrades';
import { useClasses } from '@/lib/api/hooks/useClasses';
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { groupByDate } from './utils/dateSectioning';

export default function AdminGradesDashboard() {
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  const { data: settings } = useSchoolSettings(schoolId);
  const primaryColor = settings?.themeColor || '#2563eb';

  const router = useRouter();
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedPaperId, setSelectedPaperId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'exams' | 'standalone' | 'papers' | 'ca' | 'assignment' | 'test'>('exams');
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
    if (!exams || !Array.isArray(exams) || exams.length === 0) return 0;

    // Attempt to calculate based on exam average scores if provided by backend
    let totalScore = 0;
    let count = 0;

    exams.forEach((exam: any) => {
      if (typeof exam.averageScore === 'number') {
        totalScore += exam.averageScore;
        count++;
      }
    });

    if (count === 0) return 0;
    return Math.round(totalScore / count);
  }, [exams]);

  const filteredGradesForHub = useMemo(() => {
    if (!standaloneGrades) return [];

    const safeGrades = Array.isArray(standaloneGrades) ? standaloneGrades : (standaloneGrades as any)?.data || [];

    // 'standalone' = All Grades — return everything
    if (activeTab === 'standalone') return safeGrades;

    return safeGrades.filter((g: any) => {
      // assessmentType is the real discriminator — category always defaults to EXAM
      // Use assessmentType first, then fall back to category
      const assess = (g.assessmentType || '').toUpperCase().trim();
      const cat = (g.category || '').toUpperCase().trim();
      // If assessmentType exists and is meaningful, use it; otherwise use category
      const type = assess && assess !== 'NULL' ? assess : cat;

      if (activeTab === 'ca') {
        return type === 'CA' || type === 'MIDTERM' || type.includes('CONTINUOUS');
      }
      if (activeTab === 'assignment') {
        return type === 'ASSIGNMENT' || type.includes('PROJECT') || type.includes('HOMEWORK') || type.includes('CLASSWORK');
      }
      if (activeTab === 'test') {
        return type === 'QUIZ' || type === 'TEST' || type.includes('QUIZ') || type.includes('TEST');
      }
      return true;
    });
  }, [standaloneGrades, activeTab]);


  // DEBUG: log unique category values — remove after confirming tabs work
  useMemo(() => {
    const safeGrades = Array.isArray(standaloneGrades) ? standaloneGrades : (standaloneGrades as any)?.data || [];
    const uniqueCats = [...new Set(safeGrades.map((g: any) => `${g.category}|${g.assessmentType}`))];
    if (uniqueCats.length > 0) console.log('[GradeCategories]', uniqueCats);
  }, [standaloneGrades]);

  const categoryCounts = useMemo(() => {
    const safeGrades = Array.isArray(standaloneGrades) ? standaloneGrades : (standaloneGrades as any)?.data || [];
    return {
      exams: exams?.length || 0,
      ca: safeGrades.filter((g: any) => {
        const type = ((g.assessmentType && g.assessmentType !== 'NULL' ? g.assessmentType : g.category) || '').toUpperCase();
        return type === 'CA' || type === 'MIDTERM' || type.includes('CONTINUOUS');
      }).length,
      assignment: safeGrades.filter((g: any) => {
        const type = ((g.assessmentType && g.assessmentType !== 'NULL' ? g.assessmentType : g.category) || '').toUpperCase();
        return type === 'ASSIGNMENT' || type.includes('PROJECT') || type.includes('HOMEWORK') || type.includes('CLASSWORK');
      }).length,
      test: safeGrades.filter((g: any) => {
        const type = ((g.assessmentType && g.assessmentType !== 'NULL' ? g.assessmentType : g.category) || '').toUpperCase();
        return type === 'QUIZ' || type === 'TEST' || type.includes('QUIZ') || type.includes('TEST');
      }).length,
      papers: subjectPapers?.length || 0,
      standalone: safeGrades.length,
    };
  }, [exams, standaloneGrades, subjectPapers]);

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 p-3.5 sm:p-6 lg:p-8 w-full sm:w-[95%] mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-1 sm:mb-2">
        <ol className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 flex-wrap">
          <li className="flex items-center gap-1.5">
            <button
              onClick={() => router.push('/dashboard/admin')}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <GraduationCap size={14} className="text-slate-400" />
              <span>Dashboard</span>
            </button>
          </li>
          <li>
            <ChevronRight size={13} className="text-slate-400" />
          </li>
          <li>
            <span className="text-slate-500 dark:text-slate-400">Academics</span>
          </li>
          <li>
            <ChevronRight size={13} className="text-slate-400" />
          </li>
          <li className="text-slate-900 dark:text-white font-bold flex items-center gap-1">
            <Trophy size={13} className="text-indigo-600 dark:text-indigo-400" />
            <span>Grades & Assessments</span>
          </li>
        </ol>
      </nav>

      {/* Executive Hero Banner Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 -mt-14 -mr-14 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <div className="size-14 sm:size-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200/80 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 border flex items-center justify-center shrink-0 shadow-sm">
              <Trophy className="size-7 sm:size-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Academic Grades & Performance
                </h1>
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                        <Info size={16} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs text-xs z-50">
                      Comprehensive institutional performance tracking across examinations, continuous assessments, homework assignments, and term finals.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium max-w-2xl">
                Browse, monitor, and analyze student marks across all subjects, classes, and assessment formats with real-time grading metrics.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsInstitutionReportModalOpen(true)}
              className="h-11 px-4 sm:px-5 rounded-xl border border-indigo-300 dark:border-indigo-700 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 font-bold text-xs sm:text-sm gap-2 shadow-xs cursor-pointer"
            >
              <Download size={16} className="text-indigo-600 dark:text-indigo-400" />
              <span>Institutional School Report</span>
            </Button>
          </div>
        </div>

        {/* Executive KPI Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Formal Exams
            </span>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums mt-0.5">
              {isLoadingExams ? '—' : exams?.length || 0}
            </p>
          </div>

          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Subject Papers
            </span>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums mt-0.5">
              {isLoadingPapers ? '—' : subjectPapers?.length || 0}
            </p>
          </div>

          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Student Submissions
            </span>
            <p className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums mt-0.5">
              {isLoadingExams ? '—' : totalAttemptsCount}
            </p>
          </div>

          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Institutional Mean
            </span>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
              {isLoadingExams ? '—' : `${globalScoreAverage}%`}
            </p>
          </div>
        </div>
      </div>

      {/* Category Tabs Strip */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'exams', label: 'Terminal Exams', shortLabel: 'Exams', icon: Trophy, activeBg: 'bg-rose-600', activeText: 'text-white', iconColor: 'text-rose-600 dark:text-rose-400' },
            { id: 'ca', label: 'Continuous Assessment', shortLabel: 'CA', icon: CheckCircle2, activeBg: 'bg-blue-600', activeText: 'text-white', iconColor: 'text-blue-600 dark:text-blue-400' },
            { id: 'assignment', label: 'Assignments', shortLabel: 'Assignments', icon: BookOpen, activeBg: 'bg-emerald-600', activeText: 'text-white', iconColor: 'text-emerald-600 dark:text-emerald-400' },
            { id: 'test', label: 'Quizzes / Tests', shortLabel: 'Quizzes / Tests', icon: FileText, activeBg: 'bg-amber-600', activeText: 'text-white', iconColor: 'text-amber-600 dark:text-amber-400' },
            { id: 'papers', label: 'Subject Papers', shortLabel: 'Papers', icon: Layers, activeBg: 'bg-purple-600', activeText: 'text-white', iconColor: 'text-purple-600 dark:text-purple-400' },
            { id: 'standalone', label: 'All Grades Directory', shortLabel: 'All Grades', icon: Award, activeBg: 'bg-indigo-600', activeText: 'text-white', iconColor: 'text-indigo-600 dark:text-indigo-400' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const count = categoryCounts[tab.id as keyof typeof categoryCounts] || 0;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap cursor-pointer shrink-0
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                  ${isActive
                    ? `${tab.activeBg} ${tab.activeText} shadow-md shadow-indigo-600/20 dark:shadow-none`
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }
                `}
              >
                <Icon size={16} className={isActive ? 'text-white' : tab.iconColor} />
                <span>{tab.label}</span>
                {count > 0 && (
                  <span
                    className={`
                      px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black tabular-nums transition-colors
                      ${isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }
                    `}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Content Terminal */}
      <AnimatePresence mode="wait">
        {activeTab === 'exams' ? (
          <motion.section
            key="exams"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            {selectedExamId && (
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={handleBackToExams}
                  className="h-10 px-4 rounded-xl font-bold text-xs gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  <ArrowLeft size={16} />
                  <span>Back to All Exams</span>
                </Button>
              </div>
            )}

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
          </motion.section>
        ) : ['ca', 'test'].includes(activeTab) ? (
          <motion.section
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            {selectedExamId && (
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={handleBackToExams}
                  className="h-10 px-4 rounded-xl font-bold text-xs gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </Button>
              </div>
            )}

            <ExamGradesFlow
              activeTab={activeTab}
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
          </motion.section>
        ) : ['standalone', 'assignment'].includes(activeTab) ? (
          <motion.section
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            <GradeHub
              grades={filteredGradesForHub}
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
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >

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

      <InstitutionReportModal
        isOpen={isInstitutionReportModalOpen}
        onClose={() => setIsInstitutionReportModalOpen(false)}
        school={school}
        primaryColor={primaryColor}
      />
    </div>
  );
}
