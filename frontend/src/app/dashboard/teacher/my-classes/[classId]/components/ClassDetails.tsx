"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, UserCog, AlertTriangle, QrCode, X, BookOpen } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';
import { teacherService } from '@/lib/api/services/teacherService';

// Use same specific API hooks as Admin to match exactly
import { useSingleClass, useClassBehaviourAlerts } from '@/lib/api/hooks/useClasses';

// Admin Components we want to mirror
import Breadcrumbs from '@/app/dashboard/admin/classes/[id]/components/students/components/Breadcrumbs';

// Premium Teacher Components
import TabNavigation from './TabNavigation';
import Overview from './Overview';

// Teacher Specific Pages
import StudentsPage from './student/page';
import AssignmentsPage from './assignments/page';
import ExamsPage from './exams&quizzes/page';
import GradesPage from './grades/page';
import TimetablePage from './timetable/page';
import AttendancePage from './attendance/page';
import TeacherClassOfflineGrades from './TeacherClassOfflineGrades';

import { TabSkeleton } from './TabSkeleton';
export default function ClassDetails() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;
  
  const { data: classData, isLoading: loading, error } = useSingleClass(classId);
  const { data: realBehaviourAlerts = [] } = useClassBehaviourAlerts(classId);
  const { data: teacherClassDetail } = useQuery({
    queryKey: ['class-detail', classId],
    queryFn: () => teacherService.getClassDetail(classId),
    staleTime: 1000 * 60 * 10,
    enabled: !!classId,
  });
  const [activeTab, setActiveTab] = useState("overview");

  // Helper to detect if a string is a raw UUID
  const isUUID = (str: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);
  
  const displaySession = classData?.session && !isUUID(classData.session) ? classData.session : "Current Session";

  useEffect(() => {
    if (error) {
      console.error("Failed to fetch class details:", error);
      toast.error("Failed to load class details or you don't have permission.");
    }
  }, [error]);

  const behaviourAlerts = realBehaviourAlerts.map((alert: any) => ({
    id: alert.id,
    type: alert.type.toLowerCase() as 'warning' | 'danger',
    title: alert.title,
    description: alert.description || "",
    student: alert.student?.name || "Unknown",
    reportedBy: alert.reporter?.name || "System",
  }));

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'My Classes', href: '/dashboard/teacher/my-classes' },
    { label: 'Class Details' }
  ];

  const tabs = [
    { 
      id: "overview", 
      label: "Overview", 
      content: <Overview behaviourAlerts={behaviourAlerts} classData={classData} teacherClassDetail={teacherClassDetail} />
    },
    { 
      id: 'students', 
      label: 'Students', 
      content: <StudentsPage />  
    },
    { 
      id: 'assignments', 
      label: 'Assignments' , 
      content: <AssignmentsPage /> 
    },
    {
      id: 'exams&quizzes',
      label: 'Exams & Subject Papers',
      content: <ExamsPage />
    },
    {
      id: 'grades',
      label: 'Grades',
      content: <GradesPage />
    },
    {
      id: 'offline-grades',
      label: 'Offline Grades',
      content: (
        <div className="w-full max-w-full overflow-hidden">
          <TeacherClassOfflineGrades
            classId={classId}
            schoolId={classData?.schoolId}
            teacherClassDetail={teacherClassDetail}
          />
        </div>
      )
    },
    { 
      id: 'timetable', 
      label: 'Timetable', 
      content: <TimetablePage classData={classData} />  
    },
    { 
      id: 'attendance', 
      label: 'Attendance' , 
      content: <AttendancePage /> 
    },
  ];

  if (!classData && !loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center bg-gray-50 dark:bg-neutral-950">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md border border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-red-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Class Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">
            The class you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <button 
            onClick={() => router.push('/dashboard/teacher/my-classes')}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-95"
          >
            Back to My Classes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto min-w-0 space-y-6">
      <div className="mb-2">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      {/* Full-Width Institutional Page Header Card */}
      <div className="bg-white dark:bg-emerald-950/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-200/80 dark:border-emerald-800/60 shadow-sm relative overflow-hidden">
        {/* Ambient Emerald Glow Accent */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full">
          {loading ? (
            <div className="space-y-4">
              <div className="h-10 w-64 bg-slate-200 dark:bg-emerald-900/40 rounded-xl animate-pulse" />
              <div className="h-6 w-96 bg-slate-100 dark:bg-emerald-950/40 rounded-lg animate-pulse" />
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:gap-5">
              {/* Primary Header Row: Avatar, Title, Active Status */}
              <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="size-12 sm:size-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-xl sm:text-2xl border border-emerald-200 dark:border-emerald-800/60 shrink-0 shadow-2xs">
                    {classData?.name?.charAt(0) || "C"}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-slate-900 dark:text-white text-xl sm:text-2xl md:text-3xl font-black tracking-tight">
                        {classData?.name} {classData?.section ? <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">({classData.section})</span> : ""}
                      </h1>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      Class Cohort & Academic Overview
                    </p>
                  </div>
                </div>

                {/* Active Cohort status badge */}
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    Active Cohort
                  </span>
                </div>
              </div>

              {/* Metadata Badges Grid / Wrap */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-1">
                {classData?.classCode && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 font-bold text-xs shadow-2xs">
                    <span className="text-slate-400 dark:text-slate-500 font-medium">Code:</span>
                    <span className="font-mono text-slate-900 dark:text-white">{classData.classCode}</span>
                  </div>
                )}

                {classData?.level && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 font-bold text-xs shadow-2xs">
                    <span className="text-slate-400 dark:text-slate-500 font-medium">Level:</span>
                    <span className="text-slate-900 dark:text-white">{classData.level}</span>
                  </div>
                )}

                {displaySession && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 font-bold text-xs shadow-2xs">
                    <span className="text-slate-400 dark:text-slate-500 font-medium">Session:</span>
                    <span className="text-slate-900 dark:text-white">{displaySession}</span>
                  </div>
                )}

                {classData?.term && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 font-bold text-xs shadow-2xs">
                    <span className="text-slate-400 dark:text-slate-500 font-medium">Term:</span>
                    <span className="text-slate-900 dark:text-white">{classData.term}</span>
                  </div>
                )}

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs shadow-2xs">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  <span>{classData?._count?.enrollments ?? classData?.enrollments?.length ?? 0} Scholars Enrolled</span>
                </div>
              </div>

              {/* Focus Subjects Container */}
              {teacherClassDetail?.classInfo?.subject && (
                <div className="pt-2 border-t border-slate-100 dark:border-emerald-900/40 flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">
                    <BookOpen className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Focus Subject:</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {teacherClassDetail.classInfo.subject.split(',').map((sub: string, idx: number) => {
                      const trimmed = sub.trim();
                      if (!trimmed) return null;
                      return (
                        <span 
                          key={idx}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-200 font-semibold text-xs transition-colors"
                        >
                          {trimmed}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Full Width Tab Navigation and Content */}
      <TabNavigation 
        activeTab={activeTab as any} 
        onTabChange={(tabId) => setActiveTab(tabId)}
      >
        <div className="mt-4 sm:mt-6 w-full max-w-full">
          {loading ? (
            <TabSkeleton tabId={activeTab} />
          ) : (
            tabs.find(t => t.id === activeTab)?.content
          )}
        </div>
      </TabNavigation>
    </div>
  );
}