"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  CalendarDays, 
  MapPin, 
  Users, 
  AlertTriangle, 
  Coffee, 
  Plus, 
  Grid3X3, 
  ListOrdered,
  Sparkles,
  BookOpen
} from 'lucide-react';

export interface TeacherSubjectPeriod {
  id: string;
  name: string;
  className: string;
  room: string;
  isAssigned: boolean;
  isBreak?: boolean;
  breakLabel?: string;
}

export interface TeacherPeriod {
  id: string;
  timeSlot: string;
  subjects: {
    [key: string]: TeacherSubjectPeriod[];
  };
}

interface TeacherTimetableGridProps {
  periods: TeacherPeriod[];
  days: string[];
  onPeriodClick?: (periodId: string) => void;
  onEmptySlotClick?: (day: string, timeSlot: string) => void;
  primaryColor?: string;
}

const TeacherTimetableGrid: React.FC<TeacherTimetableGridProps> = ({ 
  periods, 
  days, 
  onPeriodClick, 
  onEmptySlotClick,
  primaryColor = '#2563eb'
}) => {
  // Mobile / Desktop View mode ('day' for agenda, 'grid' for full table)
  const [viewMode, setViewMode] = useState<'day' | 'grid'>('day');
  
  // Initialize to 'grid' on larger screens once mounted
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setViewMode('grid');
    }
  }, []);

  // Today's day name in English (e.g. 'Monday')
  const todayName = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' });
  }, []);

  // Selected day for the agenda view - default to today if in days, otherwise first day
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    const match = days.find(d => d.toLowerCase() === todayName.toLowerCase());
    return match || days[0] || 'Monday';
  });

  const formatTo12Hour = (timeStr: string): string => {
    if (!timeStr) return "";
    const cleanStr = timeStr.trim();
    const match = cleanStr.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return timeStr;
    const hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayHours}:${minutes} ${ampm}`;
  };

  const formatSlotTo12Hour = (slotStr: string): string => {
    if (!slotStr || !slotStr.includes(" - ")) return slotStr;
    const [start, end] = slotStr.split(" - ");
    return `${formatTo12Hour(start)} - ${formatTo12Hour(end)}`;
  };

  const isCurrentTimeSlot = (dayName: string, slotStr: string): boolean => {
    if (!slotStr || !slotStr.includes(" - ")) return false;
    if (dayName.toLowerCase() !== todayName.toLowerCase()) return false;
    
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const [start, end] = slotStr.split(" - ");
    const parseTimeToMinutes = (t: string) => {
      const match = t.trim().match(/^(\d{1,2}):(\d{2})/);
      if (!match) return -1;
      return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
    };
    
    const startMinutes = parseTimeToMinutes(start);
    const endMinutes = parseTimeToMinutes(end);
    
    if (startMinutes === -1 || endMinutes === -1) return false;
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  };

  // Compute scheduled classes count per day for the day selector badges
  const dayStats = useMemo(() => {
    const stats: Record<string, { totalClasses: number; totalBreaks: number; hasClash: boolean }> = {};
    days.forEach(day => {
      let classCount = 0;
      let breakCount = 0;
      let clash = false;
      periods.forEach(p => {
        const slots = p.subjects[day] || [];
        if (slots.length > 1) clash = true;
        slots.forEach(s => {
          if (s.isBreak) breakCount++;
          else classCount++;
        });
      });
      stats[day] = { totalClasses: classCount, totalBreaks: breakCount, hasClash: clash };
    });
    return stats;
  }, [days, periods]);

  // Total classes scheduled for currently selected day in day view
  const currentDayStats = dayStats[selectedDay] || { totalClasses: 0, totalBreaks: 0, hasClash: false };

  return (
    <div className="space-y-4">
      {/* ── View Switcher & Day Selector Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        {/* View Mode Toggle: Day Agenda vs Week Grid */}
        <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('day')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
              viewMode === 'day'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <ListOrdered size={14} />
            <span>Day Agenda</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Grid3X3 size={14} />
            <span>Week Grid</span>
          </button>
        </div>

        {/* Quick status message */}
        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
          {viewMode === 'day' ? (
            <span>
              Showing <strong className="text-slate-800 dark:text-slate-200">{selectedDay}</strong> · {currentDayStats.totalClasses} classes
            </span>
          ) : (
            <span className="hidden sm:inline">
              7-Day Weekly Grid · Click any cell to view or add
            </span>
          )}
        </div>
      </div>

      {/* ── Day View: Mobile-Optimized Day Picker & Vertical Agenda ── */}
      {viewMode === 'day' && (
        <div className="space-y-4">
          {/* Day Pills Bar */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
            {days.map((day) => {
              const isSelected = selectedDay === day;
              const isToday = day.toLowerCase() === todayName.toLowerCase();
              const stats = dayStats[day];
              const shortName = day.slice(0, 3);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`flex-1 min-w-[76px] sm:min-w-[90px] py-2.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all border snap-start relative ${
                    isSelected
                      ? 'text-white shadow-md border-transparent'
                      : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                  style={isSelected ? { backgroundColor: primaryColor } : {}}
                >
                  {isToday && (
                    <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                    }`}>
                      Today
                    </span>
                  )}

                  <span className="text-xs font-black uppercase tracking-wider">
                    {shortName}
                  </span>

                  {/* Class indicator dot / badge */}
                  <div className="flex items-center gap-1">
                    {stats?.totalClasses > 0 ? (
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                        isSelected 
                          ? 'bg-white/25 text-white' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {stats.totalClasses} {stats.totalClasses === 1 ? 'class' : 'classes'}
                      </span>
                    ) : (
                      <span className={`text-[9px] font-medium ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>
                        Free
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Agenda List for Selected Day */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs divide-y divide-slate-100 dark:divide-slate-800/80">
            {/* Header for Day */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900/60 dark:to-slate-950 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <span>{selectedDay} Schedule</span>
                  {selectedDay.toLowerCase() === todayName.toLowerCase() && (
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                      Active Day
                    </span>
                  )}
                </h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  {currentDayStats.totalClasses} {currentDayStats.totalClasses === 1 ? 'Class' : 'Classes'} · {currentDayStats.totalBreaks} Breaks
                </p>
              </div>

              {onEmptySlotClick && (
                <button
                  type="button"
                  onClick={() => onEmptySlotClick(selectedDay, periods[0]?.timeSlot || '08:30 - 09:30')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-2xs hover:shadow-xs transition-all active:scale-95"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Plus size={14} strokeWidth={2.5} />
                  <span>Add Class</span>
                </button>
              )}
            </div>

            {/* List of Time Slots */}
            <div className="p-3 sm:p-5 space-y-3">
              {periods.map((period) => {
                const subjects = period.subjects[selectedDay] || [];
                const isCurrent = isCurrentTimeSlot(selectedDay, period.timeSlot);
                const isClash = subjects.length > 1;

                return (
                  <div
                    key={period.id}
                    className={`rounded-2xl border transition-all p-3 sm:p-4 ${
                      isCurrent
                        ? 'ring-2 ring-blue-500/50 bg-blue-50/20 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900/60'
                        : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {/* Time Slot Row Header */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-black text-slate-600 dark:text-slate-300">
                        <Clock size={13} className="text-slate-400" />
                        <span>{formatSlotTo12Hour(period.timeSlot)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCurrent && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white animate-pulse shadow-xs">
                            <span className="size-1.5 rounded-full bg-white" />
                            Happening Now
                          </span>
                        )}

                        {isClash && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500 text-white shadow-xs">
                            <AlertTriangle size={11} />
                            Clash Detected
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Slot Content */}
                    {subjects.length > 0 ? (
                      <div className="space-y-2">
                        {subjects.map((sub, idx) => {
                          if (sub.isBreak) {
                            return (
                              <div
                                key={sub.id || idx}
                                className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 flex items-center justify-between gap-3"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="size-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-700 dark:text-amber-300">
                                    <Coffee size={16} />
                                  </div>
                                  <div>
                                    <p className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                                      {sub.breakLabel || 'Recess / Break'}
                                    </p>
                                    <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400/80">
                                      Scheduled Break Period
                                    </p>
                                  </div>
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-900/40 px-2 py-1 rounded-md">
                                  Break
                                </span>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={sub.id || idx}
                              onClick={() => onPeriodClick && onPeriodClick(sub.id)}
                              className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:shadow-md transition-all active:scale-[0.99] ${
                                isClash
                                  ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900'
                                  : sub.isAssigned
                                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
                                    : 'bg-amber-50/30 dark:bg-amber-950/20 border-dashed border-amber-300 dark:border-amber-800'
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                    {sub.name}
                                  </p>
                                  {!sub.isAssigned && (
                                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400">
                                      Substitute / Unassigned
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-400 flex-wrap">
                                  <span className="inline-flex items-center gap-1">
                                    <Users size={12} className="text-slate-400" />
                                    {sub.className}
                                  </span>
                                  <span>•</span>
                                  <span className="inline-flex items-center gap-1">
                                    <MapPin size={12} className="text-slate-400" />
                                    {sub.room || 'Room TBD'}
                                  </span>
                                </div>
                              </div>

                              <div className="self-end sm:self-center">
                                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-lg">
                                  Tap to Edit
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Free Slot in Day View */
                      <div
                        onClick={() => onEmptySlotClick && onEmptySlotClick(selectedDay, period.timeSlot)}
                        className="p-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600/60 bg-slate-50/40 dark:bg-slate-900/20 hover:bg-blue-50/20 transition-all flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                          <BookOpen size={14} />
                          <span className="text-xs font-bold uppercase tracking-wider">
                            Free Period
                          </span>
                        </div>
                        <button
                          type="button"
                          className="text-[10px] font-black uppercase tracking-wider text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center gap-1"
                        >
                          <Plus size={12} />
                          <span>Schedule Class</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Week Grid View: Desktop Table + Sticky Period Column for Mobile ── */}
      {viewMode === 'grid' && (
        <div className="space-y-2">
          {/* Mobile Horizontal Scroll Hint */}
          <div className="md:hidden flex items-center justify-between px-3 py-2 text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <span>← Scroll horizontally to see all 7 days →</span>
            <span className="font-mono text-[10px] uppercase">7 Days</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xs">
            <div
              className="grid"
              style={{
                gridTemplateColumns: `minmax(120px, 140px) repeat(${days.length}, minmax(180px, 1fr))`
              }}
            >
              {/* Header: Period Column (Sticky left) */}
              <div className="sticky left-0 z-30 p-3 sm:p-4 text-left text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-widest border-b border-r border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-[2px_0_6px_rgba(0,0,0,0.04)]">
                Period
              </div>

              {/* Header: Days */}
              {days.map((day) => {
                const isToday = day.toLowerCase() === todayName.toLowerCase();
                return (
                  <div
                    key={day}
                    className={`p-3 sm:p-4 text-left text-xs font-black uppercase tracking-widest border-b border-r border-slate-200 dark:border-slate-800 last:border-r-0 flex items-center justify-between ${
                      isToday
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-900/30'
                        : 'text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50'
                    }`}
                  >
                    <span>{day}</span>
                    {isToday && (
                      <span className="size-2 rounded-full bg-blue-500 animate-pulse block" />
                    )}
                  </div>
                );
              })}

              {/* Time Slots & Cells */}
              {periods.map((period) => (
                <React.Fragment key={period.id}>
                  {/* Sticky Time Slot Header */}
                  <div className="sticky left-0 z-20 p-3 sm:p-4 flex flex-col items-center justify-center text-slate-600 dark:text-slate-400 text-[11px] font-bold border-b border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center uppercase tracking-wider shadow-[2px_0_6px_rgba(0,0,0,0.04)]">
                    <span>{formatSlotTo12Hour(period.timeSlot)}</span>
                  </div>

                  {/* Day Cells */}
                  {days.map((day) => {
                    const subjects = period.subjects[day] || [];
                    const isCurrent = isCurrentTimeSlot(day, period.timeSlot);
                    const isClash = subjects.length > 1;

                    return (
                      <div
                        key={`${period.id}-${day}`}
                        className={`p-2 border-b border-r border-slate-200 dark:border-slate-800 last:border-r-0 relative transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 ${
                          isClash
                            ? 'bg-rose-50/40 dark:bg-rose-950/20'
                            : isCurrent
                              ? (subjects.some(s => s.isAssigned)
                                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 ring-2 ring-emerald-500/50 z-10'
                                  : 'bg-blue-50/40 dark:bg-blue-950/20 ring-2 ring-blue-500/50 z-10')
                              : ''
                        }`}
                        onClick={() => {
                          if (subjects.length > 0 && onPeriodClick) {
                            onPeriodClick(subjects[0].id);
                          } else if (onEmptySlotClick) {
                            onEmptySlotClick(day, period.timeSlot);
                          }
                        }}
                      >
                        {isCurrent && !isClash && (
                          <div className={`absolute top-1 right-1 flex items-center z-10 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full animate-pulse ${
                            subjects.some(s => s.isAssigned) ? 'bg-emerald-500' : 'bg-blue-500'
                          }`}>
                            Now
                          </div>
                        )}

                        {isClash && (
                          <div className="absolute top-1 right-1 flex items-center z-10 bg-rose-500 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full animate-pulse shadow-sm">
                            Clash
                          </div>
                        )}

                        {subjects.length > 0 ? (
                          <div className={`h-full min-h-[80px] flex flex-col gap-1.5 ${isClash ? 'p-1' : ''}`}>
                            {subjects.map((subject, idx) => (
                              <div
                                key={subject.id || idx}
                                className={`p-2.5 rounded-xl border flex flex-col justify-center h-full transition-all ${
                                  isClash
                                    ? 'border-rose-300 dark:border-rose-900 bg-white dark:bg-slate-900 shadow-xs'
                                    : subject.isBreak
                                      ? 'border-amber-200 dark:border-amber-900/40 bg-amber-50/70 dark:bg-amber-950/20 items-center text-center'
                                      : subject.isAssigned
                                        ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs'
                                        : 'border-dashed border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-950/20'
                                }`}
                              >
                                {subject.isBreak ? (
                                  <p className="text-[11px] text-amber-700 dark:text-amber-400 font-black uppercase tracking-wider text-center">
                                    {subject.breakLabel || 'Recess / Break'}
                                  </p>
                                ) : (
                                  <>
                                    <div className="flex items-start justify-between gap-1 mb-1">
                                      <p className={`text-xs font-black uppercase tracking-tight leading-tight ${
                                        subject.isAssigned ? 'text-emerald-900 dark:text-emerald-200' : 'text-slate-800 dark:text-white'
                                      }`}>
                                        {subject.name}
                                      </p>
                                      {!subject.isAssigned && !isClash && (
                                        <span className="shrink-0 px-1 py-0.2 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-[8px] font-black uppercase">
                                          Sub
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex flex-col gap-0.5">
                                      <p className={`text-[10px] font-bold ${
                                        subject.isAssigned ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
                                      }`}>
                                        {subject.className}
                                      </p>
                                      <p className={`text-[9px] font-black uppercase tracking-wider self-start px-1.5 py-0.5 rounded mt-0.5 ${
                                        subject.isAssigned 
                                          ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40' 
                                          : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                                      }`}>
                                        {subject.room || 'TBD'}
                                      </p>
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div
                            className={`h-full min-h-[80px] rounded-xl border-2 border-dashed transition-colors flex items-center justify-center ${
                              isCurrent
                                ? 'border-blue-400/60 dark:border-blue-500/40 bg-blue-50/10'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                            }`}
                          >
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-700">
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
      )}
    </div>
  );
};

export default TeacherTimetableGrid;
