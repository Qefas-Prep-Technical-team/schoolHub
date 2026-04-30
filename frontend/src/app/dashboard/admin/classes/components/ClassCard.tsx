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
import { motion } from 'framer-motion';
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
    label: 'SYNC COMPLETE',
    icon: CheckCircle,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20'
  },
  incomplete: {
    label: 'PARTIAL SYNC',
    icon: AlertCircle,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20'
  },
  pending: {
    label: 'SYNC PENDING',
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
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  const { data: settings } = useSchoolSettings(schoolId);
  const primaryColor = settings?.themeColor || '#ea580c';

  const status = statusConfig[classData.timetableStatus] || statusConfig.pending;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative h-full"
    >
      <div 
        className="h-full rounded-[3.5rem] bg-white dark:bg-slate-900/40 backdrop-blur-3xl border border-slate-100 dark:border-white/5 p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col"
        onClick={() => (window.location.href = `/dashboard/admin/classes/${classData.id}`)}
      >
        {/* Dynamic Background Glow */}
        <div 
          className="absolute -right-10 -top-10 w-48 h-48 rounded-full blur-[80px] opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-700 pointer-events-none" 
          style={{ backgroundColor: primaryColor }}
        />

        <div className="flex justify-between items-start mb-10 relative z-10">
          <div className="flex items-center gap-5">
            <div 
                className="size-16 rounded-[1.5rem] bg-slate-50 dark:bg-white/5 flex items-center justify-center p-4 text-slate-400 group-hover:scale-110 transition-all duration-500 border border-slate-100 dark:border-white/5 shadow-inner"
                style={{ color: primaryColor }}
            >
              <Layers className="size-full" strokeWidth={2.5} />
            </div>
            <div className="space-y-1">
                <div className={cn(
                    "inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                    status.bgColor, status.color, status.borderColor
                )}>
                    {status.label}
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                     STRUCTURAL NODE
                </div>
            </div>
          </div>

          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <Button 
                onClick={() => onEdit?.(classData.id)}
                variant="ghost" 
                size="icon" 
                className="size-12 rounded-2xl bg-slate-50/50 dark:bg-white/5 border border-transparent hover:border-slate-100 dark:hover:border-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
              >
                <Edit2 size={18} />
              </Button>
              <Button 
                onClick={() => onDelete?.(classData.id)}
                variant="ghost" 
                size="icon" 
                className="size-12 rounded-2xl bg-slate-50/50 dark:bg-white/5 border border-transparent hover:border-rose-100 hover:text-rose-600 transition-all shadow-sm"
              >
                <Trash2 size={18} />
              </Button>
          </div>
        </div>

        <div className="flex-1 relative z-10">
          <h3 
            className="text-2xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors leading-[1.1] uppercase tracking-tighter"
            style={{ '--primary': primaryColor } as any}
          >
            {classData.name}
          </h3>
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8">
            {classData.section} ARM RECOGNITION
          </p>

          <div className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50/50 dark:bg-white/5 border border-slate-100 dark:border-white/5 mb-8">
            <div className="size-12 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-md">
                {classData.teacher.avatarUrl ? (
                  <img src={classData.teacher.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                    <User size={20} />
                  </div>
                )}
            </div>
            <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Lead Personnel</p>
                <p className="text-xs font-black text-slate-900 dark:text-white uppercase truncate max-w-[150px]">
                  {classData.teacher.name}
                </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-8 border-t border-slate-50 dark:border-white/5 relative z-10">
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Occupancy</span>
                  <div className="flex items-center gap-2">
                       <Users size={14} className="text-indigo-500" />
                       <span className="text-lg font-black text-slate-900 dark:text-white tracking-tighter uppercase">
                          {classData.studentCount} Nodes
                       </span>
                  </div>
              </div>
              <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Efficiency</span>
                  <div className="flex items-center gap-2">
                       <Target size={14} className="text-emerald-500" />
                       <span className="text-lg font-black text-slate-900 dark:text-white tracking-tighter uppercase">
                          {classData.subjectCount} Syncs
                       </span>
                  </div>
              </div>
          </div>

          <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                  {classData.isLive ? (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest animate-pulse border border-emerald-100">
                        <div className="size-1.5 rounded-full bg-emerald-500" /> Active Channel
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest border border-slate-100">
                        <Activity size={10} /> Standby
                    </div>
                  )}
              </div>
              <div 
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] group-hover:gap-4 transition-all"
                style={{ color: primaryColor }}
              >
                  <span>Connect</span>
                  <ArrowRight size={14} strokeWidth={3} />
              </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
