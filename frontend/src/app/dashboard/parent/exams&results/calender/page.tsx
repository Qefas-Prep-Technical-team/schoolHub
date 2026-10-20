'use client';

import React, { useState, useMemo } from 'react';
import StatsOverview from './components/StatsOverview';
import CalendarGrid from './components/CalendarGrid';
import UpcomingPanel from './components/UpcomingPanel';
import { ExamEvent, CalendarEventType } from './components/types';
import { calculateCalendarStats, getGradeLetter } from './components/calendarUtils';
import { useParentStore } from '@/lib/api/hooks/useParentStore';
import { useParentChildren, useChildDetails } from '@/lib/api/hooks/useParentChildren';
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard';
import { format } from 'date-fns';
import {
  Calendar as CalendarIcon,
  RotateCw,
  ChevronLeft,
  User,
  GraduationCap,
} from 'lucide-react';
import Link from 'next/link';
import { HeaderTooltip } from '@/app/dashboard/parent/components/dashboard/HeaderTooltip';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | CalendarEventType>('all');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // 1. Linked children from API
  const { data: children = [], isLoading: isChildrenLoading } = useParentChildren();
  const { selectedChildId, setSelectedChildId } = useParentStore();

  const effectiveChildId = useMemo(() => {
    if (selectedChildId && children.some((c) => c.id === selectedChildId)) {
      return selectedChildId;
    }
    return children[0]?.id || '';
  }, [selectedChildId, children]);

  const activeChild = useMemo(() => {
    return children.find((c) => c.id === effectiveChildId) || children[0];
  }, [children, effectiveChildId]);

  // 2. Fetch real upcoming exams & child assessments
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    refetch: refetchDashboard,
  } = useParentDashboard(effectiveChildId || null);

  const {
    data: childDetails,
    isLoading: isDetailsLoading,
    refetch: refetchDetails,
  } = useChildDetails(effectiveChildId || null);

  const isInitialLoading = isChildrenLoading || isDashboardLoading || isDetailsLoading;

  // 3. Synthesize full event list from API
  const allEvents: ExamEvent[] = useMemo(() => {
    const list: ExamEvent[] = [];

    // Map upcoming exams
    if (dashboardData?.upcomingExams) {
      for (const ue of dashboardData.upcomingExams) {
        const d = ue.startDate ? new Date(ue.startDate) : new Date();
        list.push({
          id: `up-${ue.id}`,
          examId: ue.id,
          title: ue.title || 'Scheduled Exam',
          subject: ue.subject?.name || 'General',
          date: format(d, 'yyyy-MM-dd'),
          time: format(d, 'hh:mm a'),
          type: 'upcoming',
          category: ue.category || 'EXAM',
          durationMinutes: ue.durationMinutes,
        });
      }
    }

    // Map completed exams / graded assessments
    if (childDetails?.grades) {
      for (const g of childDetails.grades) {
        const d = g.createdAt ? new Date(g.createdAt) : new Date();
        const pct =
          g.maxMarks > 0 ? Math.round((g.score / g.maxMarks) * 100) : undefined;

        list.push({
          id: `comp-${g.id}`,
          examId: g.exam?.id,
          title: g.exam?.title || g.subjectPaper?.title || g.subject || 'Assessment',
          subject:
            g.subject ||
            g.subjectPaper?.subject?.name ||
            g.subjectPaper?.title ||
            'General Subject',
          date: format(d, 'yyyy-MM-dd'),
          time: format(d, 'hh:mm a'),
          type: 'completed',
          score: g.score,
          maxScore: g.maxMarks,
          percentage: pct,
          grade: pct !== undefined ? getGradeLetter(pct) : undefined,
          teacher: g.subjectPaper?.teacher?.name,
        });
      }
    }

    return list;
  }, [dashboardData?.upcomingExams, childDetails?.grades]);

  // 4. Compute real stats
  const stats = useMemo(() => calculateCalendarStats(allEvents), [allEvents]);

  // 5. Filter events for upcoming panel and selected date
  const upcomingEvents = useMemo(() => {
    return allEvents
      .filter((e) => e.type === 'upcoming')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [allEvents]);

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return allEvents.filter((e) => e.date === selectedDate);
  }, [allEvents, selectedDate]);

  // Manual refresh / sync handler
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await Promise.all([refetchDashboard(), refetchDetails()]);
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  return (
    <main className="w-full min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-12 transition-colors">
      <div className="w-full max-w-[98%] mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-5 sm:space-y-6">
        {/* Navigation Breadcrumb & Back */}
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/parent/exams&results"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Exams &amp; Results</span>
          </Link>
        </div>

        {/* Header and Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center flex-shrink-0">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Exam Calendar
              </h1>
              <HeaderTooltip
                content="View your child's complete assessment timeline. Track upcoming exams, scheduled quizzes, and review evaluated tests directly on the calendar grid or agenda list."
              />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Real-time schedule of tests, exams, and academic assessments for{' '}
              <strong className="text-slate-900 dark:text-white font-semibold">
                {activeChild?.name || 'Selected Student'}
              </strong>
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Child Selector */}
            {children.length > 0 && (
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-orange-600 dark:text-orange-400">
                  <User className="w-4 h-4" />
                </div>
                <select
                  value={effectiveChildId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                  className="appearance-none pl-9 pr-9 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer shadow-sm transition-all"
                >
                  {children.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.currentClass?.name ? `(${c.currentClass.name})` : ''}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
              </div>
            )}

            {/* Sync / Refresh */}
            <button
              onClick={handleSync}
              disabled={isSyncing}
              title="Refresh calendar data"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm transition-all cursor-pointer"
            >
              <RotateCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-orange-600' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>
          </div>
        </div>

        {/* Loading State or Real Calendar */}
        {isInitialLoading ? (
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-28 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4"
                />
              ))}
            </div>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 h-[540px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800" />
              <div className="w-full lg:w-80 h-[540px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800" />
            </div>
          </div>
        ) : (
          <>
            {/* Real Stats Overview */}
            <StatsOverview stats={stats} />

            {/* Main Calendar Grid and Upcoming Events Panel */}
            <div className="flex flex-col lg:flex-row gap-5 sm:gap-6 items-start">
              <CalendarGrid
                currentMonth={currentMonth}
                onMonthChange={setCurrentMonth}
                events={allEvents}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                filterType={filterType}
                onFilterChange={setFilterType}
              />

              <UpcomingPanel
                upcomingEvents={upcomingEvents}
                selectedDate={selectedDate}
                selectedDateEvents={selectedDateEvents}
                onClearDateSelection={() => setSelectedDate(null)}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
