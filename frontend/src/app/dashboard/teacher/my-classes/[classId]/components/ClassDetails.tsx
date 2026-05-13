"use client"
import React, { FC, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import PageHeader from './PageHeader';
import TabNavigation from './TabNavigation';
import ClassOverviewTab from './ClassOverviewTab';
import StudentsPage from './student/page';
import AssignmentsPage from './assignments/page';
import ExamsPage from './exams&quizzes/page';
import GradesPage from './grades/page';
import { teacherService } from '@/lib/api/services/teacherService';
import { ClassDetailSkeleton } from './ClassDetailSkeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

type TabId = 'overview' | 'students' | 'assignments' | 'grades' | 'exams&quizzes';

const ClassDetails: FC = () => {
    const params = useParams();
    const classId = params.classId as string;
    const [activeTab, setActiveTab] = useState<TabId>('overview');

    const { data, isLoading, isError } = useQuery({
        queryKey: ['class-detail', classId],
        queryFn: () => teacherService.getClassDetail(classId),
        enabled: !!classId,
    });

    const handleAddAnnouncement = () => {
        console.log('Add new announcement');
    };

    if (isLoading) {
        return (
            <div className="p-4 md:p-8 lg:p-12">
                <ClassDetailSkeleton />
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center">
                <div className="w-24 h-24 bg-rose-500/10 text-rose-500 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl">
                    <AlertCircle size={48} strokeWidth={2.5} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4 italic underline decoration-rose-500/30">Registry Access Failed</h2>
                <p className="text-slate-500 max-w-md text-sm font-bold uppercase tracking-widest leading-relaxed">
                    There was an issue retrieving the information for this academic module. Please verify your clearance and try again.
                </p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-10 px-8 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                >
                  Retry Synchronization
                </button>
            </div>
        );
    }

    const { classInfo, stats, upcomingActivities, topStudents, attendance, recentSubmissions } = data;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <ClassOverviewTab
                        stats={stats}
                        upcomingActivities={upcomingActivities}
                        topStudents={topStudents}
                        attendance={attendance}
                        recentSubmissions={recentSubmissions}
                    />
                );
            case 'students':
                return <StudentsPage />;
            case 'assignments':
                return <AssignmentsPage />;
            case 'exams&quizzes':
                return <ExamsPage />;
            case 'grades':
                return <GradesPage />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-transparent">
            <div className="p-4 md:p-8 lg:p-12">
                <div className="max-w-7xl mx-auto">
                    <PageHeader 
                        classData={classInfo}
                        onAddAnnouncement={handleAddAnnouncement}
                    />
        
                    <TabNavigation activeTab={activeTab} onTabChange={setActiveTab}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10, scale: 0.99 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.99 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="w-full"
                            >
                                {renderTabContent()}
                            </motion.div>
                        </AnimatePresence>
                    </TabNavigation>
                </div>
            </div>
        </div>
    );
};

export default ClassDetails;