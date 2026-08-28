/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { examService } from "@/lib/api/services/examService";
import AssessmentGrid from "./components/AssessmentGrid";
import Header from "./components/Header";
import SearchFilters from "./components/SearchFilters";
import StatsCards from "./components/StatsCards";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubjectPaperGrid from "./components/SubjectPaperGrid";
import Pagination from "./components/Pagination";
import { useSubjectPapersPaginated, useExamsPaginated } from "@/lib/api/hooks/useExams";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { AlertCircle } from "lucide-react";

export default function Dashboard() {
    const { user } = useAuthStore();
    const schoolId = user?.schools?.[0]?.schoolId;

    const [filters, setFilters] = useState({
        sessionId: 'all',
        term: 'all',
        classId: 'all',
        departmentId: 'all',
        status: 'all',
        category: 'all',
    });

    const [pageStates, setPageStates] = useState({
        exams: 1,
        quiz: 1,
        ca: 1,
        papers: 1
    });

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

    const LIMIT = 6;

    const commonParams = {
        schoolId,
        sessionId: filters.sessionId === 'all' ? undefined : filters.sessionId,
        term: filters.term === 'all' ? undefined : filters.term,
        classId: filters.classId === 'all' ? undefined : filters.classId,
        departmentIds: filters.departmentId === 'all' ? undefined : [filters.departmentId],
        status: filters.status === 'all' ? undefined : filters.status,
    };

    // Exams
    const { data: examsData, isLoading: isLoadingExams, isError: isErrorExams } = useExamsPaginated({
        ...commonParams,
        category: 'EXAM',
        page: pageStates.exams,
        limit: LIMIT
    });

    // Quizzes
    const { data: quizzesData, isLoading: isLoadingQuizzes, isError: isErrorQuizzes } = useExamsPaginated({
        ...commonParams,
        category: 'QUIZ',
        page: pageStates.quiz,
        limit: LIMIT
    });

    // CAs
    const { data: casData, isLoading: isLoadingCAs, isError: isErrorCAs } = useExamsPaginated({
        ...commonParams,
        category: 'CA', 
        page: pageStates.ca,
        limit: LIMIT
    });

    // Papers
    const { data: papersData, isLoading: isLoadingPapers, isError: isErrorPapers } = useSubjectPapersPaginated({
        ...commonParams,
        page: pageStates.papers,
        limit: LIMIT
    });

    const handleFilterChange = (newFilters: any) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        // Reset pages to 1 when filters change
        setPageStates({ exams: 1, quiz: 1, ca: 1, papers: 1 });
    };

    const handlePageChange = (tab: 'exams' | 'quiz' | 'ca' | 'papers', newPage: number) => {
        setPageStates(prev => ({ ...prev, [tab]: newPage }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderLoading = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-[250px] rounded-xl" />)}
        </div>
    );

    const renderEmpty = (title: string, desc: string) => (
        <div className="bg-slate-50 dark:bg-slate-900/50 border-4 border-dashed border-slate-300 dark:border-slate-700 rounded-[2rem] p-16 text-center shadow-inner">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">{title}</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-bold uppercase tracking-widest text-xs">{desc}</p>
        </div>
    );

    const renderError = (title: string) => (
        <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-10 rounded-[2rem] border-4 border-dashed border-red-300 dark:border-red-900/50 flex flex-col items-center justify-center text-center shadow-inner">
            <div className="bg-red-100 dark:bg-red-900/40 p-4 rounded-2xl shadow-sm mb-5">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" strokeWidth={3} />
            </div>
            <h3 className="font-black text-2xl mb-2 text-red-800 dark:text-red-300 tracking-tighter">{title}</h3>
            <p className="text-xs font-bold uppercase tracking-widest opacity-80 max-w-sm mt-2">We couldn't load the requested data. Please check your connection or try refreshing the page.</p>
        </div>
    );

    return (
        <main className="w-full max-w-7xl mx-auto p-4 md:p-6">
            <Header />
            
            <StatsCards 
                examsCount={examsData?.pagination?.total || 0} 
                quizzesCount={quizzesData?.pagination?.total || 0} 
                casCount={casData?.pagination?.total || 0} 
                papersCount={papersData?.pagination?.total || 0} 
            />

            <div className="mt-8">
                <Tabs defaultValue="exams" className="w-full">
                    <TabsList className="mb-10 flex overflow-x-auto custom-scrollbar bg-slate-100/50 dark:bg-slate-900 p-2 rounded-2xl border-2 border-slate-200 dark:border-slate-800">
                        <TabsTrigger value="exams" className="rounded-xl font-black uppercase tracking-widest text-xs px-6 py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">Exams</TabsTrigger>
                        <TabsTrigger value="quiz" className="rounded-xl font-black uppercase tracking-widest text-xs px-6 py-3 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">Quizzes</TabsTrigger>
                        <TabsTrigger value="ca" className="rounded-xl font-black uppercase tracking-widest text-xs px-6 py-3 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">Continuous Assessments</TabsTrigger>
                        <TabsTrigger value="papers" className="rounded-xl font-black uppercase tracking-widest text-xs px-6 py-3 data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">Subject Papers</TabsTrigger>
                    </TabsList>

                    <TabsContent value="exams" className="space-y-6">
                        <SearchFilters filters={filters} onFilterChange={handleFilterChange} hideCategoryFilter viewMode={viewMode} onViewModeChange={setViewMode} />
                        {isLoadingExams ? renderLoading() : isErrorExams ? renderError("Unable to load exams") : examsData?.data?.length === 0 ? (
                            <>
                                {renderEmpty("No exams found", "Start by creating your first exam to manage assessments for your school.")}
                                <Pagination pagination={{ page: 1, pages: 1, total: 0, limit: LIMIT }} onPageChange={(p) => handlePageChange('exams', p)} />
                            </>
                        ) : (
                            <AssessmentGrid 
                                assessments={examsData?.data || []} 
                                pagination={examsData?.pagination} 
                                onPageChange={(p) => handlePageChange('exams', p)} 
                                viewMode={viewMode}
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="quiz" className="space-y-6">
                        <SearchFilters filters={filters} onFilterChange={handleFilterChange} hideCategoryFilter viewMode={viewMode} onViewModeChange={setViewMode} />
                        {isLoadingQuizzes ? renderLoading() : isErrorQuizzes ? renderError("Unable to load quizzes") : quizzesData?.data?.length === 0 ? (
                            <>
                                {renderEmpty("No quizzes found", "Create a new quiz assessment.")}
                                <Pagination pagination={{ page: 1, pages: 1, total: 0, limit: LIMIT }} onPageChange={(p) => handlePageChange('quiz', p)} />
                            </>
                        ) : (
                            <AssessmentGrid 
                                assessments={quizzesData?.data || []} 
                                pagination={quizzesData?.pagination} 
                                onPageChange={(p) => handlePageChange('quiz', p)} 
                                viewMode={viewMode}
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="ca" className="space-y-6">
                        <SearchFilters filters={filters} onFilterChange={handleFilterChange} hideCategoryFilter viewMode={viewMode} onViewModeChange={setViewMode} />
                        {isLoadingCAs ? renderLoading() : isErrorCAs ? renderError("Unable to load CAs") : casData?.data?.length === 0 ? (
                            <>
                                {renderEmpty("No Continuous Assessments found", "Create a new CA.")}
                                <Pagination pagination={{ page: 1, pages: 1, total: 0, limit: LIMIT }} onPageChange={(p) => handlePageChange('ca', p)} />
                            </>
                        ) : (
                            <AssessmentGrid 
                                assessments={casData?.data || []} 
                                pagination={casData?.pagination} 
                                onPageChange={(p) => handlePageChange('ca', p)} 
                                viewMode={viewMode}
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="papers" className="space-y-6">
                        <SearchFilters filters={filters} onFilterChange={handleFilterChange} hideCategoryFilter viewMode={viewMode} onViewModeChange={setViewMode} />
                        {isLoadingPapers ? renderLoading() : isErrorPapers ? renderError("Unable to load subject papers") : papersData?.data?.length === 0 ? (
                            <>
                                {renderEmpty("No papers found", "Create or add existing subject papers to manage your assessments.")}
                                <Pagination pagination={{ page: 1, pages: 1, total: 0, limit: LIMIT }} onPageChange={(p) => handlePageChange('papers', p)} />
                            </>
                        ) : (
                            <SubjectPaperGrid 
                                papers={papersData?.data || []} 
                                pagination={papersData?.pagination} 
                                onPageChange={(p) => handlePageChange('papers', p)} 
                                viewMode={viewMode}
                            />
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    );
}