'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useSchoolStats, useSchoolPerformanceAnalysis, useSchoolSettings, useSchoolProfile } from '@/lib/api/hooks/useSchool';
import { useClasses } from '@/lib/api/hooks/useClasses';
import { useFeatureAccess } from '@/lib/api/hooks/useFeatureAccess';
import AdminDashboardSkeleton from './components/dashboard/AdminDashboardSkeleton';
import ClassModal from './classes/components/ClassModal';
import { Class } from './classes/services/classService';
import {
  SchoolAcademicSetupWizardModal,
  getSetupWizardStorageKeys,
} from './classes/components/setup-wizard/SchoolAcademicSetupWizardModal';

// Dashboard Components
import ExamStatus from './components/dashboard/ExamStatus';
import StaffInsights from './components/dashboard/StaffInsights';
import AlertsPanel from './components/dashboard/AlertsPanel';
import RecentActivity from './components/dashboard/RecentActivity';
import QuickActions from './components/dashboard/QuickActions';
import UsageLimitsCard from '@/components/subscription/UsageLimitsCard';
import AdminTodayGlance from './components/dashboard/AdminTodayGlance';
import AdminStatsGrid from './components/dashboard/AdminStatsGrid';
import AdminHeroBanner from './components/dashboard/AdminHeroBanner';

