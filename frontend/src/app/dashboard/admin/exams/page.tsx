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
import { useSubjectPapers, useExams } from "@/lib/api/hooks/useExams";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useSchoolSettings } from "@/lib/api/hooks/useSchool";
import { cn } from "@/lib/utils";
import { Trophy, FileText, Zap, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
    const { user } = useAuthStore();
    const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
    const { data: settings } = useSchoolSettings(schoolId);
    const primaryColor = settings?.themeColor || '#2563eb';

    const [filters, setFilters] = useState({
        sessionId: 'all',
        term: 'all',
        classId: 'all',
        departmentId: 'all',
        status: 'all',
        category: 'all',
    });

    const { data: exams = [], isLoading: isLoadingExams, isError: isErrorExams } = useExams({
        schoolId,
        sessionId: filters.sessionId === 'all' ? undefined : filters.sessionId,
        term: filters.term === 'all' ? undefined : filters.term,
        classId: filters.classId === 'all' ? undefined : filters.classId,
        departmentIds: filters.departmentId === 'all' ? undefined : [filters.departmentId],
        status: filters.status === 'all' ? undefined : filters.status,
        category: filters.category === 'all' ? undefined : filters.category as any,
    });

    const { data: papers = [], isLoading: isLoadingPapers, isError: isErrorPapers } = useSubjectPapers();

    return (
        <main className="min-h-screen bg-white dark:bg-slate-950 p-6 lg:p-10 transition-colors duration-500">
            <div className="max-w-[1600px] mx-auto space-y-12">
                
                {/* Tactical Header Component */}
                <Header />

                {/* Performance Analytics Hub */}
                <StatsCards exams={exams} />

                {/* Operational Control Terminal */}
                <SearchFilters
                    filters={filters}
                    onFilterChange={(newFilters: any) => setFilters(prev => ({ ...prev, ...newFilters }))}
                />

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
                                        Institutional Exams
                                    </div>
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="papers"
                                    className="px-8 rounded-xl text-xs font-black uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-lg transition-all"
                                >
                                    <div className="flex items-center gap-2">
                                        <Layers size={14} />
                                        Subject Nodes
                                    </div>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <AnimatePresence mode="wait">
                            <TabsContent value="exams" className="mt-0">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
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
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Sync Protocol Failed</h3>
                                            <p className="text-slate-500 dark:text-slate-400 font-medium">Please verify your uplink or try again later.</p>
                                        </div>
                                    ) : exams.length === 0 ? (
                                        <div className="text-center py-40 bg-slate-50 dark:bg-white/[0.02] rounded-[4rem] border-2 border-dashed border-slate-100 dark:border-white/5 flex flex-col items-center justify-center gap-6">
                                            <div className="size-24 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-200 dark:text-slate-800 shadow-xl">
                                                <Trophy size={48} strokeWidth={1} />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No Assessment Hubs</h3>
                                                <p className="text-slate-500 font-medium max-w-sm mx-auto">
                                                    Start by initializing your first exam node to manage institutional assessments.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <AssessmentGrid assessments={exams} />
                                    )}
                                </motion.div>
                            </TabsContent>

                            <TabsContent value="papers" className="mt-0">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
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
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Sync Protocol Failed</h3>
                                            <p className="text-slate-500 dark:text-slate-400 font-medium">Please verify your uplink or try again later.</p>
                                        </div>
                                    ) : papers.length === 0 ? (
                                        <div className="text-center py-40 bg-slate-50 dark:bg-white/[0.02] rounded-[4rem] border-2 border-dashed border-slate-100 dark:border-white/5 flex flex-col items-center justify-center gap-6">
                                            <div className="size-24 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-200 dark:text-slate-800 shadow-xl">
                                                <Layers size={48} strokeWidth={1} />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No Subject Nodes Discovered</h3>
                                                <p className="text-slate-500 font-medium max-w-sm mx-auto">
                                                    Initialize or synchronize subject papers to manage granular assessments.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <SubjectPaperGrid papers={papers} />
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

