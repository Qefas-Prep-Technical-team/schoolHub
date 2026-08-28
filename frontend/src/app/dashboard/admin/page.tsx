'use client';

import { useState } from 'react';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useSchoolStats, useSchoolPerformanceAnalysis, useSchoolSettings } from '@/lib/api/hooks/useSchool';
import { useFeatureAccess } from '@/lib/api/hooks/useFeatureAccess';
import { Users, GraduationCap, CheckCircle2, CreditCard, ClipboardList } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import AdminLoading from './loading';

// Existing Dashboard Components (to be restyled)
import ExamStatus from './components/dashboard/ExamStatus';
import StaffInsights from './components/dashboard/StaffInsights';
import AlertsPanel from './components/dashboard/AlertsPanel';
import RecentActivity from './components/dashboard/RecentActivity';
import QuickActions from './components/dashboard/QuickActions';
import UsageLimitsCard from '@/components/subscription/UsageLimitsCard';

// Charts
import DashboardCharts from './components/dashboard/DashboardCharts';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  const schoolName = user?.schools?.[0]?.name || user?.name || 'Future Academy';
  const userName = user?.name || 'Admin';

  const { data: stats, isLoading: statsLoading } = useSchoolStats(schoolId);
  const { data: settings } = useSchoolSettings(schoolId);
  const primaryColor = settings?.themeColor || '#2563eb';

  const aiInsightsFeatureKey = process.env.NEXT_PUBLIC_FEATURE_KEY_AI_INSIGHTS || 'aiInsights';
  const { data: hasPerformanceAccess, isLoading: checkingAccess } = useFeatureAccess(aiInsightsFeatureKey, schoolId);
  const { data: analysis, isLoading: analysisLoading } = useSchoolPerformanceAnalysis(schoolId, stats, { enabled: !!hasPerformanceAccess });

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
  const currentTerm = 'Term 1'; // In a real app, fetch from school settings
  const currentSession = '2025-26';

  if (statsLoading || checkingAccess) {
      return <AdminLoading />;
  }

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">

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
                        <button className="bg-white text-slate-900 hover:bg-slate-50 px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm transition-all">
                            View weekly report
                        </button>
                        <button className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-full text-sm font-semibold transition-all">
                            Announce
                        </button>
                    </div>
                </div>
            </div>

            {/* Today at a Glance */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm flex flex-col justify-center">
                <div className="mb-6">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Today at a glance</h3>
                    <p className="text-xs text-slate-500">Live operations summary</p>
                </div>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            <span>Total Students</span>
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white">{stats?.students?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <GraduationCap size={16} className="text-blue-500" />
                            <span>Total Teachers</span>
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white">{stats?.teachers?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <div className="w-4 h-4 rounded bg-amber-100 text-amber-600 flex items-center justify-center text-[10px]">🏢</div>
                            <span>Total Classes</span>
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white">{stats?.classes?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <CreditCard size={16} className="text-purple-500" />
                            <span>Total Subjects</span>
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white">{stats?.subjects?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <ClipboardList size={16} className="text-slate-500" />
                            <span>Active Exams</span>
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white">{stats?.exams?.toLocaleString() || 0}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-xs text-slate-500 font-medium">Total Students</span>
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><Users size={14} /></div>
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{stats?.students?.toLocaleString() || 0}</h3>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600">Active</span>
                        <span>enrolled accounts</span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-xs text-slate-500 font-medium">Total Teachers</span>
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600"><GraduationCap size={14} /></div>
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{stats?.teachers?.toLocaleString() || 0}</h3>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600">Verified</span>
                        <span>faculty staff</span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-xs text-slate-500 font-medium">Total Classes</span>
                    <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600"><CheckCircle2 size={14} /></div>
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{stats?.classes?.toLocaleString() || 0}</h3>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600">Active</span>
                        <span>classrooms</span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-xs text-slate-500 font-medium">Total Subjects</span>
                    <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600"><CreditCard size={14} /></div>
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{stats?.subjects?.toLocaleString() || 0}</h3>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600">Curriculum</span>
                        <span>registered subjects</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Charts Section */}
        <DashboardCharts stats={stats} analysis={analysis} hasPerformanceAccess={hasPerformanceAccess} primaryColor={primaryColor} />

        {/* Remaining Old Features Integration */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
             {/* Left Column (Main Features) */}
             <div className="lg:col-span-8 space-y-6">
                <ExamStatus primaryColor={primaryColor} />
                <StaffInsights primaryColor={primaryColor} />
                <RecentActivity primaryColor={primaryColor} />
             </div>
             
             {/* Right Column (Sidebar Features) */}
             <div className="lg:col-span-4 space-y-6">
                <UsageLimitsCard primaryColor={primaryColor} />
                <QuickActions primaryColor={primaryColor} />
                <AlertsPanel primaryColor={primaryColor} />
             </div>
        </div>

      </div>
    </div>
  );
}