// Charts & Modals
import DashboardCharts from './components/dashboard/DashboardCharts';
import AdminAnnouncementModal, { ClassItem } from './components/dashboard/AdminAnnouncementModal';
import AdminWeeklyReportModal from './components/dashboard/AdminWeeklyReportModal';
import AdminFinanceCard from './components/dashboard/AdminFinanceCard';
import { AdminRole, canAdminRoleAccessFeature } from './components/adminFeatureFlags';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const userSchools = (user as any)?.schools as Array<any> | undefined;
  const schoolId = userSchools?.[0]?.schoolId || (user as any)?.schoolId || user?.tenantId || '';
  const { data: stats, isLoading: statsLoading } = useSchoolStats(schoolId);
  const { data: schoolProfile, isLoading: profileLoading } = useSchoolProfile(schoolId);
  const schoolName = schoolProfile?.name || userSchools?.[0]?.name || userSchools?.[0]?.schoolName || (user as any)?.tenant?.name || 'Future Academy';
  const userName = user?.name || 'Admin';
  const adminRole = (user?.adminRole || user?.role) as AdminRole | undefined;
  const canViewFinance = canAdminRoleAccessFeature(adminRole, 'finance');
  const canViewBilling = canAdminRoleAccessFeature(adminRole, 'billing');
  const canManageSchoolSetup = canAdminRoleAccessFeature(adminRole, 'schoolProfile');

  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [isWeeklyReportOpen, setIsWeeklyReportOpen] = useState(false);
  const [isSetupWizardOpen, setIsSetupWizardOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const { data: rawClasses = [], refetch: refetchClasses } = useClasses(schoolId);

  // Auto-open the 5-step School Setup Wizard on /dashboard/admin strictly for authorized school setup admins
  // and only when the database `schoolProfile.profileCompleted` is false (plus localStorage fallback).
  useEffect(() => {
    if (typeof window === 'undefined' || !schoolId || profileLoading || !schoolProfile) return;
    if (!canManageSchoolSetup) return;

    const { savedKey, dismissedKey } = getSetupWizardStorageKeys(schoolId);
    const hasCompletedInDb = Boolean(schoolProfile.profileCompleted);
    const hasSavedLocally = localStorage.getItem(savedKey) === 'true';
    const hasDismissedLocally = localStorage.getItem(dismissedKey) === 'true';

    if (!hasCompletedInDb && !hasSavedLocally && !hasDismissedLocally) {
      setIsSetupWizardOpen(true);
    }
  }, [schoolId, profileLoading, schoolProfile, canManageSchoolSetup]);

  const classesList: ClassItem[] = Array.isArray(rawClasses)
    ? rawClasses.map((c: { id: string; name: string; section?: string; _count?: { enrollments?: number }; studentCount?: number; classCode?: string }) => ({
      id: c.id,
      name: c.name,
      section: c.section,
      studentCount: c._count?.enrollments || c.studentCount || 0,
      classCode: c.classCode,
    }))
    : [];
  const { data: settings } = useSchoolSettings(schoolId);
  const primaryColor = settings?.themeColor || '#2563eb';

  const aiInsightsFeatureKey = process.env.NEXT_PUBLIC_FEATURE_KEY_AI_INSIGHTS || 'aiInsights';
  const { data: hasPerformanceAccess, isLoading: checkingAccess } = useFeatureAccess(aiInsightsFeatureKey, schoolId);
  const { data: analysis } = useSchoolPerformanceAnalysis(schoolId, stats, { enabled: !!hasPerformanceAccess });

  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const currentHour = now.getHours();
  const timeOfDayGreeting =
    currentHour >= 5 && currentHour < 12
      ? 'Good morning'
      : currentHour >= 12 && currentHour < 17
        ? 'Good afternoon'
        : currentHour >= 17 && currentHour < 21
          ? 'Good evening'
          : 'Good night';

  const today = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
  const currentTerm = 'Term 1';
  const currentSession = '2025-26';

  if (statsLoading || checkingAccess) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-transparent py-4 md:py-6 lg:py-8">
      <div className="w-[95%] max-w-none mx-auto space-y-6">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-1">{today}</p>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {timeOfDayGreeting}, {userName} <span className="text-xl">👋</span>
            </h1>
          </div>

          {canManageSchoolSetup && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSetupWizardOpen(true)}
              className="h-10 px-4 rounded-xl text-xs font-bold border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 bg-indigo-50/60 hover:bg-indigo-100/70 dark:bg-indigo-950/30 flex items-center gap-2 transition-all self-start sm:self-auto"
            >
              <Sparkles size={15} className="text-indigo-600 dark:text-indigo-400" />
              School Setup Guide
            </Button>
          )}
        </div>

        {/* Top Hero & Glance Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Hero Banner Subcomponent */}
          <div className="lg:col-span-2">
            <AdminHeroBanner
              schoolName={schoolName}
              adminName={userName}
              currentTerm={currentTerm}
              currentSession={currentSession}
              analysis={analysis}
              onOpenWeeklyReport={() => setIsWeeklyReportOpen(true)}
              onOpenAnnouncement={() => setIsAnnouncementOpen(true)}
            />
          </div>

          {/* Today at a Glance Subcomponent */}
          <div className="lg:col-span-1 flex flex-col">
            <AdminTodayGlance stats={stats} />
          </div>
        </div>

        {/* 4 Stat Cards Subcomponent */}
        <AdminStatsGrid stats={stats} />

        {/* Charts Section */}
        <DashboardCharts schoolId={schoolId} stats={stats} analysis={analysis} hasPerformanceAccess={hasPerformanceAccess} primaryColor={primaryColor} />

        {/* Dashboard Operational Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
          {/* Left Column (Main Features) */}
          <div className="lg:col-span-8 space-y-6">
            <ExamStatus primaryColor={primaryColor} />
            <StaffInsights primaryColor={primaryColor} />
            <RecentActivity primaryColor={primaryColor} />
          </div>

          {/* Right Column (Sidebar Features) */}
          <div className="lg:col-span-4 space-y-6">
            {canViewFinance && <AdminFinanceCard schoolId={schoolId} primaryColor={primaryColor} />}
            {canViewBilling && <UsageLimitsCard primaryColor={primaryColor} />}
            <QuickActions primaryColor={primaryColor} />
            <AlertsPanel primaryColor={primaryColor} />
          </div>
        </div>

        {/* Modals for Hero Banner Actions */}
        <AdminAnnouncementModal
          isOpen={isAnnouncementOpen}
          onClose={() => setIsAnnouncementOpen(false)}
          classes={classesList}
          schoolName={schoolName}
        />

        <AdminWeeklyReportModal
          isOpen={isWeeklyReportOpen}
          onClose={() => setIsWeeklyReportOpen(false)}
          stats={stats}
          analysis={analysis}
          classes={classesList}
          schoolName={schoolName}
          adminName={userName}
          currentTerm={currentTerm}
          currentSession={currentSession}
          schoolProfile={schoolProfile}
        />

        {canManageSchoolSetup && (
          <SchoolAcademicSetupWizardModal
            isOpen={isSetupWizardOpen}
            onClose={() => setIsSetupWizardOpen(false)}
            schoolId={schoolId}
            existingClasses={(rawClasses as Class[]) || []}
            onClassesUpdated={refetchClasses}
            onOpenFullClassModal={() => setIsClassModalOpen(true)}
          />
        )}

        <ClassModal
          isOpen={isClassModalOpen}
          onClose={() => setIsClassModalOpen(false)}
          onSuccess={refetchClasses}
          classItem={null}
          schoolId={schoolId}
        />

      </div>
    </div>
  );
}
