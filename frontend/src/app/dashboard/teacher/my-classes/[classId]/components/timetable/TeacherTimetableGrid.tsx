'use client';

import React, { useState } from 'react';
import { Period } from '@/app/dashboard/admin/classes/[id]/components/timetable/components/types';
import { MapPin, Eye, EyeOff, Clock, CalendarDays, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeacherTimetableGridProps {
  periods: Period[];
  days: string[];
}

const TeacherSubjectCard = ({ subject }: { subject: any }) => {
  const isOwn = !!subject.isTeacherSubject;
  const [previewing, setPreviewing] = useState(false);

  return (
    <div className={`group relative h-full min-h-[85px] p-3 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:shadow-lg ${
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
          <MapPin size={8} className="text-emerald-600" />
          <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            {subject.room}
          </span>
        </div>
      )}
    </div>
  );
};

const TeacherTimetableGrid: React.FC<TeacherTimetableGridProps> = ({ periods, days }) => {
  const todayDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayIndex = days.findIndex(d => d.toLowerCase() === todayDayName.toLowerCase());
  const [selectedMobileDay, setSelectedMobileDay] = useState(todayIndex !== -1 ? todayIndex : 0);
  const [mobileViewMode, setMobileViewMode] = useState<'daily' | 'matrix'>('daily');

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

  const activeMobileDay = days[selectedMobileDay] || days[0];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Mobile Mode Switch & Day Selector (screens < 768px) */}
      <div className="md:hidden space-y-3">
        {/* Toggle between Daily & Matrix */}
        <div className="flex items-center justify-between gap-2 bg-slate-100 dark:bg-emerald-950/60 p-1.5 rounded-xl border border-slate-200/80 dark:border-emerald-800/50">
          <button
            type="button"
            onClick={() => setMobileViewMode('daily')}
            className={cn(
              "flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all",
              mobileViewMode === 'daily'
                ? "bg-white dark:bg-emerald-900/50 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            Daily Schedule
          </button>
          <button
            type="button"
            onClick={() => setMobileViewMode('matrix')}
            className={cn(
              "flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all",
              mobileViewMode === 'matrix'
                ? "bg-white dark:bg-emerald-900/50 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            Weekly Matrix
          </button>
        </div>

        {/* Day Pills in Daily View */}
        {mobileViewMode === 'daily' && (
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
            {days.map((day, idx) => {
              const isSelected = selectedMobileDay === idx;
              const isToday = day.toLowerCase() === todayDayName.toLowerCase();

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedMobileDay(idx)}
                  className={cn(
                    "flex-1 min-w-[70px] py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all border shrink-0 text-xs font-bold",
                    isSelected
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-white dark:bg-emerald-950/40 border-slate-200 dark:border-emerald-800/50 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                  )}
                >
                  <span>{day.slice(0, 3)}</span>
                  {isToday && (
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full animate-pulse shrink-0",
                      isSelected ? "bg-white" : "bg-emerald-500"
                    )} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Mobile Daily Cards List */}
      {mobileViewMode === 'daily' && (
        <div className="md:hidden space-y-2.5">
          {periods.map((period) => {
            const subject = (period.subjects as any)[activeMobileDay];
            const isCurrent = isCurrentTimeSlot(activeMobileDay, period.timeSlot);
            const isOwn = !!subject?.isTeacherSubject;

            return (
              <div
                key={`mobile-slot-${period.id}-${activeMobileDay}`}
                className={cn(
                  "p-3.5 rounded-2xl border transition-all shadow-xs relative overflow-hidden",
                  isCurrent ? "ring-2 ring-emerald-500 shadow-sm" : "",
                  subject?.isBreak
                    ? "bg-amber-50/80 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50"
                    : subject
                    ? isOwn
                      ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/60"
                      : "bg-white dark:bg-[#2a3650]/80 border-slate-200 dark:border-emerald-800/50"
                    : "bg-slate-50/70 dark:bg-white/[0.01] border-slate-100 dark:border-white/5 opacity-80"
                )}
              >
                {/* Now badge */}
                {isCurrent && (
                  <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md animate-pulse">
                    Live Now
                  </span>
                )}

                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 shrink-0">
                    <Clock size={11} className="text-slate-400" />
                    <span>{formatSlotTo12Hour(period.timeSlot)}</span>
                  </div>

                  <div className="flex-1 min-w-0 pr-8">
                    {subject ? (
                      subject.isBreak ? (
                        <p className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                          {subject.breakLabel || subject.name || 'Recess / Break'}
                        </p>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className={cn(
                              "text-xs font-black uppercase tracking-wide truncate",
                              isOwn ? "text-emerald-800 dark:text-emerald-300" : "text-slate-900 dark:text-white"
                            )}>
                              {subject.name}
                            </h4>
                            {isOwn && (
                              <span className="bg-emerald-500 text-white text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md shrink-0">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <span>{subject.teacher}</span>
                            {subject.room && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                                  <MapPin size={9} /> {subject.room}
                                </span>
                              </>
                            )}
                          </p>
                        </div>
                      )
                    ) : (
                      <p className="text-[11px] font-semibold text-slate-400 italic">
                        Free Period / Self Study
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Matrix Table (Desktop & when toggled on mobile) */}
      <div className={cn(
        "overflow-x-auto rounded-2xl sm:rounded-[2rem] border border-slate-200 dark:border-emerald-800/50 bg-white dark:bg-emerald-950/60 shadow-xl shadow-slate-200/40 dark:shadow-none",
        mobileViewMode === 'daily' ? "hidden md:block" : "block"
      )}>
        <div
          className="grid w-full"
          style={{ gridTemplateColumns: `minmax(85px, auto) repeat(${days.length}, minmax(135px, 1fr))` }}
        >
          {/* Headers */}
          <div className="p-3 sm:p-4 text-left text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-black uppercase tracking-widest border-b border-r border-slate-100 dark:border-emerald-800/50">
            Period
          </div>
          {days.map((day) => {
            const isToday = day.toLowerCase() === todayDayName.toLowerCase();
            return (
              <div
                key={day}
                className={`p-3 sm:p-4 text-xs sm:text-sm font-black uppercase tracking-widest border-b border-r border-slate-100 dark:border-emerald-800/50 last:border-r-0 flex items-center justify-between ${
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
              <div className="p-3 sm:p-4 flex items-center justify-center text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs font-black uppercase tracking-widest border-b border-r border-slate-100 dark:border-emerald-800/50 bg-slate-50 dark:bg-emerald-900/20 text-center">
                {formatSlotTo12Hour(period.timeSlot)}
              </div>

              {days.map((day) => {
                const subject = (period.subjects as any)[day];
                const isCurrent = isCurrentTimeSlot(day, period.timeSlot);

                return (
                  <div
                    key={`${period.id}-${day}`}
                    className={`p-2.5 sm:p-3 border-b border-r border-slate-100 dark:border-emerald-800/50 last:border-r-0 transition-all duration-300 relative ${
                      isCurrent ? 'bg-emerald-600/5 dark:bg-emerald-600/10 z-10' : ''
                    }`}
                  >
                    {isCurrent && (
                      <div className="absolute top-2 left-2 z-50 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md animate-pulse shadow-sm ring-1 ring-emerald-300">
                        Now
                      </div>
                    )}

                    {subject ? (
                      subject.isBreak ? (
                        <div className="h-full min-h-[85px] p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 flex flex-col items-center justify-center">
                          <p className="text-xs text-amber-700 dark:text-amber-400 font-black uppercase tracking-widest text-center">
                            {subject.breakLabel || subject.name || 'Recess / Break'}
                          </p>
                        </div>
                      ) : (
                        <TeacherSubjectCard subject={subject} />
                      )
                    ) : (
                      <div className={`h-full min-h-[85px] rounded-2xl flex items-center justify-center transition-colors ${
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
    </div>
  );
};

export default TeacherTimetableGrid;
