"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  Info,
  Layers,
  User,
  History,
  Search,
  LayoutGrid,
  List,
  Trophy,
  ChevronRight,
  PenTool,
  BookOpen,
  FileText,
  Calendar,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useClasses } from '@/lib/api/hooks/useClasses';
import { groupByDate } from '../utils/dateSectioning';
import Pagination from './Pagination';
import ExamStudentList from './ExamStudentList';
import DetailedStudentResult from './DetailedStudentResult';

interface ExamGradesFlowProps {
  activeTab?: string;
  exams: any[];
  selectedExamId: string | null;
  setSelectedExamId: (id: string | null) => void;
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;
  selectedPaperId: string;
  setSelectedPaperId: (id: string) => void;
  onBackToExams: () => void;
  onBackToStudents: () => void;
  isLoading: boolean;
  school: any;
  primaryColor: string;
  schoolId: string;
}

export default function ExamGradesFlow({
  activeTab = 'exams',
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
}: ExamGradesFlowProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Default to grid on mobile
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setViewMode('grid');
    }
  }, []);

  // New Filters State
  const [selectedClass, setSelectedClass] = useState<string>('all');

  // Query classes data
  const { data: classesData } = useClasses(schoolId);
  const filteredExams = (exams || []).filter((e: any) => {
    const type = (e.category || e.assessmentType || '').toUpperCase();

    let isMatch = true;
    if (activeTab === 'exams') isMatch = type === 'EXAM' || (!['CA', 'MIDTERM', 'ASSIGNMENT', 'PROJECT', 'HOMEWORK', 'CLASSWORK', 'QUIZ', 'TEST'].some(t => type.includes(t)));
    else if (activeTab === 'ca') isMatch = type === 'CA' || type === 'MIDTERM' || type.includes('CONTINUOUS');
    else if (activeTab === 'assignment') isMatch = type === 'ASSIGNMENT' || type.includes('PROJECT') || type.includes('HOMEWORK') || type.includes('CLASSWORK');
    else if (activeTab === 'test') isMatch = type === 'QUIZ' || type === 'TEST' || type.includes('QUIZ') || type.includes('TEST');

    if (!isMatch) return false;

    const matchSearch = searchTerm === '' ||
      e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.class?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchClass = selectedClass === 'all' || e.classId === selectedClass;

    return matchSearch && matchClass;
  });

  const totalPages = Math.ceil(filteredExams.length / itemsPerPage);
  const paginatedExams = filteredExams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const examGroups = useMemo(() => {
    return groupByDate<{ exam: any; globalIndex: number }>(
      paginatedExams.map((exam: any, idx: number) => ({
        exam,
        globalIndex: (currentPage - 1) * itemsPerPage + idx + 1,
      })),
      (item) => item.exam?.createdAt || item.exam?.updatedAt || item.exam?.startDate
    );
  }, [paginatedExams, currentPage, itemsPerPage]);

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
            <div className="flex items-center gap-1.5 mb-1">
              <p className="text-xs font-medium text-slate-500">Total Questions</p>
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-slate-400 hover:text-blue-500 focus:outline-none">
                      <Info size={12} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl">
                    Combined total of all questions available in these papers.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
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
                <span className="text-xs font-medium flex items-center gap-1.5 text-slate-300">
                  <Layers className="text-emerald-400" size={14} /> Total Papers
                  <TooltipProvider>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <button type="button" className="text-slate-400 hover:text-blue-500 focus:outline-none">
                          <Info size={12} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl">
                        Total number of individual papers in this assessment.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </span>
                <span className="text-sm font-semibold">{totalPapers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium flex items-center gap-1.5 text-slate-300">
                  <User className="text-amber-400" size={14} /> Global Attempts
                  <TooltipProvider>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <button type="button" className="text-slate-400 hover:text-blue-500 focus:outline-none">
                          <Info size={12} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl">
                        Total number of student attempts across all active papers.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </span>
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
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-48 rounded-2xl bg-slate-50 dark:bg-slate-800/50 animate-pulse border border-slate-100 dark:border-slate-800" />)}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
                  <th className="p-4 w-12"><div className="h-4 w-6 rounded-md bg-slate-200 dark:bg-slate-700 mx-auto animate-pulse" /></th>
                  <th className="p-4"><div className="h-4 w-32 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse" /></th>
                  <th className="p-4 text-center"><div className="h-4 w-16 rounded-md bg-slate-200 dark:bg-slate-700 mx-auto animate-pulse" /></th>
                  <th className="p-4 text-center"><div className="h-4 w-16 rounded-md bg-slate-200 dark:bg-slate-700 mx-auto animate-pulse" /></th>
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
                    <td className="p-4 text-center"><div className="h-4 w-8 rounded-md bg-slate-100 dark:bg-slate-800 mx-auto animate-pulse" /></td>
                    <td className="p-4 text-center"><div className="h-4 w-8 rounded-md bg-slate-100 dark:bg-slate-800 mx-auto animate-pulse" /></td>
                    <td className="p-4 text-center"><div className="h-4 w-8 rounded-md bg-slate-100 dark:bg-slate-800 mx-auto animate-pulse" /></td>
                    <td className="p-4 text-center"><div className="h-6 w-6 rounded-md bg-slate-100 dark:bg-slate-800 mx-auto animate-pulse" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : paginatedExams.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-4">
          <Trophy className="h-12 w-12 text-slate-300 dark:text-slate-600" strokeWidth={1.5} />
          <p className="text-sm font-medium text-slate-500">No exams found matching your criteria.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {viewMode === 'list' ? (
            <div className="space-y-6">
              {examGroups.map((section) => (
                <div key={section.label} className="space-y-3">
                  <div className="flex items-center gap-2.5 px-1 py-1">
                    <div className="size-2 rounded-full bg-indigo-500" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                      {section.label}
                    </h4>
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full">
                      {section.items.length} {section.items.length === 1 ? 'record' : 'records'}
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200/80 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
                          <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-12 text-center">#</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Exam Details</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Papers</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Questions</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Students</th>
                          <th className="p-4 w-12"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                        {section.items.map(({ exam, globalIndex }) => (
                          <tr
                            key={exam.id}
                            onClick={() => {
                              setSelectedExamId(exam.id);
                              router.push(`/dashboard/admin/grades/assessments/${exam.id}`);
                            }}
                            className="group border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors relative cursor-pointer"
                          >
                            <td className="p-4 text-center text-xs font-bold text-slate-400 relative z-10">
                              #{globalIndex}
                            </td>
                            <td className="p-4 relative">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors shrink-0">
                                  <Trophy size={18} strokeWidth={2.5} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                    {exam.title}
                                  </h3>
                                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                                    <span>{exam.category || 'General'}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                                    <span>Class {exam.class?.name || "Global"}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 relative text-center">
                              <span className="text-sm font-semibold text-slate-900 dark:text-white">{exam.totalPapers || 0}</span>
                            </td>
                            <td className="p-4 relative text-center">
                              <span className="text-sm font-semibold text-slate-900 dark:text-white">{exam.totalQuestions || 0}</span>
                            </td>
                            <td className="p-4 relative text-center">
                              <span className="text-sm font-semibold text-slate-900 dark:text-white">{exam._count?.examAttempts || 0}</span>
                            </td>
                            <td className="p-4 relative text-center">
                              <div className="h-8 w-8 flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors">
                                <ChevronRight size={18} />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {examGroups.map((section) => (
                <div key={section.label} className="space-y-4">
                  <div className="flex items-center gap-2.5 px-1 py-1">
                    <div className="size-2 rounded-full bg-indigo-500" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                      {section.label}
                    </h4>
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full">
                      {section.items.length} {section.items.length === 1 ? 'record' : 'records'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    {section.items.map(({ exam }, index: number) => {
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
                        <div
                          key={exam.id}
                          onClick={() => {
                            setSelectedExamId(exam.id);
                            router.push(`/dashboard/admin/grades/assessments/${exam.id}`);
                          }}
                          className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between group cursor-pointer relative overflow-hidden`}
                        >
                          <div>
                            {/* Header: Category & Status */}
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${theme.statusBg}`}>
                                {exam.category || 'EXAM'}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {exam.status || "PUBLISHED"}
                              </span>
                            </div>

                            {/* Title & Description */}
                            <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {exam.title}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 mb-4">
                              {exam.description || "Comprehensive assessment and examination grading record."}
                            </p>

                            {/* Rich Details Grid */}
                            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 mb-4">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Class / Scope</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block mt-0.5">
                                  {exam.class?.name ? `Class ${exam.class.name}` : exam.scope?.replace('_', ' ') || "Global Cohort"}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Papers & Questions</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300 block mt-0.5">
                                  {exam.totalPapers || 1} papers • {exam.totalQuestions || 0} qs
                                </span>
                              </div>
                              <div className="col-span-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                                <div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Submissions</span>
                                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mt-0.5">
                                    {exam._count?.examAttempts || 0} students examined
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Marks</span>
                                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mt-0.5">
                                    {exam.totalMarks || 100} pts
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
                            <div className="flex items-center gap-1.5 font-medium">
                              <Calendar size={13} />
                              <span>{exam.createdAt ? format(new Date(exam.createdAt), 'MMM d, yyyy') : "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                              <span>Assessment Grades</span>
                              <ChevronRight size={14} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
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
