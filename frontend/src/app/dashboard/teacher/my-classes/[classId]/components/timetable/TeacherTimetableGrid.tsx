'use client';

import React, { useState } from 'react';
import { Period } from '@/app/dashboard/admin/classes/[id]/components/timetable/components/types';
import { MapPin, Eye, EyeOff } from 'lucide-react';

interface TeacherTimetableGridProps {
  periods: Period[];
  days: string[];
}

const TeacherSubjectCard = ({ subject }: { subject: any }) => {
  const isOwn = !!subject.isTeacherSubject;
  const [previewing, setPreviewing] = useState(false);

  return (
    <div className={`group relative h-full min-h-[90px] p-3 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:shadow-lg ${
      isOwn
        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500 dark:border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
        : 'bg-white dark:bg-[#2a3650] border border-slate-200 dark:border-emerald-700/50'
    }`}>
      {/* "You" badge for own subjects */}
      {isOwn && (
        <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md z-10">
          You
        </span>
      )}

      {/* Blurred overlay for other teachers' subjects */}
      {!isOwn && (
        <div
          className={`absolute inset-0 rounded-2xl z-10 flex items-center justify-center transition-all duration-300 cursor-pointer ${
            previewing
              ? 'backdrop-blur-none bg-transparent'
              : 'backdrop-blur-[3px] bg-white/40 dark:bg-emerald-950/40'
          }`}
          onClick={() => setPreviewing((p) => !p)}
        >
          {!previewing && (
            <div className="flex flex-col items-center gap-1 select-none">
              <Eye size={16} className="text-slate-500 dark:text-slate-400" />
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Preview
              </span>
            </div>
          )}
          {previewing && (
            <div className="absolute top-2 right-2">
              <EyeOff size={12} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>
      )}

      {/* Card Content */}
      <div className="flex flex-col gap-1 pr-6">
        <h4 className={`text-xs font-black leading-tight line-clamp-2 uppercase tracking-wide ${
          isOwn ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-900 dark:text-white'
        }`}>
          {subject.name}
        </h4>
        <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
          {subject.teacher}
        </p>
      </div>

      {subject.room && (
        <div className={`mt-2 flex items-center gap-1 w-fit px-2 py-1 rounded-md border ${
          isOwn
            ? 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-700'
            : 'bg-slate-100 dark:bg-emerald-900/40/50 border-slate-200 dark:border-emerald-700/50'
        }`}>
          <MapPin size={8} className={isOwn ? 'text-emerald-600' : 'text-emerald-600'} />
          <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            {subject.room}
          </span>
        </div>
      )}
    </div>
  );
};

const TeacherTimetableGrid: React.FC<TeacherTimetableGridProps> = ({ periods, days }) => {
  const formatTo12Hour = (timeStr: string): string => {
    if (!timeStr) return '';
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return timeStr;
    const hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayHours}:${minutes} ${ampm}`;
  };

  const formatSlotTo12Hour = (slotStr: string): string => {
    if (!slotStr || !slotStr.includes(' - ')) return slotStr;
    const [start, end] = slotStr.split(' - ');
    return `${formatTo12Hour(start)} - ${formatTo12Hour(end)}`;
  };

  const isCurrentTimeSlot = (dayName: string, slotStr: string): boolean => {
    if (!slotStr || !slotStr.includes(' - ')) return false;
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    if (dayName.toLowerCase() !== today.toLowerCase()) return false;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [start, end] = slotStr.split(' - ');
    const parse = (t: string) => {
      const m = t.trim().match(/^(\d{1,2}):(\d{2})/);
      if (!m) return -1;
      return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
    };
    return currentMinutes >= parse(start) && currentMinutes <= parse(end);
  };

  return (
    <div className="overflow-x-auto rounded-[2rem] border border-slate-200 dark:border-emerald-800/50 bg-white dark:bg-emerald-950/60 shadow-xl shadow-slate-200/40 dark:shadow-none">
      <div
        className="grid w-full"
        style={{ gridTemplateColumns: `minmax(90px, auto) repeat(${days.length}, minmax(140px, 1fr))` }}
      >
        {/* Headers */}
        <div className="p-4 text-left text-slate-500 dark:text-slate-400 text-sm font-black uppercase tracking-widest border-b border-r border-slate-100 dark:border-emerald-800/50">
          Period
        </div>
        {days.map((day) => {
          const isToday = day.toLowerCase() === new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
          return (
            <div
              key={day}
              className={`p-4 text-sm font-black uppercase tracking-widest border-b border-r border-slate-100 dark:border-emerald-800/50 last:border-r-0 flex items-center justify-between ${
                isToday ? 'text-emerald-600 bg-emerald-600/5 dark:bg-emerald-600/10' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <span>{day}</span>
              {isToday && (
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse block shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              )}
            </div>
          );
        })}

        {/* Rows */}
        {periods.map((period) => (
          <React.Fragment key={period.id}>
            <div className="p-4 flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest border-b border-r border-slate-100 dark:border-emerald-800/50 bg-slate-50 dark:bg-emerald-900/20 text-center">
              {formatSlotTo12Hour(period.timeSlot)}
            </div>

            {days.map((day) => {
              const subject = (period.subjects as any)[day];
              const isCurrent = isCurrentTimeSlot(day, period.timeSlot);

              return (
                <div
                  key={`${period.id}-${day}`}
                  className={`p-3 border-b border-r border-slate-100 dark:border-emerald-800/50 last:border-r-0 transition-all duration-300 relative ${
                    isCurrent ? 'bg-emerald-600/5 dark:bg-emerald-600/10 z-10' : ''
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute top-2 left-2 z-50 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.8)] ring-2 ring-emerald-300 dark:ring-emerald-400">
                      Now
                    </div>
                  )}

                  {subject ? (
                    subject.isBreak ? (
                      /* Recess / Break — no blur, no eye icon */
                      <div className="h-full min-h-[90px] p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 flex flex-col items-center justify-center">
                        <p className="text-xs text-amber-700 dark:text-amber-400 font-black uppercase tracking-widest text-center">
                          {subject.breakLabel || subject.name || 'Recess / Break'}
                        </p>
                      </div>
                    ) : (
                      <TeacherSubjectCard subject={subject} />
                    )
                  ) : (
                    <div className={`h-full min-h-[90px] rounded-2xl flex items-center justify-center transition-colors ${
                      isCurrent
                        ? 'border-2 border-dashed border-emerald-600/30 dark:border-emerald-600/20 bg-white dark:bg-emerald-950/60'
                        : 'border border-dashed border-slate-200 dark:border-emerald-800/50'
                    }`}>
                      <span className="text-[10px] text-slate-300 dark:text-slate-600 font-black uppercase tracking-widest">
                        Free
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default TeacherTimetableGrid;
