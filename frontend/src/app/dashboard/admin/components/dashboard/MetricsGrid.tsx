/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Users, GraduationCap, Building, BookOpen, CalendarCheck, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import MetricCard, { MetricCardProps } from './MetricCard';

interface Metric {
  id: string;
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  badge?: string;
}

interface MetricsGridProps {
  stats?: {
    students: number;
    teachers: number;
    classes: number;
    exams: number;
    subjects: number;
  };
  isLoading?: boolean;
}

export default function MetricsGrid({ stats, isLoading }: MetricsGridProps) {
  const [metrics, setMetrics] = useState<any>([]);

  useEffect(() => {
    if (!stats) return;

    setMetrics([
      {
        id: 'students',
        title: 'Total Students',
        value: stats.students.toLocaleString(),
        icon: Users,
        iconColor: 'text-blue-600 dark:text-blue-400',
        iconBg: 'bg-blue-50 dark:bg-blue-900/30',
        trend: { value: 'Live', isPositive: true },
      },
      {
        id: 'teachers',
        title: 'Total Teachers',
        value: stats.teachers.toLocaleString(),
        icon: GraduationCap,
        iconColor: 'text-purple-600 dark:text-purple-400',
        iconBg: 'bg-purple-50 dark:bg-purple-900/30',
      },
      {
        id: 'classes',
        title: 'Total Classes',
        value: stats.classes.toLocaleString(),
        icon: Building,
        iconColor: 'text-amber-600 dark:text-amber-400',
        iconBg: 'bg-amber-50 dark:bg-amber-900/30',
      },
      {
        id: 'subjects',
        title: 'Active Subjects',
        value: stats.subjects.toLocaleString(),
        icon: BookOpen,
        iconColor: 'text-indigo-600 dark:text-indigo-400',
        iconBg: 'bg-indigo-50 dark:bg-indigo-900/30',
      },
      {
        id: 'attendance',
        title: "Institution Health",
        value: stats.students > 0 ? '98%' : '0%',
        icon: CalendarCheck,
        iconColor: 'text-teal-600 dark:text-teal-400',
        iconBg: 'bg-teal-50 dark:bg-teal-900/30',
        trend: { value: 'Optimal', isPositive: true },
      },
      {
        id: 'exams',
        title: 'Total Exams',
        value: stats.exams.toLocaleString(),
        icon: FileText,
        iconColor: 'text-rose-600 dark:text-rose-400',
        iconBg: 'bg-rose-50 dark:bg-rose-900/30',
      },
    ]);
  }, [stats]);

  // Loading skeletons could be handled here or by Parent
  if (isLoading || metrics.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {metrics.map((metric: MetricCardProps) => (
        <MetricCard key={metric?.id} {...metric} />
      ))}
    </div>
  );
}