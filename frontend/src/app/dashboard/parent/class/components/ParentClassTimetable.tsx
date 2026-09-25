"use client";

import React, { useMemo } from 'react';
import { CalendarDays, MapPin } from 'lucide-react';
import { useClassTimetable } from '@/lib/api/hooks/useClasses';
import { useSessions } from '@/lib/api/hooks/useSessions';

interface ParentClassTimetableProps {
  classId: string;
  schoolId?: string;
}

export default function ParentClassTimetable({ classId, schoolId = "" }: ParentClassTimetableProps) {
  const { data: sessionsData } = useSessions(schoolId);
  const sessions = sessionsData?.data || [];

  const termPeriodId = useMemo(() => {
    if (!sessions || sessions.length === 0) return 'NONE';
    const now = new Date();
    
    // 1. Try to find the exact current term period based on dates
    for (const session of sessions) {
      if (session.termPeriods && session.termPeriods.length > 0) {
        const currentTermPeriod = session.termPeriods.find((tp: any) => {
          if (!tp.startDate || !tp.endDate) return false;
          return now >= new Date(tp.startDate) && now <= new Date(tp.endDate);
        });
        if (currentTermPeriod) return currentTermPeriod.id;
      }
    }
    
    // 2. Fallback to the active session's current term
    const activeSession = sessions.find((s: any) => s.isActive) || sessions[0];
    if (activeSession && activeSession.termPeriods) {
      const activeTermPeriod = activeSession.termPeriods.find(
        (tp: any) => tp.term === activeSession.currentTerm
      );
      if (activeTermPeriod) return activeTermPeriod.id;
    }
    
    return 'NONE';
  }, [sessions]);

  const { data: rawPeriods = [], isLoading } = useClassTimetable(classId, termPeriodId);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const periods = useMemo(() => {
    const defaultSlots = [
      '07:30 - 08:30', '08:30 - 09:30', '09:30 - 10:30', '10:30 - 11:30',
      '11:30 - 12:30', '12:30 - 13:30', '13:30 - 14:30', '14:30 - 15:30',
    ];

    if (!rawPeriods || rawPeriods.length === 0) {
      return defaultSlots.map(timeSlot => ({ id: timeSlot, timeSlot, subjects: {} }));
    }

    const uniqueSlotsMap = new Map<string, { startTime: string; endTime: string }>();
    rawPeriods.forEach((rp: any) => {
      if (rp.startTime && rp.endTime) {
        const slot = `${rp.startTime} - ${rp.endTime}`;
        uniqueSlotsMap.set(slot, { startTime: rp.startTime, endTime: rp.endTime });
      }
    });

    const sortedSlots = Array.from(uniqueSlotsMap.values()).sort((a, b) => a.startTime.localeCompare(b.startTime));

    return sortedSlots.map(slot => {
      const timeSlot = `${slot.startTime} - ${slot.endTime}`;
      const slotSubjects: Record<string, any> = {};

      rawPeriods.forEach((rp: any) => {
        if (rp.startTime === slot.startTime && rp.endTime === slot.endTime) {
          const teacherName = rp.teacher?.name || rp.teacher?.user?.name || 'Staff';
          slotSubjects[rp.day] = {
            id: rp.id,
            name: rp.isBreak ? 'Recess / Break' : (rp.subject?.name || 'Unknown'),
            teacher: rp.isBreak ? '' : teacherName,
            room: rp.isBreak ? '' : (rp.room || 'TBD'),
            isBreak: !!rp.isBreak,
          };
        }
      });

      return { id: timeSlot, timeSlot, subjects: slotSubjects };
    });
  }, [rawPeriods]);

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

  if (isLoading) {
    return (
      <div className="h-[400px] w-full rounded-[20px] border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 animate-pulse flex items-center justify-center">
        <span className="text-sm font-semibold text-slate-400">Loading Schedule...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-orange-50 dark:bg-orange-500/10 rounded-xl">
          <CalendarDays className="text-orange-600 dark:text-orange-400" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Class Schedule</h3>
          <p className="text-xs font-medium text-slate-500">Weekly Timetable</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-[20px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div
          className="grid w-full min-w-[800px]"
          style={{ gridTemplateColumns: `minmax(90px, auto) repeat(${days.length}, minmax(140px, 1fr))` }}
        >
          {/* Headers */}
          <div className="p-4 text-left text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
            Period
          </div>
          {days.map((day) => {
            const isToday = day.toLowerCase() === new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
            return (
              <div
                key={day}
                className={`p-4 text-xs font-semibold uppercase tracking-wider border-b border-r border-slate-100 dark:border-slate-800 last:border-r-0 flex items-center justify-between ${
                  isToday ? 'text-orange-600 bg-orange-50 dark:bg-orange-500/10' : 'text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/20'
                }`}
              >
                <span>{day}</span>
                {isToday && (
                  <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse block" />
                )}
              </div>
            );
          })}

          {/* Rows */}
          {periods.map((period) => (
            <React.Fragment key={period.id}>
              <div className="p-4 flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs font-medium border-b border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 text-center">
                {formatSlotTo12Hour(period.timeSlot)}
              </div>

              {days.map((day) => {
                const subject = (period.subjects as any)[day];
                const isCurrent = isCurrentTimeSlot(day, period.timeSlot);

                return (
                  <div
                    key={`${period.id}-${day}`}
                    className={`p-3 border-b border-r border-slate-100 dark:border-slate-800 last:border-r-0 transition-all duration-300 relative ${
                      isCurrent ? 'bg-orange-50/30 dark:bg-orange-500/5' : ''
                    }`}
                  >
                    {isCurrent && (
                      <div className="absolute top-2 left-2 z-10 bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
                        Now
                      </div>
                    )}

                    {subject ? (
                      subject.isBreak ? (
                        <div className="h-full min-h-[90px] p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 flex flex-col items-center justify-center">
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-center">
                            {subject.name || 'Break'}
                          </p>
                        </div>
                      ) : (
                        <div className="group relative h-full min-h-[90px] p-3 rounded-xl flex flex-col justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:shadow-md hover:border-orange-300">
                          <div className="flex flex-col gap-1 pr-2">
                            <h4 className="text-[13px] font-bold leading-tight line-clamp-2 text-slate-900 dark:text-white">
                              {subject.name}
                            </h4>
                            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                              {subject.teacher}
                            </p>
                          </div>
                          {subject.room && (
                            <div className="mt-2 flex items-center gap-1 w-fit px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
                              <MapPin size={10} className="text-orange-500" />
                              <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                                {subject.room}
                              </span>
                            </div>
                          )}
                        </div>
                      )
                    ) : (
                      <div className={`h-full min-h-[90px] rounded-xl flex items-center justify-center transition-colors ${
                        isCurrent
                          ? 'bg-white dark:bg-slate-900'
                          : 'border border-dashed border-slate-200 dark:border-slate-800'
                      }`}>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
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
}
