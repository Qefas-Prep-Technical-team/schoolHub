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
import FinalResultsTab from './components/results/FinalResultsTab';
import ManageClassModal from './components/ManageClassModal';
import ClassQRCodeModal from './components/ClassQRCodeModal';
import TeachersTab from './components/TeachersTab';
import Breadcrumbs from './components/students/components/Breadcrumbs';
import AnalyticsTab from './components/analytics/AnalyticsTab';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useSingleClass, useClassBehaviourAlerts } from '@/lib/api/hooks/useClasses';
import { useSessions } from '@/lib/api/hooks/useSessions';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';

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
  const { user } = useAuthStore();
  const activeSchoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  const { data: sessionsData } = useSessions(activeSchoolId);
  const sessions = Array.isArray(sessionsData?.data) ? sessionsData.data : (Array.isArray(sessionsData) ? sessionsData : []);

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

  const upcomingExams = React.useMemo(() => {
    if (!classData?.exams || !Array.isArray(classData.exams)) return [];
    
    return classData.exams
      .filter((e: any) => e.status !== 'ARCHIVED' && e.status !== 'DRAFT')
      .map((e: any) => ({
        id: e.id,
        subject: e.subject?.name || e.title || 'General',
        date: e.startDate 
          ? new Date(e.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) 
          : (e.createdAt 
              ? new Date(e.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) 
              : 'TBA'),
        type: e.type || e.scope || 'Exam',
      }))
      .slice(0, 3);
  }, [classData]);

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
      content: <ClassSubjectsPage classSubjects={classData?.subjects || []} className={classData?.name} classId={id} classData={classData} /> 
    },
    {
      id: 'teachers',
      label: 'Teachers',
      content: <TeachersTab teachers={classData?.teachers || []} classData={classData} className={classData?.name} />
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
    { 
      id: 'results', 
      label: 'Final Results' , 
      content: <FinalResultsTab classId={id} /> 
    },
    {
      id: 'analytics',
      label: 'Analytics',
      content: <AnalyticsTab classId={id} classNameLabel={classData?.name} />
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
    <div className="relative flex min-h-screen w-full bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <main className="flex-1 p-4 md:p-8 w-full max-w-full">
        <div className="w-full">
          <div className="mb-4">
            <Breadcrumbs items={breadcrumbItems} />
          </div>
          {/* New Page Header Layout */}
          <div className="bg-white dark:bg-[#1b2232] rounded-3xl p-6 md:p-8 mb-8 border border-gray-150 dark:border-[#364563] shadow-sm flex flex-col md:flex-row gap-8 justify-between items-start md:items-center relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col gap-2 z-10">
              {loading ? (
                <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl border border-primary/20">
                    {classData?.name?.charAt(0) || "C"}
                  </div>
                  <div>
                    <h1 className="text-gray-900 dark:text-white text-3xl font-black tracking-tight">
                      {classData?.name} {classData?.section ? <span className="text-primary">{classData.section}</span> : ""}
                    </h1>
                    <div className="text-gray-500 dark:text-gray-400 mt-1.5 font-medium flex items-center gap-3 text-sm">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> Active Class
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                      <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                        Code: {classData?.classCode}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-5 sm:gap-8 w-full md:w-auto z-10 items-start sm:items-center">
               <div className="flex items-center gap-6 sm:gap-8 w-full sm:w-auto justify-start">
                 {/* Quick Stats */}
                 <div className="flex flex-col gap-1">
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Students</span>
                   <span className="text-2xl font-black text-gray-900 dark:text-white">
                     {loading ? "..." : (classData?._count?.enrollments ?? classData?.enrollments?.length ?? 0)}
                   </span>
                 </div>
                 
                 <div className="w-px h-10 bg-gray-200 dark:bg-[#364563]" />
                 
                 <div className="flex flex-col gap-1">
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Teachers</span>
                   <span className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                     {loading ? "..." : (classData?.teachers?.length || 0)}
                     {classData?.teachers?.length > 0 && (
                       <button
                          onClick={() => setIsTeachersModalOpen(true)}
                          className="text-primary hover:underline text-xs font-bold transition-colors align-middle"
                          title="View all assigned teachers"
                        >
                          View
                        </button>
                     )}
                   </span>
                 </div>
               </div>
               
               <div className="hidden sm:block w-px h-10 bg-gray-200 dark:bg-[#364563]" />
               
               <div className="flex gap-3 w-full sm:w-auto items-center mt-2 sm:mt-0">
                 <button 
                    onClick={() => setIsQRModalOpen(true)}
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 shrink-0"
                    title="QR Access"
                  >
                    <QrCode size={20} />
                  </button>
                  <button 
                    onClick={() => setIsManageModalOpen(true)}
                    className="flex-1 sm:flex-none sm:px-6 h-12 flex items-center justify-center gap-2 rounded-xl bg-primary text-white dark:text-gray-900 font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all hover:-translate-y-0.5"
                  >
                    <UserCog size={18} />
                    <span>Manage</span>
                  </button>
               </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 md:mb-8 w-full overflow-x-auto no-scrollbar pb-1">
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