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
import TimetablePage from './timetable/page';
import AttendancePage from './attendance/page';
import { teacherService } from '@/lib/api/services/teacherService';
import { ClassDetailSkeleton } from './ClassDetailSkeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

type TabId = 'overview' | 'students' | 'assignments' | 'grades' | 'exams&quizzes' | 'timetable' | 'attendance';

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
            case 'timetable':
                return <TimetablePage classData={classInfo} />;
            case 'attendance':
                return <AttendancePage />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-transparent">
            <div className="p-4 md:p-8 lg:p-12">
                <div className={`mx-auto transition-all duration-500 ${activeTab === 'timetable' ? 'max-w-full 2xl:max-w-[1600px]' : 'max-w-7xl'}`}>
                    <PageHeader 
                        classData={classInfo} 
                        onAddAnnouncement={handleAddAnnouncement} 
                    />
                    
                    <div className="mt-8">
                        <TabNavigation 
                            activeTab={activeTab} 
                            onTabChange={setActiveTab} 
                        />
                    </div>

                    <div className="mt-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {renderTabContent()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassDetails;