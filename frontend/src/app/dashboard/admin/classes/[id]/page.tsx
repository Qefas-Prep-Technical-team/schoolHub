'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, UserCog, AlertTriangle, QrCode, X } from 'lucide-react';
import CustomTabs from './components/Tabs';
import Overview from './components/Overview';
import TimetablePage from './components/timetable/TimetableTab';
import ClassStudentsPage from './components/students/StudentsTab';
import ClassSubjectsPage from './components/subjects/SubjectsTab';
import ClassExamsPage from './components/exams/ExamsTab';
import ClassAttendancePage from './components/attendance/AttendanceTab';
import ManageClassModal from './components/ManageClassModal';
import ClassQRCodeModal from './components/ClassQRCodeModal';
import TeachersTab from './components/TeachersTab';
import Breadcrumbs from './components/students/components/Breadcrumbs';

import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useSingleClass, useClassBehaviourAlerts } from '@/lib/api/hooks/useClasses';

const TabSkeleton = ({ tabId }: { tabId: string }) => {
  if (tabId === "tab1") {
    // Overview Skeleton
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        <div className="col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-150 dark:border-gray-700 space-y-4 shadow-sm">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-150 dark:border-gray-700 space-y-4 shadow-sm">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-gray-100 dark:bg-gray-700 rounded-xl" />
              <div className="h-20 bg-gray-100 dark:bg-gray-700 rounded-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-150 dark:border-gray-700 space-y-4 h-96 shadow-sm">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (tabId === "students" || tabId === "exams") {
    // List/Table Skeleton
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700 p-6 space-y-4 shadow-sm animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/6" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 py-3 last:border-b-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="space-y-1.5">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                </div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tabId === "subjects" || tabId === "teachers") {
    // Grid Skeleton
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-150 dark:border-gray-700 space-y-4 shadow-sm">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            <div className="flex items-center gap-2 pt-2">
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tabId === "timetable") {
    // Grid skeleton mirroring TimetableGrid
    return (
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-[#364563] bg-white dark:bg-[#1b2232] animate-pulse">
        <div className="grid" style={{ gridTemplateColumns: `minmax(120px, 1fr) repeat(5, minmax(200px, 1fr))` }}>
          <div className="p-4 border-b border-r border-gray-200 dark:border-[#364563] bg-slate-50 dark:bg-slate-900/50">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16" />
          </div>
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
            <div key={day} className="p-4 border-b border-r border-gray-200 dark:border-[#364563] last:border-r-0 bg-slate-50 dark:bg-slate-900/50">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" />
            </div>
          ))}
          {[1, 2, 3, 4, 5].map((rowIdx) => (
            <React.Fragment key={rowIdx}>
              <div className="p-4 flex items-center justify-center border-b border-r border-gray-200 dark:border-[#364563] bg-slate-50/50 dark:bg-slate-900/10">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" />
              </div>
              {[1, 2, 3, 4, 5].map((_, dayIdx) => (
                <div key={dayIdx} className="p-4 border-b border-r border-gray-200 dark:border-[#364563] last:border-r-0">
                  <div className="h-16 rounded-lg border-2 border-dashed border-slate-100 dark:border-slate-800/50 bg-slate-50/20 dark:bg-slate-900/10" />
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  if (tabId === "attendance") {
    // Attendance Matrix Skeleton
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700 p-6 space-y-4 shadow-sm animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32" />
        </div>
        <div className="border border-gray-150 dark:border-[#364563] rounded-xl overflow-hidden">
          <div className="grid grid-cols-4 bg-gray-50 dark:bg-slate-900/50 p-4 border-b border-gray-150 dark:border-[#364563]">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="grid grid-cols-4 p-4 border-b border-gray-100 dark:border-[#364563]/30 last:border-b-0">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-36" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default function ClassDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const { data: classData, isLoading: loading, error } = useSingleClass(id);
  const { data: realBehaviourAlerts = [] } = useClassBehaviourAlerts(id);
  const [activeTab, setActiveTab] = React.useState("tab1");
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isTeachersModalOpen, setIsTeachersModalOpen] = useState(false);

  // Handle errors from the hook
  useEffect(() => {
    if (error) {
      console.error("Failed to fetch class details:", error);
      let message = "Failed to load class details";
      
      const serverMessage = (error as any).response?.data?.message;
      if (serverMessage) {
        // Sanitize technical errors
        if (typeof serverMessage === 'string' && (
          serverMessage.includes('prisma') || 
          serverMessage.includes('\\') || 
          serverMessage.includes('/') ||
          serverMessage.includes('column')
        )) {
          message = "A database error occurred. Please contact support.";
        } else {
          message = serverMessage;
        }
      }
      
      toast.error(message);
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

   const upcomingExams = [
     {
       id: '1',
       subject: 'Biology',
       date: '25 Oct 2024',
       type: 'Mid-term',
     },
     {
       id: '2',
       subject: 'Mathematics',
       date: '28 Oct 2024',
       type: 'Quiz',
     },
   ];

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Classes', href: '/dashboard/admin/classes' },
    { label: 'Class Details' }
  ];

  const tabs = [
    { 
      id: "tab1", 
      label: "Overview", 
      content: <Overview behaviourAlerts={behaviourAlerts} upcomingExams={upcomingExams} classData={classData} />
    },
    { 
      id: 'students', 
      label: 'Students', 
      content: <ClassStudentsPage enrollments={classData?.enrollments || []} classData={classData} />  
    },
    { 
      id: 'subjects', 
      label: 'Subjects' , 
      content: <ClassSubjectsPage classSubjects={classData?.subjects || []} className={classData?.name} classId={id} /> 
    },
    {
      id: 'teachers',
      label: 'Teachers',
      content: <TeachersTab teachers={classData?.teachers || []} />
    },
    { 
      id: 'timetable', 
      label: 'Timetable', 
      content: <TimetablePage classData={classData} onNavigateToAttendance={() => setActiveTab('attendance')} />  
    },
    { 
      id: 'exams', 
      label: 'Exams' , 
      content: <ClassExamsPage exams={(classData as any)?.exams || []} classData={classData} /> 
    },
    { 
      id: 'attendance', 
      label: 'Attendance' , 
      content: <ClassAttendancePage classData={classData} /> 
    },
  ]

  // Removed early-return on loading to support tab-specific loading skeleton

  if (!classData && !loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md border border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-red-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Class Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">
            The class you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <button 
            onClick={() => router.push('/dashboard/admin/classes')}
            className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
          >
            Back to Classes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full bg-gray-50 dark:bg-gray-900">
      <main className="flex-1 p-8">
        <div className="w-full">
          <div className="mb-4">
            <Breadcrumbs items={breadcrumbItems} />
          </div>
          {/* Page Heading & Button Group */}
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
                      Teachers: <span className="inline-block h-3.5 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                    </span>
                    <span>|</span>
                    <span className="animate-pulse">
                      Students: <span className="inline-block h-3.5 w-8 bg-slate-200 dark:bg-slate-800 rounded" />
                    </span>
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
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
                    <span>|</span>
                    <span>
                      Teachers:{" "}
                      {(() => {
                        const teachers = classData?.teachers || [];
                        if (teachers.length > 2) {
                          return (
                            <button
                              onClick={() => setIsTeachersModalOpen(true)}
                              className="text-primary hover:underline font-bold focus:outline-none transition-colors align-baseline"
                              title="View all assigned teachers"
                            >
                              {teachers.slice(0, 2).map((t: any) => t.teacher?.name).join(', ')} ...
                            </button>
                          );
                        }
                        return (
                          <span className="text-gray-900 dark:text-white font-bold">
                            {teachers.length > 0
                              ? teachers.map((t: any) => t.teacher?.name).join(', ')
                              : "Not Assigned"}
                          </span>
                        );
                      })()}
                    </span>
                    <span>|</span>
                    <span>Students: <span className="text-gray-900 dark:text-white font-bold">{classData?._count?.enrollments ?? classData?.enrollments?.length ?? 0}</span></span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => setIsQRModalOpen(true)}
                className="flex items-center justify-center gap-2 rounded-xl h-11 px-6 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-sm font-bold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95 shadow-sm"
              >
                <QrCode size={18} />
                <span>QR Access</span>
              </button>
              
              <button 
                onClick={() => setIsManageModalOpen(true)}
                className="flex items-center justify-center gap-2 rounded-xl h-11 px-6 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
              >
                <UserCog size={18} />
                <span>Manage Class</span>
              </button>
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

      <ManageClassModal 
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        classData={classData}
      />

      <ClassQRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        classData={classData}
      />

      {/* Assigned Teachers modal for more than 2 teachers */}
      {isTeachersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#1b2232] border border-gray-200 dark:border-[#364563] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden transition-all duration-300 transform scale-100">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#364563] bg-slate-50/50 dark:bg-slate-900/10">
              <h3 className="text-lg font-bold text-gray-950 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                Assigned Teachers
              </h3>
              <button 
                onClick={() => setIsTeachersModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-650 hover:bg-gray-105 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 max-h-[300px] overflow-y-auto space-y-3">
              {(classData?.teachers || []).map((t: any, index: number) => (
                <div 
                  key={t.teacher?.id || index}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-gray-150 dark:border-[#364563]/60 bg-gray-50/30 dark:bg-slate-900/5 hover:border-primary/30 transition-all"
                >
                  <div className="flex flex-col gap-0.5">
                    <p className="font-bold text-gray-950 dark:text-white text-sm">
                      {t.teacher?.name || "Staff Member"}
                    </p>
                    {t.teacher?.email && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t.teacher.email}
                      </p>
                    )}
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                    t.isLead 
                      ? 'bg-blue-500/10 text-blue-500 dark:bg-blue-400/10 dark:text-blue-400' 
                      : 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-400/10 dark:text-emerald-400'
                  }`}>
                    {t.isLead ? "Lead" : "Assistant"}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-[#364563] bg-slate-50/50 dark:bg-slate-900/10 flex justify-end">
              <button
                onClick={() => setIsTeachersModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-800 dark:text-gray-200 bg-gray-105 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}