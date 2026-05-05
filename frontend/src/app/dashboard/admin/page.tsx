'use client';

import { useState } from 'react';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useSchoolStats, useSchoolPerformanceAnalysis, useSchoolSettings } from '@/lib/api/hooks/useSchool';
import { Sparkles, Building2, ShieldCheck, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { motion, AnimatePresence } from 'framer-motion';

// Existing Dashboard Components
import DashboardLayout from './components/dashboard/DashboardLayout';
import AcademicChart from './components/dashboard/AcademicChart';
import AttendanceChart from './components/dashboard/AttendanceChart';
import ExamStatus from './components/dashboard/ExamStatus';
import StaffInsights from './components/dashboard/StaffInsights';
import DateControls from './components/dashboard/DateControls';
import AlertsPanel from './components/dashboard/AlertsPanel';
import RecentActivity from './components/dashboard/RecentActivity';
import QuickActions from './components/dashboard/QuickActions';
import UsageLimitsCard from './components/dashboard/UsageLimitsCard';

// New Console Components
import AdminHero from './components/dashboard/AdminHero';
import AdminInsights from './components/dashboard/AdminInsights';
import SchoolPerformance from './components/dashboard/SchoolPerformance';

export default function AdminDashboard() {
  const [session, setSession] = useState('2023/2024');
  const [term, setTerm] = useState('Second Term');

  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  const schoolName = user?.schools?.[0]?.name || 'School Management System';

  const { data: stats, isLoading: statsLoading } = useSchoolStats(schoolId);
  const { data: analysis, isLoading: analysisLoading } = useSchoolPerformanceAnalysis(schoolId, stats);
  const { data: settings } = useSchoolSettings(schoolId);
  const primaryColor = settings?.themeColor || '#2563eb'; // Default to blue-600 if not set

  return (
    <div className="min-h-screen bg-transparent">
      <main className="max-w-[1600px] mx-auto space-y-6 md:space-y-8 lg:space-y-10">
        
        {/* Institutional Identity Banner */}
        <AdminHero schoolName={schoolName} primaryColor={primaryColor} />

        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-6 md:space-y-8 lg:space-y-10"
          >
            {/* Telemetry Insights Grid */}
            <AdminInsights stats={stats} isLoading={statsLoading} primaryColor={primaryColor} />

            {/* Main Operational Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8">
              
              {/* Primary Content Area (Left, 7/8 Cols) */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-6 xl:space-y-8">
                {/* Academic Trajectory Chart */}
                <SchoolPerformance analysis={analysis} isLoading={analysisLoading} primaryColor={primaryColor} />

                {/* Sub-Metric Panels */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-8">
                  <AttendanceChart primaryColor={primaryColor} />
                  <ExamStatus primaryColor={primaryColor} />
                </div>
                
                {/* Institutional Staff Insights */}
                <StaffInsights primaryColor={primaryColor} />
              </div>

              {/* Sidebar Context Layer (Right, 5/4 Cols) */}
              <div className="lg:col-span-5 xl:col-span-4 space-y-6 xl:space-y-8 flex flex-col">
                {/* Usage Matrix Panel */}
                <UsageLimitsCard primaryColor={primaryColor} />

                {/* Quick Access Context */}
                <div className="bg-slate-900 dark:bg-slate-100 rounded-[2rem] md:rounded-[3rem] p-6 lg:p-8 xl:p-10 text-white dark:text-slate-900 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 dark:bg-slate-900/10 rounded-full blur-3xl -translate-y-20 translate-x-10 group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative z-10 space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black uppercase tracking-tighter italic">Administrative <span style={{ color: primaryColor }}>Pulse</span></h3>
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

