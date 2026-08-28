'use client';

import { ClassData } from './types';
import { useSchoolSettings } from '@/lib/api/hooks/useSchool';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import {
  Users,
  BookOpen,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  ArrowRight,
  Activity,
  Layers,
  Edit2,
  Trash2,
  Eye,
  Zap,
  Target
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ClassCardProps {
  classData: ClassData;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const statusConfig = {
  complete: {
    label: 'TIMETABLE READY',
    icon: CheckCircle,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20'
  },
  incomplete: {
    label: 'PARTIAL SCHEDULE',
    icon: AlertCircle,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20'
  },
  pending: {
    label: 'PENDING SETUP',
    icon: Clock,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20'
  },
};

export default function ClassCard({
  classData,
  onView,
  onEdit,
  onDelete,
}: ClassCardProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  const { data: settings } = useSchoolSettings(schoolId);
  const primaryColor = settings?.themeColor || '#2563eb';

  const status = statusConfig[classData.timetableStatus] || statusConfig.pending;

  const [activeTeacherIndex, setActiveTeacherIndex] = useState(0);

  useEffect(() => {
    if (!classData.teachers || classData.teachers.length <= 1) return;
    const interval = setInterval(() => {
      setActiveTeacherIndex(prev => (prev + 1) % classData.teachers!.length);
    }, 3000); // 3 seconds per slide
    return () => clearInterval(interval);
  }, [classData.teachers]);

  const activeTeacher = classData.teachers?.[activeTeacherIndex]?.teacher || classData.teacher;
  const isLead = classData.teachers?.[activeTeacherIndex]?.isLead;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative h-full"
    >
      <div 
        className="h-full rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
        onClick={() => router.push(`/dashboard/admin/classes/${classData.id}`)}
      >

        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div 
                className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 border border-slate-100 dark:border-slate-700 transition-colors group-hover:border-primary/20"
                style={{ color: primaryColor }}
            >
              <Layers size={20} />
            </div>
            <div className="space-y-1">
                <div className={cn(
                    "inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border",
                    status.bgColor, status.color, status.borderColor
                )}>
                    {status.label}
                </div>
            </div>
          </div>

          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <Button 
                onClick={() => onEdit?.(classData.id)}
                variant="ghost" 
                size="icon" 
                className="size-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Edit2 size={14} />
              </Button>
              <Button 
                onClick={() => onDelete?.(classData.id)}
                variant="ghost" 
                size="icon" 
                className="size-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 size={14} />
              </Button>
          </div>
        </div>

        <div className="flex-1">
          <h3 
            className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors"
            style={{ '--primary': primaryColor } as any}
          >
            {classData.name}
          </h3>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6">
            {classData.section} SECTION
          </p>

          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 mb-6 relative overflow-hidden h-[76px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTeacherIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 absolute inset-0 p-3"
              >
                <div className="size-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                    {activeTeacher?.avatarUrl ? (
                      <img src={activeTeacher.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                        <User size={16} />
                      </div>
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5 truncate">
                        {classData.teachers?.length ? (isLead ? "Lead Teacher" : "Co-Teacher") : "Class Teacher"}
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {activeTeacher?.name || "No Teacher Assigned"}
                    </p>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Pagination dots if multiple teachers */}
            {classData.teachers && classData.teachers.length > 1 && (
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
                    {classData.teachers.map((_, i) => (
                        <div 
                            key={i}
                            className={cn(
                                "h-1 rounded-full transition-all",
                                i === activeTeacherIndex ? "w-3 bg-primary" : "w-1 bg-slate-300 dark:bg-slate-600"
                            )}
                            style={{ backgroundColor: i === activeTeacherIndex ? primaryColor : undefined }}
                        />
                    ))}
                </div>
            )}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center size-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Users size={14} />
                  </div>
                  <div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white block leading-none">{classData.studentCount}</span>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase">Students</span>
                  </div>
              </div>
              <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center size-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Target size={14} />
                  </div>
                  <div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white block leading-none">{classData.subjectCount}</span>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase">Subjects</span>
                  </div>
              </div>
          </div>

          <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                  {classData.isLive ? (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                        <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> In Session
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-500 text-xs font-semibold">
                        <Activity size={12} /> Inactive
                    </div>
                  )}
              </div>
              <div 
                className="flex items-center gap-1 text-xs font-semibold group-hover:gap-2 transition-all"
                style={{ color: primaryColor }}
              >
                  <span>Manage</span>
                  <ArrowRight size={14} />
              </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

