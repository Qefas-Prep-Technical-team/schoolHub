'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
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
import ClassHistoryTab from './components/history/ClassHistoryTab';
import OfflineGradesDashboard from '../../offline-grades/components/OfflineGradesDashboard';
import AdminClassMaterialsTab from './components/materials/ClassMaterialsTab';
import { TabSkeleton } from './components/TabSkeleton';
import { ClassDetailsHeader } from './components/header/ClassDetailsHeader';
import { AssignedTeachersModal } from './components/header/AssignedTeachersModal';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  useSingleClass,
  useClassBehaviourAlerts,
  useChangeClassStatus,
} from '@/lib/api/hooks/useClasses';

export default function ClassDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const id = params.id as string;

  const { data: classData, isLoading: loading, error, refetch: refetchClass } = useSingleClass(id);
  const { data: realBehaviourAlerts = [] } = useClassBehaviourAlerts(id);
  const changeStatusMutation = useChangeClassStatus(id);

  const [activeTab, setActiveTab] = useState(tabParam || 'tab1');
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isTeachersModalOpen, setIsTeachersModalOpen] = useState(false);

  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Handle errors from the query hook
  useEffect(() => {
    if (error) {
      console.error('Failed to fetch class details:', error);
      let message = 'Failed to load class details';
      const serverMessage = (error as any).response?.data?.message;
      if (serverMessage) {
        if (
          typeof serverMessage === 'string' &&
          (serverMessage.includes('prisma') ||
            serverMessage.includes('\\') ||
            serverMessage.includes('/') ||
            serverMessage.includes('column'))
        ) {
          message = 'A database error occurred. Please contact support.';
        } else {
          message = serverMessage;
        }
      }
      toast.error(message);
    }
  }, [error]);

  const handleToggleLock = () => {
    const isCurrentlyLocked =
      classData?.status === 'ARCHIVED' ||
      classData?.status === 'LOCKED' ||
      Boolean(classData?.isLocked);
    const newStatus = isCurrentlyLocked ? 'ACTIVE' : 'ARCHIVED';

    changeStatusMutation.mutate(newStatus, {
      onSuccess: () => {
        toast.success(
          newStatus === 'ARCHIVED'
            ? 'Class locked successfully. New students can no longer join.'
            : 'Class unlocked successfully. Students can now join.'
        );
        refetchClass();
      },
      onError: (err: any) => {
        const msg =
          err?.response?.data?.message || err?.message || 'Failed to update class lock status';
        toast.error(msg);
      },
    });
  };

  const behaviourAlerts = useMemo(
    () =>
      realBehaviourAlerts.map((alert: any) => ({
        id: alert.id,
        type: alert.type.toLowerCase() as 'warning' | 'danger',
        title: alert.title,
        description: alert.description || '',
        student: alert.student?.name || 'Unknown',
        reportedBy: alert.reporter?.name || 'System',
      })),
    [realBehaviourAlerts]
  );

  const upcomingExams = useMemo(() => {
    if (!classData?.exams || !Array.isArray(classData.exams)) return [];
    const now = new Date();

    return classData.exams
      .filter((e: any) => {
        if (!e) return false;
        if (e.status === 'ARCHIVED' || e.status === 'DRAFT') return false;
        if (e.endDate && new Date(e.endDate) < now) return false;
        return true;
      })
      .map((e: any) => {
        const subjectName =
          e.subject?.name ||
          e.subjectExamPapers?.[0]?.subjectPaper?.subject?.name ||
          e.title ||
          'General';

        let displayDate = 'TBA';
        const targetDate = e.startDate
          ? new Date(e.startDate)
          : e.endDate
          ? new Date(e.endDate)
          : null;
        if (targetDate && !isNaN(targetDate.getTime())) {
          displayDate = targetDate.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
        } else if (e.createdAt) {
          const cDate = new Date(e.createdAt);
          if (!isNaN(cDate.getTime())) {
            displayDate = cDate.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
          }
        }

        return {
          id: e.id,
          title: e.title || subjectName,
          subject: subjectName,
          date: displayDate,
          rawDate: targetDate || (e.createdAt ? new Date(e.createdAt) : null),
          type: e.category || e.type || 'EXAM',
          scope: e.scope || 'CLASS',
          status: e.status || 'PUBLISHED',
          totalMarks: e.totalMarks,
          durationMinutes: e.durationMinutes,
        };
      })
      .sort((a: any, b: any) => {
        if (!a.rawDate) return 1;
        if (!b.rawDate) return -1;
        return a.rawDate.getTime() - b.rawDate.getTime();
      })
      .slice(0, 5);
  }, [classData]);

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Classes', href: '/dashboard/admin/classes' },
    { label: 'Class Details' },
  ];

  const tabs = [
    {
      id: 'tab1',
      label: 'Overview',
      content: (
        <Overview
          behaviourAlerts={behaviourAlerts}
          upcomingExams={upcomingExams}
          classData={classData}
        />
      ),
    },
    {
      id: 'students',
      label: 'Students',
      content: (
        <ClassStudentsPage
          enrollments={classData?.enrollments || []}
          classData={classData}
        />
      ),
    },
    {
      id: 'subjects',
      label: 'Subjects',
      content: (
        <ClassSubjectsPage
          classSubjects={classData?.subjects || []}
          className={classData?.name}
          classId={id}
          classData={classData}
        />
      ),
    },
    {
      id: 'teachers',
      label: 'Teachers',
      content: (
        <TeachersTab
          teachers={classData?.teachers || []}
          classData={classData}
          className={classData?.name}
        />
      ),
    },
    {
      id: 'timetable',
      label: 'Timetable',
      content: (
        <TimetablePage
          classData={classData}
          onNavigateToAttendance={() => setActiveTab('attendance')}
        />
      ),
    },
    {
      id: 'exams',
      label: 'Exams',
      content: (
        <ClassExamsPage
          exams={(classData as any)?.exams || []}
          classData={classData}
          onRefresh={refetchClass}
        />
      ),
    },
    {
      id: 'materials',
      label: 'Materials',
      content: (
        <AdminClassMaterialsTab
          classData={classData}
          classId={id}
          onRefresh={refetchClass}
        />
      ),
    },
    {
      id: 'offline-grades',
      label: 'Offline Grades',
      content: <OfflineGradesDashboard defaultClassId={id} hideClassFilter={true} />,
    },
    {
      id: 'attendance',
      label: 'Attendance',
      content: <ClassAttendancePage classData={classData} />,
    },
    {
      id: 'results',
      label: 'Final Results',
      content: <FinalResultsTab classId={id} />,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      content: <AnalyticsTab classId={id} classNameLabel={classData?.name} />,
    },
    {
      id: 'history',
      label: 'Class History',
      content: <ClassHistoryTab classId={id} classData={classData} />,
    },
  ];

  if (!classData && !loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md border border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-red-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Class Not Found
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">
            The class you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
          </p>
          <button
            onClick={() => router.push('/dashboard/admin/classes')}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 dark:shadow-none transition-all active:scale-95 cursor-pointer"
          >
            Back to Classes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full bg-slate-50/60 dark:bg-slate-950 overflow-x-hidden">
      <main className="flex-1 p-3 sm:p-6 md:p-8 w-full max-w-full">
        <div className="w-full">
          <div className="mb-3 sm:mb-4">
            <Breadcrumbs items={breadcrumbItems} />
          </div>

          <ClassDetailsHeader
            loading={loading}
            classData={classData}
            onOpenQR={() => setIsQRModalOpen(true)}
            onOpenManage={() => setIsManageModalOpen(false || true)}
            onOpenTeachers={() => setIsTeachersModalOpen(true)}
            onToggleLock={handleToggleLock}
            isTogglingLock={changeStatusMutation.isPending}
          />

          {/* Tabs Navigation */}
          <div className="mb-6 md:mb-8 w-full overflow-x-auto no-scrollbar pb-1">
            <CustomTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {loading ? (
              <TabSkeleton tabId={activeTab} />
            ) : (
              tabs.find((t) => t.id === activeTab)?.content
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

      <AssignedTeachersModal
        isOpen={isTeachersModalOpen}
        onClose={() => setIsTeachersModalOpen(false)}
        teachers={classData?.teachers || []}
      />
    </div>
  );
}
