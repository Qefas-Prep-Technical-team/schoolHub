'use client';

import React from 'react';
import TimetableCard from './TimetableCard';
import { Period, Subject } from './types';
import { useSchoolSettings } from '@/lib/api/hooks/useSchool';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { cn } from '@/lib/utils';
import { Clock, Coffee, Plus } from 'lucide-react';

interface TimetableGridProps {
  periods: Period[];
  days: string[];
  onCellClick?: (day: string, periodId: string) => void;
  onEdit?: (subjectId: string) => void;
  onDelete?: (subjectId: string) => void;
  onMarkAttendance?: (subjectId: string) => void;
}

const TimetableGrid: React.FC<TimetableGridProps> = ({
  periods,
  days,
  onCellClick,
  onEdit,
  onDelete,
  onMarkAttendance
}) => {
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  const { data: settings } = useSchoolSettings(schoolId);
  const primaryColor = settings?.themeColor || '#ea580c';

  const isBreak = (timeSlot: string) => {
    return timeSlot.includes('11:00 - 12:00');
  };

  return (
    <div className="overflow-x-auto bg-white dark:bg-slate-900">
      <div className="min-w-[1200px]">
        {/* Grid Header */}
        <div 
          className="grid border-b border-slate-100 dark:border-white/5" 
          style={{ gridTemplateColumns: `160px repeat(${days.length}, 1fr)` }}
        >
          <div className="p-8 border-r border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Protocol</span>
          </div>
          {days.map((day) => (
            <div 
              key={day}
              className="p-8 border-r border-slate-100 dark:border-white/5 last:border-r-0 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-center"
            >
              <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* Chronological Rows */}
        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {periods.map((period) => (
            <div 
              key={period.id}
              className="grid group transition-colors hover:bg-slate-50/50 dark:hover:bg-white/[0.01]"
              style={{ gridTemplateColumns: `160px repeat(${days.length}, 1fr)` }}
            >
              {/* Time Slot Node */}
              <div className="p-6 border-r border-slate-100 dark:border-white/5 flex flex-col justify-center items-center gap-1 bg-slate-50/50 dark:bg-white/[0.02]">
                <Clock size={14} className="text-slate-400" />
                <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tighter text-center leading-none">
                  {period.timeSlot}
                </span>
              </div>

              {/* Data Cells */}
              {days.map((day) => {
                const subject = period.subjects[day];
                const isBreakTime = isBreak(period.timeSlot);

                return (
                  <div 
                    key={`${period.id}-${day}`}
                    className={cn(
                      "p-3 border-r border-slate-100 dark:border-white/5 last:border-r-0 min-h-[140px] flex flex-col",
                      isBreakTime && "bg-slate-50 dark:bg-white/[0.02] items-center justify-center col-span-5"
                    )}
                  >
                    {isBreakTime ? (
                      <div className="flex flex-col items-center gap-3 text-slate-300 dark:text-slate-700">
                        <Coffee size={32} strokeWidth={1.5} />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Operational Break</span>
                      </div>
                    ) : subject ? (
                      <TimetableCard
                        subject={subject}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onMarkAttendance={onMarkAttendance}
                      />
                    ) : (
                      <button 
                        onClick={() => onCellClick?.(day, period.id)}
                        className="flex-1 rounded-[1.5rem] border-2 border-dashed border-slate-100 dark:border-white/5 hover:border-orange-600/30 hover:bg-orange-600/[0.02] transition-all flex items-center justify-center group/btn"
                      >
                        <div className="size-10 rounded-full border border-slate-100 dark:border-white/5 flex items-center justify-center text-slate-300 group-hover/btn:text-orange-600 group-hover/btn:border-orange-600/30 group-hover/btn:scale-110 transition-all">
                          <Plus size={18} />
                        </div>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimetableGrid;