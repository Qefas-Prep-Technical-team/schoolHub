'use client';

import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';
import {
  Info,
  BookOpen,
  GraduationCap,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Filter,
} from 'lucide-react';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useSchoolAttendanceOverview } from '@/lib/api/hooks/useSchool';

interface StudentAttendanceOverviewCardProps {
  schoolId?: string;
  stats?: {
    students?: number;
    totalStudents?: number;
  };
  primaryColor?: string;
}

type RangeTab = 'Week' | 'Month' | 'Term';
type ViewMode = 'trend' | 'subjects' | 'classes';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      day: string;
      fullDate: string;
      present: number;
      absent: number;
      late: number;
      excused: number;
      total: number;
      rate: number;
    };
  }>;
}

function CustomAttendanceTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0].payload;

  return (
    <div className="bg-slate-900 text-white dark:bg-slate-800 rounded-xl p-3.5 shadow-xl border border-slate-700/60 min-w-[180px] text-xs space-y-2">
      <div className="flex items-center justify-between border-b border-slate-700/70 pb-1.5">
        <div>
          <p className="font-bold text-white">{point.day}</p>
          {point.fullDate && point.fullDate !== point.day && (
            <p className="text-[10px] text-slate-400">{point.fullDate}</p>
          )}
        </div>
        <span
          className={cn(
            'px-2 py-0.5 rounded-full text-[10px] font-bold',
            point.rate >= 85
              ? 'bg-emerald-500/20 text-emerald-300'
              : point.rate >= 70
                ? 'bg-amber-500/20 text-amber-300'
                : point.total > 0
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'bg-slate-700 text-slate-300'
          )}
        >
          {point.total > 0 ? `${point.rate}%` : 'No logs'}
        </span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Present
          </span>
          <span className="font-bold text-white">{point.present}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            Absent
          </span>
          <span className="font-bold text-white">{point.absent}</span>
        </div>
        {(point.late > 0 || point.excused > 0) && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Late / Excused
            </span>
            <span className="font-bold text-white">
              {point.late + point.excused}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StudentAttendanceOverviewCard({
  schoolId: propSchoolId,
  stats,
  primaryColor = '#2563eb',
}: StudentAttendanceOverviewCardProps) {
  const { user } = useAuthStore();
  const schoolId =
    propSchoolId || user?.schools?.[0]?.schoolId || user?.tenantId || '';

  const [timeRange, setTimeRange] = useState<RangeTab>('Week');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('overall');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('trend');

  const rangeParam = timeRange.toLowerCase() as 'week' | 'month' | 'term';

  const { data: overview, isLoading } = useSchoolAttendanceOverview(schoolId, {
    range: rangeParam,
    subjectId: selectedSubjectId,
    classId: selectedClassId,
  });

  const chartData = useMemo(() => {
    if (overview?.chartData && overview.chartData.length > 0) {
      return overview.chartData;
    }

    const fallbackDays =
      timeRange === 'Month'
        ? ['Week 1', 'Week 2', 'Week 3', 'Week 4']
        : timeRange === 'Term'
          ? ['Month 1', 'Month 2', 'Month 3', 'Month 4']
          : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

    return fallbackDays.map((day) => ({
      day,
      fullDate: day,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      total: 0,
      rate: 0,
    }));
  }, [overview?.chartData, timeRange]);

  const subjectBreakdown = useMemo(
    () => overview?.subjectBreakdown ?? [],
    [overview?.subjectBreakdown]
  );

  const classBreakdown = useMemo(
    () => overview?.classBreakdown ?? [],
    [overview?.classBreakdown]
  );

  const summary = overview?.summary ?? {
    totalRecords: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    attendanceRate: 0,
  };

  const activeSubjectLabel = useMemo(() => {
    if (selectedSubjectId === 'overall') return 'Overall (Daily Arrival)';
    const found = overview?.availableSubjects?.find(
      (s) => s.id === selectedSubjectId
    );
    return found?.name || 'Selected Subject';
  }, [selectedSubjectId, overview?.availableSubjects]);

  const activeClassLabel = useMemo(() => {
    if (selectedClassId === 'all') return 'All Grades';
    const found = overview?.availableClasses?.find(
      (c) => c.id === selectedClassId
    );
    return found?.name || 'Selected Grade';
  }, [selectedClassId, overview?.availableClasses]);

  const totalEnrolled =
    overview?.totalStudents ?? stats?.students ?? stats?.totalStudents ?? 0;

  return (
    <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between">
      {/* Header Row: Title + Range Tabs (Week / Month / Term) */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-800 dark:text-white">
              Student Attendance Overview
            </h3>
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-slate-400 hover:text-primary transition-colors focus:outline-none"
                  >
                    <Info size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl"
                >
                  Tracks real-time student attendance across both Overall Daily
                  Arrival and individual Subjects across all grades. Switch
                  between Week, Month, and Term or inspect Subject-to-Overall
                  turnout directly.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeSubjectLabel} • {activeClassLabel} ({totalEnrolled} students)
          </p>
        </div>

        {/* Week / Month / Term Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full p-1 self-start shrink-0">
          {(['Week', 'Month', 'Term'] as RangeTab[]).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setTimeRange(range)}
              className={cn(
                'px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer',
                timeRange === range
                  ? 'text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              )}
              style={
                timeRange === range ? { backgroundColor: primaryColor } : {}
              }
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Scope Filters & View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800/80">
        {/* View Mode Sub-Tabs */}
        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
          <button
            type="button"
            onClick={() => setViewMode('trend')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              viewMode === 'trend'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            )}
          >
            <TrendingUp size={13} />
            <span>Daily Trend</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('subjects')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              viewMode === 'subjects'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            )}
          >
            <BookOpen size={13} />
            <span>Subject vs Overall</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('classes')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              viewMode === 'classes'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            )}
          >
            <GraduationCap size={13} />
            <span>By Grade</span>
          </button>
        </div>

        {/* Subject & Grade Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex items-center">
            <Layers
              size={13}
              className="absolute left-2.5 text-slate-400 pointer-events-none"
            />
            <select
              aria-label="Filter by Subject or Overall"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="pl-7 pr-6 py-1.5 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
            >
              <option value="overall">Overall (Daily Arrival)</option>
              {overview?.availableSubjects?.map((subj) => (
                <option key={subj.id} value={subj.id}>
                  Subject: {subj.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex items-center">
            <Filter
              size={13}
              className="absolute left-2.5 text-slate-400 pointer-events-none"
            />
            <select
              aria-label="Filter by Grade or Class"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="pl-7 pr-6 py-1.5 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
            >
              <option value="all">All Grades / Classes</option>
              {overview?.availableClasses?.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.enrolledStudents})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-3.5 py-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Attendance Rate
            </span>
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: primaryColor }}
            />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {summary.totalRecords > 0 ? `${summary.attendanceRate}%` : '0%'}
            </span>
            <span className="text-[10px] text-slate-400">
              ({summary.totalRecords} logs)
            </span>
          </div>
        </div>

        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/70 dark:border-emerald-900/40 rounded-2xl px-3.5 py-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
              Present
            </span>
            <CheckCircle2 size={13} className="text-emerald-500" />
          </div>
          <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mt-1">
            {summary.present}
          </p>
        </div>

        <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/70 dark:border-rose-900/40 rounded-2xl px-3.5 py-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-rose-700 dark:text-rose-300">
              Absent
            </span>
            <XCircle size={13} className="text-rose-500" />
          </div>
          <p className="text-lg font-bold text-rose-700 dark:text-rose-300 mt-1">
            {summary.absent}
          </p>
        </div>

        <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/70 dark:border-amber-900/40 rounded-2xl px-3.5 py-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-amber-700 dark:text-amber-300">
              Late / Excused
            </span>
            <Clock size={13} className="text-amber-500" />
          </div>
          <p className="text-lg font-bold text-amber-700 dark:text-amber-300 mt-1">
            {summary.late + summary.excused}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="h-[240px] w-full flex flex-col gap-3 justify-center">
          <Skeleton className="h-[200px] w-full rounded-2xl" />
        </div>
      ) : viewMode === 'trend' ? (
        <div className="space-y-4">
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 8, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={primaryColor}
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="95%"
                      stopColor={primaryColor}
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border-color, #f1f5f9)"
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <RechartsTooltip
                  content={<CustomAttendanceTooltip />}
                  cursor={{
                    stroke: '#cbd5e1',
                    strokeWidth: 1,
                    strokeDasharray: '4 4',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="present"
                  name="Present"
                  stroke={primaryColor}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorPresent)"
                />
                <Area
                  type="monotone"
                  dataKey="absent"
                  name="Absent"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAbsent)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Subject-to-Overall Pill Strip at bottom of Trend Chart */}
          {subjectBreakdown.length > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Subject to Overall Insight ({timeRange})
                </span>
                <button
                  type="button"
                  onClick={() => setViewMode('subjects')}
                  className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  View Full Breakdown →
                </button>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {subjectBreakdown.map((item) => {
                  const isSelected = selectedSubjectId === item.subjectId;
                  return (
                    <button
                      key={item.subjectId}
                      type="button"
                      onClick={() => setSelectedSubjectId(item.subjectId)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs whitespace-nowrap transition-all cursor-pointer shrink-0',
                        isSelected
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white font-semibold shadow-xs'
                          : 'bg-slate-50/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200/70 dark:border-slate-700/60 hover:bg-slate-100'
                      )}
                    >
                      <span>{item.subjectName}</span>
                      <span
                        className={cn(
                          'px-1.5 py-0.5 rounded-md text-[10px] font-bold',
                          item.total === 0
                            ? 'bg-slate-200/70 dark:bg-slate-700 text-slate-500'
                            : item.rate >= 85
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                              : item.rate >= 70
                                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300'
                                : 'bg-rose-500/20 text-rose-600 dark:text-rose-300'
                        )}
                      >
                        {item.total > 0 ? `${item.rate}%` : '—'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : viewMode === 'subjects' ? (
        /* Subject vs Overall Full Breakdown View */
        <div className="space-y-2.5 max-h-[270px] overflow-y-auto pr-1">
          {subjectBreakdown.map((item) => {
            const isOverall = item.subjectId === 'overall';
            const isSelected = selectedSubjectId === item.subjectId;
            return (
              <div
                key={item.subjectId}
                onClick={() => {
                  setSelectedSubjectId(item.subjectId);
                  setViewMode('trend');
                }}
                className={cn(
                  'p-3 rounded-2xl border transition-all cursor-pointer',
                  isOverall
                    ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200/70 dark:border-blue-900/50'
                    : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700',
                  isSelected && 'ring-2 ring-blue-500/30'
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full shrink-0',
                        isOverall ? 'bg-blue-600' : 'bg-emerald-500'
                      )}
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                      {item.subjectName}
                    </span>
                    {isOverall && (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-full">
                        Daily Roll Call
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-xs">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      {item.present} Present
                    </span>
                    <span className="text-rose-500 font-semibold">
                      {item.absent} Absent
                    </span>
                    {item.late + item.excused > 0 && (
                      <span className="text-amber-600 font-semibold">
                        {item.late + item.excused} Late
                      </span>
                    )}
                    <span className="font-bold text-slate-900 dark:text-white min-w-[38px] text-right">
                      {item.total > 0 ? `${item.rate}%` : 'No data'}
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-200/80 dark:bg-slate-700/60 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(0, item.rate))}%`,
                      backgroundColor: isOverall
                        ? primaryColor
                        : item.rate >= 80
                          ? '#10b981'
                          : item.rate >= 65
                            ? '#f59e0b'
                            : '#f43f5e',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* By Grade / Class Breakdown View */
        <div className="space-y-2.5 max-h-[270px] overflow-y-auto pr-1">
          {classBreakdown.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-xs text-slate-400">
              No classes found for this school.
            </div>
          ) : (
            classBreakdown.map((cls) => {
              const isSelected = selectedClassId === cls.classId;
              return (
                <div
                  key={cls.classId}
                  onClick={() => {
                    setSelectedClassId(
                      selectedClassId === cls.classId ? 'all' : cls.classId
                    );
                    setViewMode('trend');
                  }}
                  className={cn(
                    'p-3 rounded-2xl border bg-slate-50/70 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer',
                    isSelected && 'ring-2 ring-blue-500/30'
                  )}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                        {cls.className}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({cls.enrolledStudents} students)
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-xs">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        {cls.present} Present
                      </span>
                      <span className="text-rose-500 font-semibold">
                        {cls.absent} Absent
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white min-w-[38px] text-right">
                        {cls.total > 0 ? `${cls.rate}%` : 'No data'}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-200/80 dark:bg-slate-700/60 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(0, cls.rate))}%`,
                        backgroundColor:
                          cls.rate >= 80
                            ? primaryColor
                            : cls.rate >= 65
                              ? '#f59e0b'
                              : '#f43f5e',
                      }}
                    />
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

