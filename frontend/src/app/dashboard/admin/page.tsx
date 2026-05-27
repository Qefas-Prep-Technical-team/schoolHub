'use client';

import { useState } from 'react';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useSchoolStats, useSchoolPerformanceAnalysis, useSchoolSettings } from '@/lib/api/hooks/useSchool';
import { useFeatureAccess } from '@/lib/api/hooks/useFeatureAccess';
import { Sparkles, Building2, ShieldCheck, GraduationCap, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { motion, AnimatePresence } from 'framer-motion';

// Existing Dashboard Components
import DashboardLayout from './components/dashboard/DashboardLayout';
import AcademicChart from './components/dashboard/AcademicChart';
import AttendanceChart from './components/dashboard/AttendanceChart';
import TodayAttendanceChart from './components/dashboard/TodayAttendanceChart';
import ExamStatus from './components/dashboard/ExamStatus';
import StaffInsights from './components/dashboard/StaffInsights';
import DateControls from './components/dashboard/DateControls';
import AlertsPanel from './components/dashboard/AlertsPanel';
import RecentActivity from './components/dashboard/RecentActivity';
import QuickActions from './components/dashboard/QuickActions';
import UsageLimitsCard from '@/components/subscription/UsageLimitsCard';

// New Console Components
import AdminHero from './components/dashboard/AdminHero';
import AdminInsights from './components/dashboard/AdminInsights';
import SchoolPerformance from './components/dashboard/SchoolPerformance';

export default function AdminDashboard() {
  const [session, setSession] = useState('2023/2024');
  const [term, setTerm] = useState('Second Term');

  const { user } = useAuthStore();

  // Canonical school identification
  // Prioritize the linked school UUID, fallback to tenantId for newly registered organizations
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  const schoolName = user?.schools?.[0]?.name || user?.name || 'School Management System';

  const { data: stats, isLoading: statsLoading } = useSchoolStats(schoolId);
  const { data: settings } = useSchoolSettings(schoolId);
  const primaryColor = settings?.themeColor || '#2563eb'; // Default to blue-600 if not set

  // Subscription Feature Check
  const aiInsightsFeatureKey = process.env.NEXT_PUBLIC_FEATURE_KEY_AI_INSIGHTS || 'aiInsights';
  const { data: hasPerformanceAccess, isLoading: checkingAccess } = useFeatureAccess(aiInsightsFeatureKey, schoolId);
  // console.log("has performance access", hasPerformanceAccess)

  const { data: analysis, isLoading: analysisLoading } = useSchoolPerformanceAnalysis(schoolId, stats, { enabled: !!hasPerformanceAccess });

  return (
    <div className="min-h-screen bg-transparent">
      <main className="max-w-[1600px] mx-auto space-y-6 md:space-y-8 lg:space-y-10">

        {/* School Banner */}
        <AdminHero schoolName={schoolName} primaryColor={primaryColor} />

        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-6 md:space-y-8 lg:space-y-10"
          >
            {/* School Stats Overview */}
            <AdminInsights stats={stats} isLoading={statsLoading} primaryColor={primaryColor} />

            {/* Main Operational Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8">

              {/* Primary Content Area (Left, 7/8 Cols) */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-6 xl:space-y-8">
                {/* Performance Chart */}
                <div className="relative">
                  {checkingAccess ? (
                    <Skeleton className="w-full h-64 rounded-3xl" />
                  ) : hasPerformanceAccess ? (
                    <SchoolPerformance analysis={analysis} isLoading={analysisLoading} primaryColor={primaryColor} />
                  ) : (
                    <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-sm h-64">
                      <div className="w-16 h-16 bg-white dark:bg-slate-950 rounded-full flex items-center justify-center shadow-md mb-2">
                        <Lock className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white">AI Performance Insights </h3>
                      <p className="text-sm text-slate-500 max-w-md">Upgrade your subscription plan to unlock deep AI-driven analytics and performance trends for your institution.</p>
                      <button className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full transition-colors">
                        Upgrade Plan
                      </button>
                    </div>
                  )}
                </div>

                {/* Sub-Metric Panels */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-8">
                  <TodayAttendanceChart primaryColor={primaryColor} />
                  <ExamStatus primaryColor={primaryColor} />
                </div>

                {/* Academic / Exam Performance Chart */}
                <AttendanceChart primaryColor={primaryColor} />

                {/* Staff Information */}
                <StaffInsights primaryColor={primaryColor} />
              </div>

              {/* Sidebar Context Layer (Right, 5/4 Cols) */}
              <div className="lg:col-span-5 xl:col-span-4 space-y-6 xl:space-y-8 flex flex-col">
                {/* Usage Matrix Panel */}
                <UsageLimitsCard primaryColor={primaryColor} />

                {/* Quick Access Context */}
                <div className="bg-slate-900 dark:bg-slate-950 rounded-[2rem] md:rounded-[3rem] p-6 lg:p-8 xl:p-10 text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 dark:bg-white/5 rounded-full blur-3xl -translate-y-20 translate-x-10 group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative z-10 space-y-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-black uppercase tracking-tighter italic">Dashboard <span style={{ color: primaryColor }}>Activity</span></h3>
                      <Sparkles size={24} style={{ color: primaryColor, fill: primaryColor }} />
                    </div>
                    <QuickActions primaryColor={primaryColor} />
                  </div>
                </div>

                {/* System Alerts & Telemetry */}
                <div className="space-y-6 flex-1">
                  <AlertsPanel primaryColor={primaryColor} />
                  <RecentActivity primaryColor={primaryColor} />
                </div>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

