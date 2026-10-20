'use client';

import React from 'react';
import { ExamEvent } from './types';
import { Clock, Calendar, ArrowRight, Lightbulb, X, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface UpcomingPanelProps {
  upcomingEvents: ExamEvent[];
  selectedDate: string | null;
  selectedDateEvents: ExamEvent[];
  onClearDateSelection: () => void;
}

export default function UpcomingPanel({
  upcomingEvents,
  selectedDate,
  selectedDateEvents,
  onClearDateSelection,
}: UpcomingPanelProps) {
  // If a date is selected, we show events on that day; otherwise we show nearest upcoming exams
  const isDateSelected = Boolean(selectedDate);
  const displayedEvents = isDateSelected ? selectedDateEvents : upcomingEvents.slice(0, 5);

  return (
    <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-5">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-4 sm:p-5 flex flex-col">
        {/* Panel Header */}
        <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {isDateSelected ? 'Day Schedule' : 'Next Up'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isDateSelected
                ? format(new Date(selectedDate!), 'MMM d, yyyy')
                : 'Upcoming assessments'}
            </p>
          </div>

          {isDateSelected ? (
            <button
              onClick={onClearDateSelection}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          ) : (
            <Link
              href="/dashboard/parent/exams&results"
              className="text-orange-600 dark:text-orange-400 text-xs font-semibold hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Event List */}
        <div className="flex flex-col gap-3">
          {displayedEvents.length === 0 ? (
            <div className="py-8 text-center text-slate-400 dark:text-slate-500">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="text-xs font-medium">
                {isDateSelected
                  ? 'No exams or tests recorded for this day.'
                  : 'No upcoming exams scheduled right now.'}
              </p>
            </div>
          ) : (
            displayedEvents.map((exam) => {
              const isUpcoming = exam.type === 'upcoming';
              return (
                <div
                  key={exam.id}
                  className="group flex flex-col p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-orange-50/50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700/60 hover:border-orange-200 dark:hover:border-orange-800/60 transition-all"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isUpcoming
                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200/60 dark:border-orange-800/40'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40'
                      }`}
                    >
                      {exam.category || (isUpcoming ? 'UPCOMING' : 'COMPLETED')}
                    </span>

                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {format(new Date(exam.date), 'MMM d')}
                    </span>
                  </div>

                  <h4 className="text-slate-900 dark:text-white font-bold text-sm tracking-tight group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {exam.title}
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 line-clamp-1">
                    {exam.subject}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-700/40">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exam.time || 'Schedule pending'}</span>
                    </div>

                    {exam.examId ? (
                      <Link
                        href={`/dashboard/parent/exams&results/details?id=${exam.examId}`}
                        className="text-orange-600 dark:text-orange-400 text-[11px] font-bold hover:underline flex items-center gap-0.5"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    ) : exam.type === 'completed' && exam.score !== undefined ? (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        {exam.score} / {exam.maxScore || 100}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Motivational Card */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200/60 dark:border-orange-900/30 rounded-xl p-3.5">
            <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 font-bold text-xs mb-1">
              <Lightbulb className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span>Parent Tip</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
              &quot;Consistent study habits and positive encouragement build confidence more than last-minute cramming.&quot;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
