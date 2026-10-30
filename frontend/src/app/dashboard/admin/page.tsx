'use client';

import { useState } from 'react';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useSchoolStats, useSchoolPerformanceAnalysis, useSchoolSettings, useSchoolProfile } from '@/lib/api/hooks/useSchool';
import { useClasses } from '@/lib/api/hooks/useClasses';
import { useFeatureAccess } from '@/lib/api/hooks/useFeatureAccess';
import AdminLoading from './loading';

// Dashboard Components
import ExamStatus from './components/dashboard/ExamStatus';
import StaffInsights from './components/dashboard/StaffInsights';
import AlertsPanel from './components/dashboard/AlertsPanel';
import RecentActivity from './components/dashboard/RecentActivity';
import QuickActions from './components/dashboard/QuickActions';
import UsageLimitsCard from '@/components/subscription/UsageLimitsCard';
import AdminTodayGlance from './components/dashboard/AdminTodayGlance';
import AdminStatsGrid from './components/dashboard/AdminStatsGrid';

// Charts & Modals
import DashboardCharts from './components/dashboard/DashboardCharts';
import AdminAnnouncementModal, { ClassItem } from './components/dashboard/AdminAnnouncementModal';
import AdminWeeklyReportModal from './components/dashboard/AdminWeeklyReportModal';
import AdminFinanceCard from './components/dashboard/AdminFinanceCard';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  const schoolName = user?.schools?.[0]?.name || user?.name || 'Future Academy';
  const userName = user?.name || 'Admin';

  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [isWeeklyReportOpen, setIsWeeklyReportOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useSchoolStats(schoolId);
  const { data: schoolProfile } = useSchoolProfile(schoolId);
  const { data: rawClasses = [] } = useClasses(schoolId);

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

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
  const currentTerm = 'Term 1';
  const currentSession = '2025-26';

  if (statsLoading || checkingAccess) {
    return <AdminLoading />;
  }

  return (
    <div className="min-h-screen bg-transparent py-4 md:py-6 lg:py-8">
      <div className="w-[95%] max-w-none mx-auto space-y-6">

        {/* Header Section */}
        <div>
          <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-1">{today}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Good morning, {userName} <span className="text-xl">👋</span>
          </h1>
        </div>

        {/* Top Hero & Glance Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hero Banner */}
          <div className="lg:col-span-2 relative overflow-hidden rounded-[2rem] bg-slate-900 shadow-sm">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
            
            <div className="relative z-10 p-8 h-full flex flex-col justify-end min-h-[280px]">
              <div className="inline-flex items-center bg-white/20 backdrop-blur-md rounded-full px-3 py-1 mb-4 w-fit">
                <span className="text-xs font-semibold text-white tracking-wide">{currentTerm} • {currentSession}</span>
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome back to {schoolName}</h2>
              <p className="text-slate-200 text-sm max-w-xl mb-6 leading-relaxed">
                {analysis?.insight || "System running smoothly. All services are fully operational."}
              </p>
              
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => setIsWeeklyReportOpen(true)}
                  className="bg-white text-slate-900 hover:bg-slate-50 px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  View weekly report
                </button>
                <button 
                  type="button"
                  onClick={() => setIsAnnouncementOpen(true)}
                  className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  Announce
                </button>
              </div>
            </div>
          </div>

          {/* Today at a Glance Subcomponent */}
          <AdminTodayGlance stats={stats} />
        </div>

        {/* 4 Stat Cards Subcomponent */}
        <AdminStatsGrid stats={stats} />

        {/* Charts Section */}
        <DashboardCharts stats={stats} analysis={analysis} hasPerformanceAccess={hasPerformanceAccess} primaryColor={primaryColor} />

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
            <AdminFinanceCard schoolId={schoolId} primaryColor={primaryColor} />
            <UsageLimitsCard primaryColor={primaryColor} />
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

      </div>
    </div>
  );
}
