'use client';

import { useState, useMemo } from "react";
import AssessmentGrid from "./components/AssessmentGrid";
import Header from "./components/Header";
import SearchFilters from "./components/SearchFilters";
import PaperFilters from "./components/PaperFilters";
import StatsCards from "./components/StatsCards";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubjectPaperGrid from "./components/SubjectPaperGrid";
import { useSubjectPapers, useExams } from "@/lib/api/hooks/useExams";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useSchoolSettings } from "@/lib/api/hooks/useSchool";
import { cn } from "@/lib/utils";
import { Trophy, Zap, Layers, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
    const { user } = useAuthStore();
    const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
    const { data: settings, isLoading: isLoadingSettings } = useSchoolSettings(schoolId);
    const primaryColor = settings?.themeColor || '#2563eb';

    const [filters, setFilters] = useState({
        searchQuery: '',
        sessionId: 'all',
        term: 'all',
        classId: 'all',
        departmentId: 'all',
        status: 'all',
        category: 'all',
    });

    const [paperFilters, setPaperFilters] = useState({
        searchQuery: '',
        subjectId: 'all',
        teacherId: 'all',
        status: 'all',
    });

    const [currentExamPage, setCurrentExamPage] = useState(0);
    const [currentPaperPage, setCurrentPaperPage] = useState(0);
    const itemsPerPage = 6;

    const { data: exams = [], isLoading: isLoadingExams, isError: isErrorExams } = useExams({
        schoolId,
        sessionId: filters.sessionId === 'all' ? undefined : filters.sessionId,
        term: filters.term === 'all' ? undefined : filters.term,
        classId: filters.classId === 'all' ? undefined : filters.classId,
        departmentIds: filters.departmentId === 'all' ? undefined : [filters.departmentId],
        status: filters.status === 'all' ? undefined : filters.status,
        category: filters.category === 'all' ? undefined : (filters.category as string),
    });

    const { data: papers = [], isLoading: isLoadingPapers, isError: isErrorPapers } = useSubjectPapers();

    const filteredExams = useMemo(() => {
        if (!exams || !Array.isArray(exams)) return [];
        return exams.filter(exam => {
            if (filters.searchQuery) {
                const query = filters.searchQuery.toLowerCase();
                const titleMatch = exam.title?.toLowerCase().includes(query);
                const descMatch = exam.description?.toLowerCase().includes(query);
                const classMatch = exam.class?.name?.toLowerCase().includes(query);
                return titleMatch || descMatch || classMatch;
            }
            return true;
        });
    }, [exams, filters.searchQuery]);

    const filteredPapers = useMemo(() => {
        if (!papers || !Array.isArray(papers)) return [];
        return papers.filter(paper => {
            if (paperFilters.searchQuery) {
                const query = paperFilters.searchQuery.toLowerCase();
                const titleMatch = paper.title?.toLowerCase().includes(query);
                const subjectMatch = paper.subject?.name?.toLowerCase().includes(query);
                const teacherMatch = paper.teacher?.name?.toLowerCase().includes(query);
                if (!titleMatch && !subjectMatch && !teacherMatch) return false;
            }
            if (paperFilters.subjectId !== 'all') {
                const sId = paper.subjectId || (paper.subject as any)?.id || paper.subject?.name;
                if (sId !== paperFilters.subjectId) return false;
            }
            if (paperFilters.teacherId !== 'all') {
                const tId = paper.teacherId || paper.teacher?.name;
                if (tId !== paperFilters.teacherId) return false;
            }
            if (paperFilters.status !== 'all') {
                if (paper.status !== paperFilters.status) return false;
            }
            return true;
        });
    }, [papers, paperFilters]);

    const uniqueSubjects = useMemo(() => {
        if (!papers || !Array.isArray(papers)) return [];
        const subjectsMap = new Map();
        papers.forEach(p => {
            if (p.subject) {
                const id = p.subjectId || (p.subject as any).id || p.subject.name;
                if (id) {
                    subjectsMap.set(id, p.subject.name);
                }
            }
        });
        return Array.from(subjectsMap.entries()).map(([value, label]) => ({ value, label }));
    }, [papers]);

    const uniqueTeachers = useMemo(() => {
        if (!papers || !Array.isArray(papers)) return [];
        const teachersMap = new Map();
        papers.forEach(p => {
            if (p.teacher) {
                const id = p.teacherId || p.teacher.name;
                if (id) {
                    teachersMap.set(id, p.teacher.name);
                }
            }
        });
        return Array.from(teachersMap.entries()).map(([value, label]) => ({ value, label }));
    }, [papers]);

    const handleFilterChange = (newFilters: Record<string, unknown>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setCurrentExamPage(0);
    };

    const handlePaperFilterChange = (newFilters: Record<string, unknown>) => {
        setPaperFilters(prev => ({ ...prev, ...newFilters }));
        setCurrentPaperPage(0);
    };

    const totalExamPages = Math.ceil(filteredExams.length / itemsPerPage);
    const paginatedExams = useMemo(() => {
        const start = currentExamPage * itemsPerPage;
        return filteredExams.slice(start, start + itemsPerPage);
    }, [filteredExams, currentExamPage]);

    const totalPaperPages = Math.ceil(filteredPapers.length / itemsPerPage);
    const paginatedPapers = useMemo(() => {
        const start = currentPaperPage * itemsPerPage;
        return filteredPapers.slice(start, start + itemsPerPage);
    }, [filteredPapers, currentPaperPage]);

    // Spectaculor Full Page Skeleton Loader during initial data hydration
    const isPageLoading = !schoolId || isLoadingSettings || (isLoadingExams && exams.length === 0 && isLoadingPapers && papers.length === 0);

    if (isPageLoading) {
        return (
            <main className="min-h-screen bg-white dark:bg-slate-950 p-6 lg:p-10 transition-colors duration-500">
                <div className="max-w-[1600px] mx-auto space-y-12 animate-pulse">
                    {/* Header Skeleton */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-3">
                            <Skeleton className="h-10 w-64 rounded-2xl bg-slate-100 dark:bg-white/[0.02]" />
                            <Skeleton className="h-4 w-96 rounded-xl bg-slate-100 dark:bg-white/[0.02]" />
                        </div>
                        <Skeleton className="h-14 w-48 rounded-[2rem] bg-slate-100 dark:bg-white/[0.02]" />
                    </div>

                    {/* Stats Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-32 rounded-[2.5rem] bg-slate-100 dark:bg-white/[0.02]" />
                        ))}
                    </div>

                    {/* Filters Skeleton */}
                    <Skeleton className="h-24 w-full rounded-2xl bg-slate-100 dark:bg-white/[0.02]" />

                    {/* Content Grid Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-[280px] rounded-[3rem] bg-slate-100 dark:bg-white/[0.02]" />
                        ))}
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white dark:bg-slate-950 p-6 lg:p-10 transition-colors duration-500">
            <div className="max-w-[1600px] mx-auto space-y-12">
                
                {/* Tactical Header Component */}
                <Header />

                {/* Performance Analytics Hub */}
                <StatsCards exams={exams} />

                <div className="mt-12">
                    <Tabs defaultValue="exams" className="w-full space-y-8">
                        <div className="flex justify-center">
                            <TabsList className="h-16 p-2 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-inner">
                                <TabsTrigger 
                                    value="exams"
                                    className="px-8 rounded-xl text-xs font-black uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-lg transition-all"
                                >
                                    <div className="flex items-center gap-2">
                                        <Trophy size={14} />
                                        School Exams
                                    </div>
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="papers"
                                    className="px-8 rounded-xl text-xs font-black uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-lg transition-all"
                                >
                                    <div className="flex items-center gap-2">
                                        <Layers size={14} />
                                        Subject Papers
                                    </div>
                                </TabsTrigger>
                            </TabsList>
                        </div>
 
                        <AnimatePresence mode="wait">
                            <TabsContent value="exams" key="exams" className="mt-0 space-y-8">
                                {/* Local Exams Control Terminal */}
                                <SearchFilters
                                    filters={filters}
                                    onFilterChange={handleFilterChange}
                                />

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-8"
                                >
                                    {isLoadingExams ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                            {[1, 2, 3].map((i) => (
                                                <Skeleton key={i} className="h-[280px] rounded-[3rem] bg-slate-50 dark:bg-white/[0.02]" />
                                            ))}
                                        </div>
                                    ) : isErrorExams ? (
                                        <div className="p-12 rounded-[3rem] bg-red-50/50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/20 text-center space-y-4">
                                            <div className="size-16 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-red-600 mx-auto">
                                                <Zap size={32} />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Connection Failed</h3>
                                            <p className="text-slate-500 dark:text-slate-400 font-medium">Please check your internet connection or try again later.</p>
                                        </div>
                                    ) : filteredExams.length === 0 ? (
                                        <div className="text-center py-40 bg-slate-50 dark:bg-white/[0.02] rounded-[4rem] border-2 border-dashed border-slate-100 dark:border-white/5 flex flex-col items-center justify-center gap-6">
                                            <div className="size-24 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-200 dark:text-slate-800 shadow-xl">
                                                <Trophy size={48} strokeWidth={1} />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No Exams Found</h3>
                                                <p className="text-slate-500 font-medium max-w-sm mx-auto">
                                                    No exams match your search criteria. Try modifying your filters or create a new exam.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <AssessmentGrid assessments={paginatedExams} />
                                            
                                            {/* Exams Pagination Controls */}
                                            {totalExamPages > 1 && (
                                                <div 
                                                    className="flex flex-col md:flex-row items-center justify-between gap-6 p-4 md:p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-3xl" 
                                                    style={{ boxShadow: `0 25px 50px -12px ${primaryColor}10` }}
                                                >
                                                    <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">
                                                        Showing {currentExamPage * itemsPerPage + 1} – {Math.min((currentExamPage + 1) * itemsPerPage, filteredExams.length)} of {filteredExams.length} Assessments
                                                    </span>

                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            className="h-10 px-4 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest border-slate-100 dark:border-white/5"
                                                            onClick={() => setCurrentExamPage(p => Math.max(0, p - 1))}
                                                            disabled={currentExamPage === 0}
                                                        >
                                                            <ChevronLeft size={16} className="mr-2" />
                                                            Prev
                                                        </Button>
                                                        <div className="hidden sm:flex items-center gap-1 px-4">
                                                            {Array.from({ length: totalExamPages }).map((_, i) => (
                                                                <button
                                                                    key={i}
                                                                    className={cn(
                                                                        "size-8 rounded-lg text-xs font-black transition-all",
                                                                        currentExamPage === i ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                                    )}
                                                                    onClick={() => setCurrentExamPage(i)}
                                                                >
                                                                    {i + 1}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            className="h-10 px-4 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest border-slate-100 dark:border-white/5"
                                                            onClick={() => setCurrentExamPage(p => Math.min(totalExamPages - 1, p + 1))}
                                                            disabled={currentExamPage >= totalExamPages - 1}
                                                        >
                                                            Next
                                                            <ChevronRight size={16} className="ml-2" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </motion.div>
                            </TabsContent>
 
                            <TabsContent value="papers" key="papers" className="mt-0 space-y-8">
                                {/* Local Subject Papers Control Terminal */}
                                <PaperFilters
                                    filters={paperFilters}
                                    onFilterChange={handlePaperFilterChange}
                                    subjects={uniqueSubjects}
                                    teachers={uniqueTeachers}
                                />

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-8"
                                >
                                    {isLoadingPapers ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                            {[1, 2, 3].map((i) => (
                                                <Skeleton key={i} className="h-[280px] rounded-[3rem] bg-slate-50 dark:bg-white/[0.02]" />
                                            ))}
                                        </div>
                                    ) : isErrorPapers ? (
                                        <div className="p-12 rounded-[3rem] bg-red-50/50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/20 text-center space-y-4">
                                            <div className="size-16 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-red-600 mx-auto">
                                                <Zap size={32} />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Connection Failed</h3>
                                            <p className="text-slate-500 dark:text-slate-400 font-medium">Please check your internet connection or try again later.</p>
                                        </div>
                                    ) : filteredPapers.length === 0 ? (
                                        <div className="text-center py-40 bg-slate-50 dark:bg-white/[0.02] rounded-[4rem] border-2 border-dashed border-slate-100 dark:border-white/5 flex flex-col items-center justify-center gap-6">
                                            <div className="size-24 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-200 dark:text-slate-800 shadow-xl">
                                                <Layers size={48} strokeWidth={1} />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No Subject Papers Found</h3>
                                                <p className="text-slate-500 font-medium max-w-sm mx-auto">
                                                    No subject papers match your search criteria. Try modifying your filters or create a new paper.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <SubjectPaperGrid papers={paginatedPapers} />

                                            {/* Papers Pagination Controls */}
                                            {totalPaperPages > 1 && (
                                                <div 
                                                    className="flex flex-col md:flex-row items-center justify-between gap-6 p-4 md:p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-3xl" 
                                                    style={{ boxShadow: `0 25px 50px -12px ${primaryColor}10` }}
                                                >
                                                    <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">
                                                        Showing {currentPaperPage * itemsPerPage + 1} – {Math.min((currentPaperPage + 1) * itemsPerPage, filteredPapers.length)} of {filteredPapers.length} Subject Papers
                                                    </span>

                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            className="h-10 px-4 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest border-slate-100 dark:border-white/5"
                                                            onClick={() => setCurrentPaperPage(p => Math.max(0, p - 1))}
                                                            disabled={currentPaperPage === 0}
                                                        >
                                                            <ChevronLeft size={16} className="mr-2" />
                                                            Prev
                                                        </Button>
                                                        <div className="hidden sm:flex items-center gap-1 px-4">
                                                            {Array.from({ length: totalPaperPages }).map((_, i) => (
                                                                <button
                                                                    key={i}
                                                                    className={cn(
                                                                        "size-8 rounded-lg text-xs font-black transition-all",
                                                                        currentPaperPage === i ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                                    )}
                                                                    onClick={() => setCurrentPaperPage(i)}
                                                                >
                                                                    {i + 1}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            className="h-10 px-4 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest border-slate-100 dark:border-white/5"
                                                            onClick={() => setCurrentPaperPage(p => Math.min(totalPaperPages - 1, p + 1))}
                                                            disabled={currentPaperPage >= totalPaperPages - 1}
                                                        >
                                                            Next
                                                            <ChevronRight size={16} className="ml-2" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </motion.div>
                            </TabsContent>
                        </AnimatePresence>
                    </Tabs>
                </div>
            </div>
        </main>
    );
}
