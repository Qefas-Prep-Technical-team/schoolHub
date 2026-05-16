'use client';

import { Clock, Calendar, CheckCircle, FileText, AlertCircle, ChevronRight, Zap } from 'lucide-react';
import { useState } from 'react';

import Link from 'next/link';
import { useExams } from '@/lib/api/hooks/useExams';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Exam {
  id: string;
  title: string;
  subject: string;
  grade: string;
  status: 'ongoing' | 'upcoming' | 'grading' | 'completed';
  time: string;
  description?: string;
  teacher?: string;
}

export default function ExamStatus({ primaryColor = '#2563eb' }: { primaryColor?: string }) {
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  
  const { data: examsData, isLoading } = useExams({ schoolId });

  // Map API data to the component's internal Exam interface
  const exams: Exam[] = (examsData || []).slice(0, 5).map((e: any) => {
    let status: Exam['status'] = 'upcoming';
    const now = new Date();
    const start = e.startDate ? new Date(e.startDate) : null;
    const end = e.endDate ? new Date(e.endDate) : null;

    if (e.status === 'PUBLISHED') {
      if (start && now >= start && (!end || now <= end)) status = 'ongoing';
      else if (end && now > end) status = 'completed';
    } else if (e.status === 'DRAFT') {
      status = 'upcoming';
    }

    return {
      id: e.id,
      title: e.title,
      subject: e.subjectPapers?.[0]?.title || 'Multiple Subjects',
      grade: e.class?.name || 'All Grades',
      status,
      time: start ? new Date(start).toLocaleDateString() : 'TBD',
      teacher: e.teacher?.name || 'Teacher',
      description: e.description || ''
    };
  });

  const getStatusConfig = (status: Exam['status']) => {
    switch (status) {
      case 'ongoing':
        return {
          icon: Clock,
          color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
          label: 'Ongoing',
        };
      case 'upcoming':
        return {
          icon: Calendar,
          color: 'bg-primary/10 text-primary border-primary/20',
          label: 'Upcoming',
          customColor: primaryColor
        };
      case 'grading':
        return {
          icon: Zap,
          color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
          label: 'Grading',
        };
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
          label: 'Completed',
        };
    }
  };

  return (
    <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-white/20 dark:border-slate-800/50 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden flex flex-col group">
      <div 
        className="absolute top-0 right-0 h-32 w-32 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" 
        style={{ backgroundColor: primaryColor }}
      />
      
      <div className="px-10 py-8 relative z-10 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: primaryColor }}>Exam Overview</span>
          </div>
          <h3 className="font-black text-2xl text-slate-900 dark:text-white tracking-tighter italic uppercase">
            Exam Status
          </h3>
        </div>
        <Link
          href="/dashboard/admin/exams"
          className="h-10 w-10 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-md flex items-center justify-center text-slate-500 hover:text-white transition-all active:scale-90 border border-transparent"
          style={{ '--hover-bg': primaryColor } as any}
        >
          <ChevronRight className="h-5 w-5" />
        </Link>
      </div>

      <div className="flex-1 space-y-2 px-6 pb-8 overflow-y-auto custom-scrollbar relative z-10">
        {isLoading ? (
          <div className="space-y-4 px-4">
            <Skeleton className="h-20 w-full rounded-[2rem]" />
            <Skeleton className="h-20 w-full rounded-[2rem]" />
          </div>
        ) : exams.length === 0 ? (
          <div className="py-10 flex flex-col items-center justify-center text-center px-4">
            <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 mb-3">
               <FileText size={24} />
            </div>
            <p className="text-sm font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest leading-none mb-2">No data available currently</p>
            <p className="text-[10px] text-slate-500 font-bold italic max-w-[250px]">
              Active exams will appear here once scheduled.
            </p>
          </div>
        ) : (
          exams.map((exam, idx) => {
            const statusConfig = getStatusConfig(exam.status);
            const Icon = statusConfig.icon;

            return (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="px-6 py-5 flex items-center justify-between rounded-[2rem] border border-transparent hover:bg-white/30 dark:hover:bg-slate-800/30 transition-all cursor-pointer group/item"
                style={{ '--hover-border': `${primaryColor}20` } as any}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover/item:text-white transition-all shrink-0" style={{ '--hover-bg': primaryColor } as any}>
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-black text-slate-900 dark:text-white truncate uppercase tracking-tight italic">
                        {exam.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[120px]">
                          {exam.subject}
                       </span>
                       <span className="h-1 w-1 rounded-full bg-slate-300" />
                       <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: primaryColor }}>
                          {exam.grade}
                       </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right shrink-0">
                  <div 
                    className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest",
                        !statusConfig.customColor && statusConfig.color
                    )}
                    style={statusConfig.customColor ? { backgroundColor: `${statusConfig.customColor}15`, color: statusConfig.customColor, borderColor: `${statusConfig.customColor}30` } : {}}
                  >
                    <Icon className="h-3 w-3" />
                    {statusConfig.label}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Action Footer */}
      <div className="px-10 py-6 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 mt-auto relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Update: <span className="text-slate-900 dark:text-white">1 exam ending</span>
            </p>
          </div>
          <button className="text-[10px] font-black hover:tracking-widest transition-all uppercase" style={{ color: primaryColor }}>
            Schedule New Exam →
          </button>
        </div>
      </div>
    </div>
  );
}

