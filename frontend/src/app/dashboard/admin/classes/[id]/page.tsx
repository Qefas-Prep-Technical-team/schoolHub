'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, UserCog, AlertTriangle, QrCode } from 'lucide-react';
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

import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useSingleClass, useClassBehaviourAlerts } from '@/lib/api/hooks/useClasses';

export default function ClassDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const { data: classData, isLoading: loading, error } = useSingleClass(id);
  const { data: realBehaviourAlerts = [] } = useClassBehaviourAlerts(id);
  const [activeTab, setActiveTab] = React.useState("tab1");
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

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

  const tabs = [
    { 
      id: "tab1", 
      label: "Overview", 
      content: <Overview behaviourAlerts={behaviourAlerts} upcomingExams={upcomingExams} classData={classData} />
    },
    { 
      id: 'students', 
      label: 'Students', 
      content: <ClassStudentsPage enrollments={classData?.enrollments || []} />  
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
      content: <TimetablePage />  
    },
    { 
      id: 'exams', 
      label: 'Exams' , 
      content: <ClassExamsPage exams={(classData as any)?.exams || []} /> 
    },
    { 
      id: 'attendance', 
      label: 'Attendance' , 
      content: <ClassAttendancePage /> 
    },
  ]

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Loading class details...</p>
        </div>
      </div>
    );
  }

  if (!classData) {
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
        <div className="mx-auto max-w-7xl">
          {/* Page Heading & Button Group */}
          <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
            <div className="flex flex-col gap-1">
              <p className="text-gray-900 dark:text-white text-4xl font-black leading-tight tracking-tight">
                {classData.name} {classData.section ? `- ${classData.section}` : ""}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-500 dark:text-gray-400 text-sm font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                   Code: <span className="text-gray-900 dark:text-white font-bold">{classData.classCode}</span>
                </span>
                <span>|</span>
                <span>
                  Teachers: <span className="text-gray-900 dark:text-white font-bold">
                    {classData.teachers && classData.teachers.length > 0 
                      ? classData.teachers.map((t: any) => t.teacher.name).join(', ') 
                      : "Not Assigned"}
                  </span>
                </span>
                <span>|</span>
                <span>Students: <span className="text-gray-900 dark:text-white font-bold">{classData._count?.enrollments ?? classData.enrollments?.length ?? 0}</span></span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => setIsQRModalOpen(true)}
                className="flex items-center justify-center gap-2 rounded-xl h-11 px-6 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm font-bold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95"
              >
                <QrCode size={18} />
                <span>QR Access</span>
              </button>
              
              <button className="flex items-center justify-center gap-2 rounded-xl h-11 px-6 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm font-bold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95">
                <Calendar size={18} />
                <span>Timetable</span>
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-2 overflow-hidden mb-8">
            <CustomTabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
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
    </div>
  );
}