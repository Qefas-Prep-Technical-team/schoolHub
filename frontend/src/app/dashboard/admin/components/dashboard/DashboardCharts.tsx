'use client';

import React, { useMemo } from 'react';
import {
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Lock, Info } from 'lucide-react';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import StudentAttendanceOverviewCard from './StudentAttendanceOverviewCard';

interface DashboardChartsProps {
  schoolId?: string;
  stats?: {
    students?: number;
    totalStudents?: number;
    teachers?: number;
    classes?: number;
    exams?: number;
    subjects?: number;
  };
  analysis?: {
    averageScore: number;
    totalAssessments: number;
    subjectBreakdown?: { name: string; average: number }[];
    insight?: string;
  };
  hasPerformanceAccess?: boolean;
  primaryColor?: string;
}

export default function DashboardCharts({
  schoolId,
  stats,
  analysis,
  hasPerformanceAccess,
  primaryColor = '#2563eb',
}: DashboardChartsProps) {
  const academicData = useMemo(() => {
    if (!analysis || !analysis.subjectBreakdown)
      return [
        { name: 'High Performers', value: 0, color: primaryColor },
        { name: 'Average', value: 0, color: '#3b82f6' },
        { name: 'Review', value: 0, color: '#f59e0b' },
      ];

    const excellentCount = analysis.subjectBreakdown.filter(
      (s) => s.average >= 75
    ).length;
    const goodCount = analysis.subjectBreakdown.filter(
      (s) => s.average >= 50 && s.average < 75
    ).length;
    const atRiskCount = analysis.subjectBreakdown.filter(
      (s) => s.average < 50
    ).length;

    return [
      {
        name: 'High Performers (75%+)',
        value: excellentCount,
        color: primaryColor,
      },
      { name: 'Average (50-74%)', value: goodCount, color: '#3b82f6' },
      { name: 'Needs Review (<50%)', value: atRiskCount, color: '#f59e0b' },
    ];
  }, [analysis, primaryColor]);

  const totalAssessments = analysis?.totalAssessments || 0;
  const hasData = totalAssessments > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Student Attendance Overview (Real Backend Data: Week/Month/Term + Subject-to-Overall + By Grade) */}
      <StudentAttendanceOverviewCard
        schoolId={schoolId}
        stats={stats}
        primaryColor={primaryColor}
      />

      {/* Academic Performance */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm flex flex-col relative overflow-hidden">
        {!hasPerformanceAccess ? (
          <div className="absolute inset-0 z-20 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-12 h-12 bg-white dark:bg-slate-950 rounded-full flex items-center justify-center shadow-md mb-2">
              <Lock className="w-5 h-5 text-slate-400" />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                AI Performance Insights
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
                    Analyzes current academic data to surface automated,
                    data-driven recommendations and predictions regarding
                    school-wide educational health.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-xs text-slate-500">
              Upgrade your subscription to unlock deep AI-driven academic
              analytics.
            </p>
            <button
              className="px-5 py-2 text-white text-xs font-semibold rounded-full transition-colors mt-2"
              style={{ backgroundColor: primaryColor }}
            >
              Upgrade Plan
            </button>
          </div>
        ) : null}

        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-800 dark:text-white">
              Academic Performance
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
                  Maps the aggregate trajectory of average assessment scores
                  across all subjects and grades. A consistent drop may point to
                  systemic issues in recent curriculum delivery.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-xs text-slate-500">
            Average score distribution - {totalAssessments} records
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center relative my-6">
          <div className="h-[200px] w-full">
            {analysis ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={academicData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {academicData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="w-full h-full rounded-full opacity-20" />
            )}
          </div>
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-slate-800 dark:text-white">
              {hasData ? `${analysis?.averageScore}%` : 'N/A'}
            </span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
              Avg Grade
            </span>
          </div>
        </div>

        <div className="space-y-3 mt-auto">
          {academicData.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-600 dark:text-slate-300 text-xs">
                  {item.name}
                </span>
              </div>
              <span className="font-semibold text-slate-800 dark:text-white text-xs">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
