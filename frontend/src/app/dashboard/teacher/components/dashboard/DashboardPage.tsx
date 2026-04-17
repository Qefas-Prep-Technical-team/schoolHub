/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { teacherService } from '@/lib/api/services/teacherService';
import { useDashboardStore } from '@/lib/api/hooks/useDashboardStore';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import StatsCards from './StatsCards';
import AssignmentsExams from './AssignmentsExams';
import PerformanceAnalytics from './PerformanceAnalytics';
import StudentPerformanceWidget from './StudentPerformanceWidget';
import MessagesAnnouncements from './MessagesAnnouncements';
import TeacherSchedule from './TeacherSchedule';
import RecentPersonalActivity from './RecentPersonalActivity';
import { 
  Sparkles, 
  Plus, 
  Calendar, 
  Settings, 
  Share2,
  LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    upcomingLessons: 0,
    averagePerformance: 0,
    attendanceRate: 0,
  });
  const [performanceMetrics, setPerformanceMetrics] = useState({
    topStudents: [],
    distribution: { A: 0, B: 0, C: 0, D: 0, F: 0 }
  });
  const [recentExams, setRecentExams] = useState<any[]>([]);
  const { selectedSchoolId, selectedSchoolName } = useDashboardStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  const isPersonal = selectedSchoolId === user?.id;

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const filterId = isPersonal ? undefined : selectedSchoolId;
        const dashboardData = await teacherService.getDashboardStats(filterId || undefined);
        setStats(dashboardData.stats);
        setPerformanceMetrics(dashboardData.performanceMetrics);
        setRecentExams(dashboardData.recentExams);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [selectedSchoolId, isPersonal]);


  const dashboardAssignments = recentExams.map(exam => ({
    id: exam.id,
    title: exam.title,
    description: `${exam.subject} - ${exam.className}`,
    icon: 'assignment',
    iconColor: 'text-blue-500',
    status: exam.status === 'PUBLISHED' ? 'recent' : 'pending',
    action: exam.status === 'DRAFT' ? 'Publish' : null,
    dueDate: exam.date,
  }));

  const messages = [
    {
      id: '1',
      title: 'Academic Update',
      description: 'The semester results are being finalized...',
      sender: 'Admin',
      isUnread: true,
      isAnnouncement: true,
    },
    {
      id: '2',
      title: 'Class Project',
      description: 'A student has a follow-up about the project requirements.',
      sender: 'Grade 10A',
      isUnread: true,
      isAnnouncement: false,
    }
  ];

  if (loading && !stats.totalClasses) {
    return (
      <div className="flex flex-col items-center justify-center p-20 min-h-[60vh]">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mb-8 shadow-2xl shadow-primary/20"
        />
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">Synchronizing Command Center</h2>
        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Preparing your customized dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <main className="p-4 md:p-6 lg:p-10">
        <div className="max-w-[1600px] mx-auto">
          {/* Header Section */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-2">
                <Sparkles size={14} />
                Command Center
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                Welcome back, <span className="text-primary">{user?.name?.split(' ')[0] || 'Teacher'}!</span>
              </h1>
              <div className="flex items-center gap-3 mt-4">
                <div className="px-4 py-1.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[11px] font-black uppercase tracking-wider shadow-xl">
                  {isPersonal ? "Personal Overview" : selectedSchoolName}
                </div>
                {isPersonal && (
                  <span className="text-slate-400 dark:text-slate-500 text-[11px] font-black uppercase tracking-widest italic">
                    • Aggregating your unique data cross-school
                  </span>
                )}
              </div>
            </motion.div>

            <div className="flex items-center gap-3">
              <Button className="h-12 px-6 rounded-2xl bg-white dark:bg-slate-800 border-none shadow-xl shadow-slate-200/50 dark:shadow-none text-slate-900 dark:text-white hover:bg-slate-50 font-black tracking-tight">
                <Calendar className="mr-2 h-4 w-4" />
                Timetable
              </Button>
              <Button className="h-12 w-12 p-0 rounded-2xl bg-white dark:bg-slate-800 border-none shadow-xl shadow-slate-200/50 dark:shadow-none text-slate-900 dark:text-white hover:bg-slate-50">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedSchoolId}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              {/* Stats Row */}
              <StatsCards stats={stats} />

              {/* Bento Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
                
                {/* Assignments & Exams (8 Cols) */}
                <div className="lg:col-span-8">
                  <AssignmentsExams   
                    assignments={dashboardAssignments as any} 
                    onViewAll={() => {}}
                  />
                </div>

                {/* Daily Schedule (4 Cols) */}
                <div className="lg:col-span-4">
                  <TeacherSchedule />
                </div>

                {/* Performance Analytics (8 Cols) */}
                <div className="lg:col-span-8">
                  <PerformanceAnalytics />
                </div>

                {/* Student Performance (4 Cols) */}
                <div className="lg:col-span-4">
                  <StudentPerformanceWidget performanceMetrics={performanceMetrics} />
                </div>

                {/* Personal Feed (8 Cols) */}
                <div className="lg:col-span-8">
                  <RecentPersonalActivity />
                </div>

                {/* Quick Tools & Announcements (4 Cols) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  <div className="bg-primary/5 dark:bg-primary/10 rounded-[2rem] p-6 border border-primary/10">
                    <div className="flex items-center gap-2 mb-4">
                      <LayoutGrid className="w-5 h-5 text-primary" />
                      <h3 className="text-sm font-black uppercase tracking-widest text-primary">Quick Tools</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <QuickTool icon={Plus} label="Grade" sub="New Entry" color="bg-emerald-500" />
                      <QuickTool icon={Share2} label="Reports" sub="Export Data" color="bg-blue-500" />
                    </div>
                  </div>
                  
                  <MessagesAnnouncements 
                    messages={messages} 
                    onViewAll={() => {}}
                  />
                </div>

              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function QuickTool({ icon: Icon, label, sub, color }: { icon: any, label: string, sub: string, color: string }) {
  return (
    <button className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800/80 rounded-[1.5rem] shadow-lg shadow-slate-200/50 dark:shadow-none hover:translate-y-[-4px] active:scale-95 transition-all duration-300">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3 shadow-lg shadow-current/20`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{label}</span>
      <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">{sub}</span>
    </button>
  );
}