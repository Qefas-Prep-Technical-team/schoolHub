'use client';

import React, { useState } from 'react';
import { CalendarDay, ExamEvent, CalendarEventType } from './types';
import { generateCalendarDays } from './calendarUtils';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List as ListIcon,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { addMonths, subMonths, format, isSameDay } from 'date-fns';
import Link from 'next/link';

interface CalendarGridProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  events: ExamEvent[];
  selectedDate: string | null;
  onSelectDate: (dateStr: string | null) => void;
  filterType: 'all' | CalendarEventType;
  onFilterChange: (type: 'all' | CalendarEventType) => void;
}

export default function CalendarGrid({
  currentMonth,
  onMonthChange,
  events,
  selectedDate,
  onSelectDate,
  filterType,
  onFilterChange,
}: CalendarGridProps) {
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');

  // Filter events according to active filter
  const filteredEvents = events.filter((e) => {
    if (filterType === 'all') return true;
    return e.type === filterType;
  });

  // Generate calendar days for current month
  const calendarDays: CalendarDay[] = generateCalendarDays(currentMonth, filteredEvents);

  const monthYearTitle = format(currentMonth, 'MMMM yyyy');

  const handlePrevMonth = () => {
    onMonthChange(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(addMonths(currentMonth, 1));
  };

  const handleGoToday = () => {
    const today = new Date();
    onMonthChange(today);
    onSelectDate(format(today, 'yyyy-MM-dd'));
  };

  // Group events for agenda view
  const sortedAgendaEvents = [...filteredEvents].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
      {/* Calendar Header Controls */}
      <div className="p-3.5 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-4">
          {/* Month / Agenda view toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={() => setViewMode('month')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Month</span>
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                viewMode === 'agenda'
                  ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>Agenda</span>
            </button>
          </div>

          {/* Month Stepper & Today button */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handlePrevMonth}
              aria-label="Previous Month"
              className="p-1.5 sm:p-2 rounded-xl hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200/60 dark:border-slate-700/60"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white min-w-[130px] sm:min-w-[150px] text-center">
              {monthYearTitle}
            </span>

            <button
              onClick={handleNextMonth}
              aria-label="Next Month"
              className="p-1.5 sm:p-2 rounded-xl hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200/60 dark:border-slate-700/60"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleGoToday}
              className="hidden md:inline-flex text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Today
            </button>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 flex-shrink-0 ${
              filterType === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onFilterChange('upcoming')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 flex-shrink-0 ${
              filterType === 'upcoming'
                ? 'bg-orange-600 text-white shadow-sm shadow-orange-500/20'
                : 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border border-orange-200/60 dark:border-orange-800/40 hover:bg-orange-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            Upcoming
          </button>
          <button
            onClick={() => onFilterChange('completed')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 flex-shrink-0 ${
              filterType === 'completed'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 hover:bg-emerald-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Completed
          </button>
        </div>
      </div>

      {/* Selected Date Banner when filtering by day */}
      {selectedDate && (
        <div className="px-4 py-2.5 bg-orange-50/70 dark:bg-orange-950/30 border-b border-orange-200/60 dark:border-orange-800/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-orange-900 dark:text-orange-300">
            <Sparkles className="w-4 h-4 text-orange-600 flex-shrink-0" />
            <span>
              Showing events for{' '}
              <strong className="font-bold">
                {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
              </strong>
            </span>
          </div>
          <button
            onClick={() => onSelectDate(null)}
            className="text-orange-700 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-200 font-semibold underline ml-2"
          >
            Show whole month
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {viewMode === 'month' ? (
        <div className="flex-1 flex flex-col overflow-x-auto">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 min-w-[580px]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="py-2.5 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="flex-1 grid grid-cols-7 bg-slate-100 dark:bg-slate-800/60 gap-[1px] min-w-[580px]">
            {calendarDays.map((day, idx) => {
              const isSelected = selectedDate === day.dateStr;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (day.hasEvents) {
                      onSelectDate(isSelected ? null : day.dateStr);
                    } else {
                      onSelectDate(day.dateStr);
                    }
                  }}
                  className={`min-h-[90px] sm:min-h-[110px] p-1.5 sm:p-2 bg-white dark:bg-slate-900 transition-all flex flex-col justify-between cursor-pointer ${
                    !day.isCurrentMonth ? 'opacity-40 bg-slate-50/50 dark:bg-slate-900/40' : ''
                  } ${
                    isSelected
                      ? 'ring-2 ring-orange-500 bg-orange-50/40 dark:bg-orange-950/20 z-10'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {/* Top Bar of cell: Date number & Today tag */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        day.isToday
                          ? 'bg-orange-600 text-white shadow-sm'
                          : isSelected
                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                          : day.isCurrentMonth
                          ? 'text-slate-700 dark:text-slate-300'
                          : 'text-slate-400 dark:text-slate-600'
                      }`}
                    >
                      {day.dayOfMonth}
                    </span>

                    {day.isToday && (
                      <span className="text-[9px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Events list within cell */}
                  <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                    {day.events.slice(0, 2).map((ev) => {
                      const isUpcoming = ev.type === 'upcoming';
                      return (
                        <div
                          key={ev.id}
                          title={`${ev.title} - ${ev.subject}`}
                          className={`px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold truncate flex items-center gap-1 transition-transform hover:scale-[1.02] ${
                            isUpcoming
                              ? 'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border border-orange-200/80 dark:border-orange-800/60'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                              isUpcoming ? 'bg-orange-500' : 'bg-emerald-500'
                            }`}
                          />
                          <span className="truncate">{ev.title}</span>
                        </div>
                      );
                    })}

                    {day.events.length > 2 && (
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 px-1">
                        +{day.events.length - 2} more
                      </span>
                    )}
                  </div>

                  {/* Bottom indicator dots on smaller displays */}
                  {day.hasEvents && (
                    <div className="flex items-center gap-1 mt-1 sm:hidden">
                      {day.events.slice(0, 3).map((e, i) => (
                        <span
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${
                            e.type === 'upcoming' ? 'bg-orange-500' : 'bg-emerald-500'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Agenda / Chronological List View */
        <div className="flex-1 p-3 sm:p-5 overflow-y-auto max-h-[600px] space-y-3">
          {sortedAgendaEvents.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500">
              <CalendarIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="font-medium text-sm">No scheduled events for this selection</p>
            </div>
          ) : (
            sortedAgendaEvents.map((event) => {
              const isUpcoming = event.type === 'upcoming';
              return (
                <div
                  key={event.id}
                  className="p-3.5 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-orange-300 dark:hover:border-orange-800/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isUpcoming
                          ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-800/40'
                          : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40'
                      }`}
                    >
                      {isUpcoming ? (
                        <Clock className="w-5 h-5" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {event.title}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isUpcoming
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                          }`}
                        >
                          {isUpcoming ? 'Upcoming' : 'Completed'}
                        </span>
                        {event.category && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {event.category}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {event.subject}
                        {event.teacher && ` • Teacher: ${event.teacher}`}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2">
                        <span className="flex items-center gap-1 font-medium">
                          <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                          {format(new Date(event.date), 'EEEE, MMM d, yyyy')}
                        </span>
                        {event.time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {event.time}
                          </span>
                        )}
                        {event.durationMinutes && (
                          <span>({event.durationMinutes} mins)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    {event.type === 'completed' && typeof event.score === 'number' && (
                      <div className="text-right">
                        <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {event.score} / {event.maxScore || 100}
                        </div>
                        {event.percentage !== undefined && (
                          <span className="text-[10px] font-semibold text-slate-500">
                            {event.percentage}%
                          </span>
                        )}
                      </div>
                    )}

                    {event.examId && (
                      <Link
                        href={`/dashboard/parent/exams&results/details?id=${event.examId}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/60 transition-colors"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
