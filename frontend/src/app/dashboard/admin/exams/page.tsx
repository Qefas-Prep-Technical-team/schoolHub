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

    const LIMIT = 12;

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
    };

    const renderLoading = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-[250px] rounded-xl" />)}
        </div>
    );

    const renderEmpty = (title: string, desc: string) => (
        <div className="bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-16 text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">{desc}</p>
        </div>
    );

    const renderError = (title: string) => (
        <div className="bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-8 rounded-2xl border-2 border-dashed border-red-200 dark:border-red-900/50 flex flex-col items-center justify-center text-center">
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full mb-4">
                <AlertCircle className="w-6 h-6 text-red-500 dark:text-red-400" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-red-800 dark:text-red-300">{title}</h3>
            <p className="text-sm opacity-80 max-w-sm">We couldn't load the requested data. Please check your connection or try refreshing the page.</p>
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
                    <TabsList className="mb-6 flex overflow-x-auto custom-scrollbar">
                        <TabsTrigger value="exams">Exams</TabsTrigger>
                        <TabsTrigger value="quiz">Quizzes</TabsTrigger>
                        <TabsTrigger value="ca">Continuous Assessments</TabsTrigger>
                        <TabsTrigger value="papers">Subject Papers</TabsTrigger>
                    </TabsList>

                    <TabsContent value="exams" className="space-y-6">
                        <SearchFilters filters={filters} onFilterChange={handleFilterChange} hideCategoryFilter />
                        {isLoadingExams ? renderLoading() : isErrorExams ? renderError("Unable to load exams") : examsData?.data?.length === 0 ? renderEmpty("No exams found", "Start by creating your first exam to manage assessments for your school.") : (
                            <AssessmentGrid 
                                assessments={examsData?.data || []} 
                                pagination={examsData?.pagination} 
                                onPageChange={(p) => handlePageChange('exams', p)} 
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="quiz" className="space-y-6">
                        <SearchFilters filters={filters} onFilterChange={handleFilterChange} hideCategoryFilter />
                        {isLoadingQuizzes ? renderLoading() : isErrorQuizzes ? renderError("Unable to load quizzes") : quizzesData?.data?.length === 0 ? renderEmpty("No quizzes found", "Create a new quiz assessment.") : (
                            <AssessmentGrid 
                                assessments={quizzesData?.data || []} 
                                pagination={quizzesData?.pagination} 
                                onPageChange={(p) => handlePageChange('quiz', p)} 
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="ca" className="space-y-6">
                        <SearchFilters filters={filters} onFilterChange={handleFilterChange} hideCategoryFilter />
                        {isLoadingCAs ? renderLoading() : isErrorCAs ? renderError("Unable to load CAs") : casData?.data?.length === 0 ? renderEmpty("No Continuous Assessments found", "Create a new CA.") : (
                            <AssessmentGrid 
                                assessments={casData?.data || []} 
                                pagination={casData?.pagination} 
                                onPageChange={(p) => handlePageChange('ca', p)} 
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="papers" className="space-y-6">
                        <SearchFilters filters={filters} onFilterChange={handleFilterChange} hideCategoryFilter />
                        {isLoadingPapers ? renderLoading() : isErrorPapers ? renderError("Unable to load subject papers") : papersData?.data?.length === 0 ? renderEmpty("No papers found", "Create or add existing subject papers to manage your assessments.") : (
                            <SubjectPaperGrid 
                                papers={papersData?.data || []} 
                                pagination={papersData?.pagination} 
                                onPageChange={(p) => handlePageChange('papers', p)} 
                            />
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    );
}