'use client';

import React from 'react';
import { CalendarStats } from './types';
import { CalendarClock, CheckCircle2, CalendarDays, Award } from 'lucide-react';

interface StatsOverviewProps {
  stats: CalendarStats;
  isLoading?: boolean;
}

export default function StatsOverview({ stats, isLoading = false }: StatsOverviewProps) {
  const statCards = [
    {
      title: 'Upcoming Exams',
      subtitle: 'Scheduled assessments',
      value: stats.upcomingCount,
      icon: CalendarClock,
      iconColor: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
      borderColor: 'border-orange-200/70 dark:border-orange-800/40',
      badge: stats.upcomingCount > 0 ? `${stats.upcomingCount} pending` : 'None',
      badgeColor: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    },
    {
      title: 'Completed Tests',
      subtitle: 'Taken & evaluated',
      value: stats.completedCount,
      icon: CheckCircle2,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      borderColor: 'border-emerald-200/70 dark:border-emerald-800/40',
      badge: stats.completedCount > 0 ? 'Recorded' : 'No records',
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    },
    {
      title: 'Total Tracked',
      subtitle: 'Assessments this term',
      value: stats.totalAssessments,
      icon: CalendarDays,
      iconColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      borderColor: 'border-blue-200/70 dark:border-blue-800/40',
      badge: 'All types',
      badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    },
    {
      title: 'Average Score',
      subtitle: 'Completed assessments',
      value: stats.completedCount > 0 && stats.averageScore > 0 ? `${stats.averageScore}%` : 'N/A',
      icon: Award,
      iconColor: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      borderColor: 'border-purple-200/70 dark:border-purple-800/40',
      badge: stats.completedCount > 0 && stats.averageScore >= 70 ? 'Good Standing' : 'In Progress',
      badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${card.bgColor} ${card.borderColor} border flex items-center justify-center flex-shrink-0`}
              >
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <span
                className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full ${card.badgeColor} truncate max-w-[110px]`}
              >
                {card.badge}
              </span>
            </div>

            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                {card.title}
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                {isLoading ? (
                  <div className="h-7 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                ) : (
                  <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {card.value}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">
                {card.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
