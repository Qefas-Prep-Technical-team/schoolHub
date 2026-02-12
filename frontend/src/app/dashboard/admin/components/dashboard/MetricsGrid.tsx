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

export default function MetricsGrid() {
  const [metrics, setMetrics] = useState<any>([
    {
      id: 'students',
      title: 'Total Students',
      value: '1,240',
      icon: Users,
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-50 dark:bg-blue-900/30',
      trend: { value: '5%', isPositive: true },
    },
    {
      id: 'teachers',
      title: 'Total Teachers',
      value: '85',
      icon: GraduationCap,
      iconColor: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-50 dark:bg-purple-900/30',
      trend: { value: '0%', isPositive: false },
    },
    {
      id: 'classes',
      title: 'Total Classes',
      value: '42',
      icon: Building,
      iconColor: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-50 dark:bg-amber-900/30',
    },
    {
      id: 'subjects',
      title: 'Active Subjects',
      value: '18',
      icon: BookOpen,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-50 dark:bg-indigo-900/30',
    },
    {
      id: 'attendance',
      title: "Today's Attendance",
      value: '92%',
      icon: CalendarCheck,
      iconColor: 'text-teal-600 dark:text-teal-400',
      iconBg: 'bg-teal-50 dark:bg-teal-900/30',
      trend: { value: '2%', isPositive: false },
    },
    {
      id: 'exams',
      title: 'Ongoing Exams',
      value: '3',
      icon: FileText,
      iconColor: 'text-rose-600 dark:text-rose-400',
      iconBg: 'bg-rose-50 dark:bg-rose-900/30',
      badge: 'Urgent',
    },
  ]);

  // Simulate data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update attendance randomly
      setMetrics((prev: Metric[]) => prev.map((metric: Metric) => 
        metric.id === 'attendance' 
          ? { ...metric, value: `${Math.floor(Math.random() * 5) + 88}%` }
          : metric
      ));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {metrics.map((metric: MetricCardProps) => (
        <MetricCard key={metric?.id} {...metric} />
      ))}
    </div>
  );
}