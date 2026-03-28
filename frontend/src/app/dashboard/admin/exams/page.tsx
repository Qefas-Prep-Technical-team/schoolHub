'use client';

import { useQuery } from "@tanstack/react-query";
import { examService } from "@/lib/api/services/examService";
import AssessmentGrid from "./components/AssessmentGrid";
import Header from "./components/Header";
import SearchFilters from "./components/SearchFilters";
import StatsCards from "./components/StatsCards";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubjectPaperGrid from "./components/SubjectPaperGrid";
import { useSubjectPapers } from "@/lib/api/hooks/useExams";

export default function Dashboard() {
    const { data: exams = [], isLoading: isLoadingExams, isError: isErrorExams } = useQuery({
        queryKey: ["exams"],
        queryFn: () => examService.getExams(),
    });

    const { data: papers = [], isLoading: isLoadingPapers, isError: isErrorPapers } = useSubjectPapers();

    return (
        <main className="w-full max-w-7xl mx-auto p-4 md:p-6">
            <Header />
            <StatsCards />
            <SearchFilters />
            
            <div className="mt-8">
                <Tabs defaultValue="exams" className="w-full">
                    <TabsList className="mb-6">
                        <TabsTrigger value="exams">School Examinations</TabsTrigger>
                        <TabsTrigger value="papers">Subject Papers</TabsTrigger>
                    </TabsList>

                    <TabsContent value="exams">
                        {isLoadingExams ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-[250px] rounded-xl" />
                                ))}
                            </div>
                        ) : isErrorExams ? (
                            <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100">
                                <h3 className="font-bold text-lg mb-1">Unable to load exams</h3>
                                <p className="text-sm opacity-90">Please check your connection or try again later.</p>
                            </div>
                        ) : exams.length === 0 ? (
                            <div className="bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-16 text-center">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No exams found</h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                    Start by creating your first exam to manage assessments for your school.
                                </p>
                            </div>
                        ) : (
                            <AssessmentGrid assessments={exams} />
                        )}
                    </TabsContent>

                    <TabsContent value="papers">
                        {isLoadingPapers ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-[250px] rounded-xl" />
                                ))}
                            </div>
                        ) : isErrorPapers ? (
                            <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100">
                                <h3 className="font-bold text-lg mb-1">Unable to load subject papers</h3>
                                <p className="text-sm opacity-90">Please check your connection or try again later.</p>
                            </div>
                        ) : papers.length === 0 ? (
                            <div className="bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-16 text-center">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No papers found</h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                    Create or add existing subject papers to manage your assessments.
                                </p>
                            </div>
                        ) : (
                            <SubjectPaperGrid papers={papers} />
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    );
}