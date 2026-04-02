'use client';

import { useState } from 'react';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useSchoolStats, useSchoolPerformanceAnalysis } from '@/lib/api/hooks/useSchool';
import { Sparkles, Building2, ShieldCheck, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
import MetricsGrid from './components/dashboard/MetricsGrid';

export default function AdminDashboard() {
  const [session, setSession] = useState('2023/2024');
  const [term, setTerm] = useState('Second Term');

  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.defaultTenantId || '';
  const schoolName = user?.schools?.[0]?.name || 'School Management System';

  const { data: stats, isLoading: statsLoading } = useSchoolStats(schoolId);
  const { data: analysis, isLoading: analysisLoading } = useSchoolPerformanceAnalysis(schoolId);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col overflow-x-hidden pb-20">
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-10 space-y-8">
        
        {/* Premium School Header */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
            <Building2 size={320} className="text-primary" />
          </div>
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className="bg-primary/10 text-primary border-none rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest">
                  Institution Overview
                </Badge>
                <div className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <ShieldCheck size={14} className="text-emerald-500" /> Verified System
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.85]">
                {schoolName} <br />
                <span className="text-slate-400">Command Center</span>
              </h1>
            </div>
            
            <DateControls
              onSessionChange={setSession}
              onTermChange={setTerm}
            />
          </div>
        </section>

        {/* AI Insight Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 rounded-[3.5rem] border-2 border-primary/20 bg-gradient-to-br from-white to-primary/5 dark:from-slate-900 dark:to-primary/5 shadow-2xl shadow-primary/5 overflow-hidden group">
            <CardHeader className="p-10 pb-0">
              <div className="flex items-center gap-4 mb-2">
                <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/30">
                  <Sparkles size={24} />
                </div>
                <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                  AI Academic Advisor
                  <Badge variant="secondary" className="rounded-full text-[10px] uppercase font-black px-3">Live Analysis</Badge>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-10 pt-6 space-y-8">
              {analysisLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                </div>
              ) : (
                <p className="text-xl font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic border-l-4 border-primary/30 pl-6 py-2">
                  "{analysis?.insight || "Gathering institutional metrics to generate strategic performance insights..."}"
                </p>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Institutional Mastery</p>
                  <p className="text-3xl font-black text-primary">{analysis?.averageScore || 0}%</p>
                </div>
                <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Assessments</p>
                  <p className="text-3xl font-black text-indigo-500">{analysis?.totalAssessments || 0}</p>
                </div>
                <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Risk Assessment</p>
                  <p className={cn(
                    "text-3xl font-black",
                    (analysis?.averageScore || 0) > 60 ? "text-emerald-500" : "text-amber-500"
                  )}>
                    {(analysis?.averageScore || 0) > 60 ? "Nominal" : "Warning"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[3.5rem] border-none bg-slate-900 text-white shadow-2xl relative overflow-hidden flex flex-col justify-center p-10">
            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none rotate-12">
              <GraduationCap size={280} />
            </div>
            <div className="space-y-8 relative z-10 text-center">
              <h3 className="text-3xl font-black tracking-tighter">Institution <br/> Grade Health</h3>
              <div className="h-32 w-32 rounded-full border-8 border-emerald-500/30 flex items-center justify-center mx-auto bg-white/5 shadow-inner">
                <span className="text-4xl font-black text-emerald-400">
                  {analysisLoading ? ".." : ((analysis as any)?.letterGrade || "N/A")}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-400 max-w-xs mx-auto leading-relaxed">
                {(analysis?.averageScore || 0) > 60 
                  ? "Academic benchmarks are currently stable and trending above regional averages."
                  : "Institutional mastery requires strategic review of current learning frameworks."}
              </p>
              <button className="w-full h-14 rounded-2xl bg-white text-slate-900 font-black uppercase tracking-widest text-[11px] hover:bg-slate-100 transition-all shadow-xl active:scale-[0.98]">
                Generate Annual Report
              </button>
            </div>
          </Card>
        </section>

        {/* Key Metrics Grid */}
        <MetricsGrid stats={stats} isLoading={statsLoading} />

        {/* Dashboard Layout */}
        <DashboardLayout
          leftColumn={
            <>
              {/* Performance & Attendance Section */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 items-start">
                <AcademicChart analysis={analysis} isLoading={analysisLoading} />
                <AttendanceChart />
              </div>

              {/* Exam Status & Staff Insights */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pt-4">
                <ExamStatus />
                <StaffInsights />
              </div>
            </>
          }
          rightColumn={
            <>
              <QuickActions />
              <AlertsPanel />
              <RecentActivity />
            </>
          }
        />
      </main>
    </div>
  );
}