"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, UserCog, AlertTriangle, QrCode, X } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

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

import { TabSkeleton } from './TabSkeleton';
export default function ClassDetails() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;
  
  const { data: classData, isLoading: loading, error } = useSingleClass(classId);
  const { data: realBehaviourAlerts = [] } = useClassBehaviourAlerts(classId);
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
      content: <Overview behaviourAlerts={behaviourAlerts} classData={classData} />
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
    <div className="relative flex min-h-screen w-full bg-gray-50 dark:bg-neutral-950">
      <main className="flex-1 p-8">
        <div className="w-full">
          <div className="mb-4">
            <Breadcrumbs items={breadcrumbItems} />
          </div>
          
          {/* Page Heading & Button Group (Mirroring Admin Layout exactly) */}
          <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
            <div className="flex flex-col gap-1">
              {loading ? (
                <div className="h-10 w-64 bg-slate-200 dark:bg-emerald-900/40 rounded-xl animate-pulse" />
              ) : (
                <p className="text-gray-900 dark:text-white text-4xl font-black leading-tight tracking-tight">
                  {classData?.name} {classData?.section ? `- ${classData.section}` : ""}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-500 dark:text-gray-400 text-sm font-medium">
                {loading ? (
                  <>
                    <span className="flex items-center gap-1.5 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-slate-200 dark:bg-emerald-900/40" />
                       Code: <span className="inline-block h-3.5 w-12 bg-slate-200 dark:bg-emerald-900/40 rounded" />
                    </span>
                    <span>|</span>
                    <span className="animate-pulse">
                      Students: <span className="inline-block h-3.5 w-8 bg-slate-200 dark:bg-emerald-900/40 rounded" />
                    </span>
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                       Code: <span className="text-gray-900 dark:text-white font-bold">{classData?.classCode}</span>
                    </span>
                    {classData?.level && (
                      <>
                        <span>|</span>
                        <span>
                          Level: <span className="text-gray-900 dark:text-white font-bold">{classData.level}</span>
                        </span>
                      </>
                    )}
                    {(classData?.session || "Current Session") && (
                      <>
                        <span>|</span>
                        <span>
                          Session: <span className="text-gray-900 dark:text-white font-bold">{displaySession}</span>
                        </span>
                      </>
                    )}
                    {classData?.term && (
                      <>
                        <span>|</span>
                        <span>
                          Term: <span className="text-gray-900 dark:text-white font-bold">{classData.term}</span>
                        </span>
                      </>
                    )}
                    <span>|</span>
                    <span>Students: <span className="text-gray-900 dark:text-white font-bold">{classData?._count?.enrollments ?? classData?.enrollments?.length ?? 0}</span></span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {/* Optional: Add teacher specific action buttons here if needed, but removing Admin specific ones like Manage Class */}
            </div>
          </div>

          {/* Beautiful Tab Navigation */}
          <TabNavigation 
            activeTab={activeTab as any} 
            onTabChange={(tabId) => setActiveTab(tabId)}
          >
            {/* Tab Content */}
            <div className="mt-6">
              {loading ? (
                <TabSkeleton tabId={activeTab} />
              ) : (
                tabs.find(t => t.id === activeTab)?.content
              )}
            </div>
          </TabNavigation>
        </div>
      </main>
    </div>
  );
}