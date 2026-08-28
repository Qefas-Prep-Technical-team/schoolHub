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
          color: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30',
          label: 'Ongoing',
        };
      case 'upcoming':
        return {
          icon: Calendar,
          color: '',
          label: 'Upcoming',
          customColor: primaryColor
        };
      case 'grading':
        return {
          icon: Zap,
          color: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30',
          label: 'Grading',
        };
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:border-slate-700',
          label: 'Completed',
        };
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
      
      <div className="p-6 pb-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            Exam Status
            <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
          </h3>
          <p className="text-xs text-slate-500">Live examination tracking</p>
        </div>
        <Link
          href="/dashboard/admin/exams"
          className="text-xs font-semibold flex items-center gap-1 transition-colors hover:opacity-80"
          style={{ color: primaryColor }}
        >
          View All <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex-1 space-y-2 p-4 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
          </div>
        ) : exams.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
               <FileText size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">No active exams</p>
            <p className="text-xs text-slate-500">
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
                className="p-3 flex items-center justify-between rounded-2xl border border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-100 dark:hover:border-slate-800 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                      {exam.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                       <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                          {exam.subject}
                       </span>
                       <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                       <span className="text-[10px] font-semibold" style={{ color: primaryColor }}>
                          {exam.grade}
                       </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right shrink-0">
                  <div 
                    className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold",
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

      <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Update: <span className="font-semibold text-slate-700 dark:text-slate-200">1 exam ending</span>
            </p>
          </div>
          <button className="text-xs font-semibold transition-colors hover:opacity-80" style={{ color: primaryColor }}>
            Schedule New &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}

