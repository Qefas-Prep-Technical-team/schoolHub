"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutGrid,
  List,
  Layers,
  ChevronRight,
  Loader2,
  Calendar,
  BookOpen,
  Info,
  TrendingUp,
  User,
  History,
  BarChart3,
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
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useClasses } from '@/lib/api/hooks/useClasses';
import { groupByDate } from '../utils/dateSectioning';
import Pagination from './Pagination';

interface SubjectPapersViewProps {
  papers: any[];
  isLoading: boolean;
  onSelectPaper: (examId: string, paperId: string) => void;
  primaryColor: string;
  schoolId: string;
}

export default function SubjectPapersView({
  papers,
  isLoading,
  onSelectPaper,
  primaryColor,
  schoolId,
}: SubjectPapersViewProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isNavigating, setIsNavigating] = useState<string | null>(null);
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

  const paperGroups = useMemo(() => {
    return groupByDate<{ paper: any; globalIndex: number }>(
      paginatedPapers.map((paper: any, idx: number) => ({
        paper,
        globalIndex: (currentPage - 1) * itemsPerPage + idx + 1,
      })),
      (item) => item.paper?.createdAt || item.paper?.updatedAt
    );
  }, [paginatedPapers, currentPage, itemsPerPage]);

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
          <div className="flex items-center gap-1.5 mb-2">
            <p className="text-xs font-medium opacity-80">Total Papers</p>
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button type="button" className="text-white/70 hover:text-white focus:outline-none">
                    <Info size={12} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl">
                  Total unique subject papers currently active.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <h3 className="text-3xl font-bold mb-4">{filteredPapers.length}</h3>
          <p className="text-xs font-medium bg-white/10 w-fit px-3 py-1 rounded-full border border-white/10 whitespace-nowrap">
            {totalAttempts} Student Attempts
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
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
        {isLoading ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-48 rounded-2xl bg-slate-50 dark:bg-slate-800/50 animate-pulse border border-slate-200 dark:border-slate-800" />)}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
                    <th className="p-4 w-12"><div className="h-4 w-6 rounded-md bg-slate-200 dark:bg-slate-700 mx-auto animate-pulse" /></th>
                    <th className="p-4"><div className="h-4 w-32 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse" /></th>
                    <th className="p-4 text-center"><div className="h-4 w-24 rounded-md bg-slate-200 dark:bg-slate-700 mx-auto animate-pulse" /></th>
                    <th className="p-4 text-center"><div className="h-4 w-24 rounded-md bg-slate-200 dark:bg-slate-700 mx-auto animate-pulse" /></th>
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
                      <td className="p-4 text-center"><div className="h-4 w-16 rounded-md bg-slate-100 dark:bg-slate-800 mx-auto animate-pulse" /></td>
                      <td className="p-4 text-center"><div className="h-4 w-16 rounded-md bg-slate-100 dark:bg-slate-800 mx-auto animate-pulse" /></td>
                      <td className="p-4 text-center"><div className="h-4 w-8 rounded-md bg-slate-100 dark:bg-slate-800 mx-auto animate-pulse" /></td>
                      <td className="p-4 text-center"><div className="h-6 w-6 rounded-md bg-slate-100 dark:bg-slate-800 mx-auto animate-pulse" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : paginatedPapers.length === 0 ? (
          <div className="col-span-full py-32 text-center bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-4">
            <BarChart3 className="h-12 w-12 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-medium text-slate-500">No Papers Found</p>
          </div>
        ) : (
          <div className="space-y-8">
            {viewMode === 'list' ? (
              <div className="space-y-6">
                {paperGroups.map((section) => (
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
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Paper Details</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Linked Exam</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Subject</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Questions</th>
                            <th className="p-4 w-12"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                          {section.items.map(({ paper, globalIndex }) => (
                            <tr
                              key={paper.id}
                              onClick={() => {
                                setIsNavigating(paper.id);
                                onSelectPaper(paper.exams?.[0]?.examId || 'none', paper.id);
                              }}
                              className={cn(
                                "group border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors relative cursor-pointer",
                                isNavigating === paper.id ? "opacity-70 pointer-events-none" : ""
                              )}
                            >
                              <td className="p-4 text-center text-xs font-bold text-slate-400 relative z-10">
                                #{globalIndex}
                              </td>
                              <td className="p-4 relative">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-lg text-slate-500 group-hover:text-primary transition-colors shrink-0">
                                    {paper.subject?.name?.charAt(0) || 'P'}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                      {paper.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                                      {paper.subject?.name || 'Unassigned'}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 relative text-center">
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                  {paper.exams?.[0]?.exam?.title || 'Standalone'}
                                </span>
                              </td>
                              <td className="p-4 relative text-center">
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{paper.subject?.name || 'Unassigned'}</span>
                              </td>
                              <td className="p-4 relative text-center">
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{paper.questions?.length || 0}</span>
                              </td>
                              <td className="p-4 relative text-center">
                                <div className="h-8 w-8 flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors">
                                  {isNavigating === paper.id ? (
                                    <Loader2 className="animate-spin h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-5 w-5" />
                                  )}
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
                {paperGroups.map((section) => (
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {section.items.map(({ paper }, index: number) => {
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
                          <div
                            key={paper.id}
                            onClick={() => router.push(`/dashboard/admin/exams/papers/${paper.id}`)}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all flex flex-col justify-between group cursor-pointer relative overflow-hidden"
                          >
                            <div>
                              {/* Header: Category & Status */}
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                                  PAPER
                                </span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusStyle}`}>
                                  {paper.status || 'PUBLISHED'}
                                </span>
                              </div>

                              {/* Title & Subject */}
                              <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                {paper.title || `${paper.subject?.name} Paper`}
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1 mb-4">
                                Teacher: <span className="font-semibold text-slate-700 dark:text-slate-300">{paper.teacher?.name || 'Faculty Staff'}</span>
                              </p>

                              {/* Details Grid */}
                              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 mb-4">
                                <div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Subject</span>
                                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block mt-0.5">
                                    {paper.subject?.name || 'Unassigned'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Marks & Time</span>
                                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mt-0.5">
                                    {paper.totalMarks || 0} pts • {paper.durationMinutes || 0}m
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
                              <div className="flex items-center gap-1.5 font-medium truncate max-w-[170px]">
                                <BookOpen size={13} className="text-slate-400 shrink-0" />
                                <span className="truncate">{paper.exams?.[0]?.exam?.title || 'Standalone Paper'}</span>
                              </div>
                              <div className="flex items-center gap-1 font-bold text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform shrink-0">
                                <span>View Paper</span>
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
          </div>
        )}
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
