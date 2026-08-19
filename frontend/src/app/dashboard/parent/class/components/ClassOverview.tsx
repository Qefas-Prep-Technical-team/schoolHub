"use client";

import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useParentStore } from '@/lib/api/hooks/useParentStore';
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard';
import { useSingleClass, useClassBehaviourAlerts } from '@/lib/api/hooks/useClasses';
import { useExams } from '@/lib/api/hooks/useExams';

import CustomTabs from '@/app/dashboard/admin/classes/[id]/components/Tabs';
import Overview from '@/app/dashboard/admin/classes/[id]/components/Overview';
import ParentClassSubjects from './ParentClassSubjects';
import ParentClassTimetable from './ParentClassTimetable';

const TabSkeleton = ({ tabId }: { tabId: string }) => {
  if (tabId === "overview") {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
              </div>
              <div className="h-64 w-full bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center space-y-4">
                   <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
                   <div className="h-5 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                   <div className="h-8 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                </div>
              ))}
            </div>
          </div>
          
          <div className="col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-6 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                      <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 space-y-6 shadow-sm">
      <div className="h-8 w-1/4 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
        ))}
      </div>
    </div>
  );
};

export default function ClassDetails() {
  const selectedChildId = useParentStore((state) => state.selectedChildId);
  const { data: dashboardData, isLoading: isDashboardLoading } = useParentDashboard(selectedChildId);
  
  const classId = dashboardData?.child?.currentClass?.id;
  const { data: classData, isLoading: isClassLoading, error } = useSingleClass(classId || "");
  const { data: realBehaviourAlerts = [] } = useClassBehaviourAlerts(classId || "", selectedChildId || undefined);
  const [activeTab, setActiveTab] = useState("overview");

  const loading = isDashboardLoading || isClassLoading;

  useEffect(() => {
    if (error) {
      console.error("Failed to fetch class details:", error);
      toast.error("Failed to load class details.");
    }
  }, [error]);

  const behaviourAlerts = realBehaviourAlerts
    .filter((alert: any) => alert.studentId === selectedChildId || alert.student?.id === selectedChildId)
    .map((alert: any) => ({
      id: alert.id,
      type: alert.type.toLowerCase() as 'warning' | 'danger',
      title: alert.title,
      description: alert.description || "",
      student: alert.student?.name || "Unknown",
      reportedBy: alert.reporter?.name || "System",
    }));

  const { data: studentExamsResponse } = useExams({ 
    availableForStudentId: selectedChildId || "",
    status: "PUBLISHED",
  });
  
  const upcomingExams = (studentExamsResponse || []).slice(0, 3).map((e: any) => ({
    id: e.id,
    subject: e.title.split(' ')[0], // Best effort for icon match
    date: new Date(e.createdAt).toLocaleDateString(),
    type: e.category || 'Exam',
  }));

  const tabs = [
    { 
      id: "overview", 
      label: "Class Overview", 
      content: <Overview behaviourAlerts={behaviourAlerts} upcomingExams={upcomingExams} classData={classData} />
    },
    {
      id: "subjects",
      label: "Subjects",
      content: <ParentClassSubjects classSubjects={classData?.subjects || []} />
    },
    {
      id: "schedule",
      label: "Class Schedule",
      content: classId ? <ParentClassTimetable classId={classId} schoolId={classData?.schoolId || dashboardData?.child?.school?.id} /> : <div />
    }
  ];

  if (!selectedChildId) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 font-medium">Please select a child to view their class details.</p>
      </div>
    );
  }

  if (!classId && !loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md border border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-red-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Class Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            No class assigned to the selected student yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full bg-gray-50 dark:bg-gray-900">
      <main className="flex-1 p-8">
        <div className="w-full">
          {/* Page Heading */}
          <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
            <div className="flex flex-col gap-1">
              {loading ? (
                <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
              ) : (
                <p className="text-gray-900 dark:text-white text-4xl font-black leading-tight tracking-tight">
                  {classData?.name} {classData?.section ? `- ${classData.section}` : ""}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-500 dark:text-gray-400 text-sm font-medium">
                {loading ? (
                  <>
                    <span className="flex items-center gap-1.5 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800" />
                       Code: <span className="inline-block h-3.5 w-12 bg-slate-200 dark:bg-slate-800 rounded" />
                    </span>
                    <span>|</span>
                    <span className="animate-pulse">
                      Students: <span className="inline-block h-3.5 w-8 bg-slate-200 dark:bg-slate-800 rounded" />
                    </span>
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
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
                    {classData?.session && (
                      <>
                        <span>|</span>
                        <span>
                          Session: <span className="text-gray-900 dark:text-white font-bold">{classData.session}</span>
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
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-2 overflow-hidden mb-8">
            <CustomTabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {loading ? (
              <TabSkeleton tabId={activeTab} />
            ) : (
              tabs.find(t => t.id === activeTab)?.content
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
