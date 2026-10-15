'use client';

import React from 'react';
import { BookOpen, Layers, Award, Trophy } from 'lucide-react';
import { HeaderTooltip } from '@/app/dashboard/student/components/dashboard/HeaderTooltip';

interface ClassStatsProps {
  totalClasses: number;
  totalSubjects: number;
  attemptsCount: number;
  classPosition: string | null;
}

export function ClassStats({ 
  totalClasses, 
  totalSubjects, 
  attemptsCount, 
  classPosition 
}: ClassStatsProps) {
  const stats = [
    { 
      title: 'Enrolled Classes', 
      value: totalClasses, 
      subtitle: 'Active Cohorts', 
      icon: <BookOpen className="w-5 h-5 text-pink-600 dark:text-pink-400" />,
      tooltip: 'Number of official class cohorts, homerooms, or grade levels you are currently assigned to.',
      accent: 'border-l-4 border-l-pink-500'
    },
    { 
      title: 'Active Subjects', 
      value: totalSubjects, 
      subtitle: 'Class Curriculum', 
      icon: <Layers className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400" />,
      tooltip: 'Total distinct academic curriculum courses and syllabus modules taught across your classes.',
      accent: 'border-l-4 border-l-fuchsia-500'
    },
    { 
      title: 'Exam Attempts', 
      value: attemptsCount, 
      subtitle: 'Completed Tests', 
      icon: <Award className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      tooltip: 'Total number of exam papers, class quizzes, and periodic continuous assessment assessments completed.',
      accent: 'border-l-4 border-l-rose-500'
    },
    { 
      title: 'Stream Position', 
      value: classPosition || '—', 
      subtitle: 'Cohort Standing', 
      icon: <Trophy className="w-5 h-5 text-amber-500" />,
      tooltip: 'Your verified class ranking position based on accumulated continuous assessment and examination scores.',
      accent: 'border-l-4 border-l-amber-500'
    },
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">Overview</h2>
          <HeaderTooltip content="Real-time academic summary aggregated across your enrolled classes, subjects, and examination logs." />
        </div>
      </div>
      
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className={`bg-white dark:bg-zinc-950/80 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-zinc-800 p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between ${stat.accent}`}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-50 dark:bg-zinc-900 flex items-center justify-center shrink-0">
                {stat.icon}
              </div>
              <HeaderTooltip content={stat.tooltip} />
            </div>
            <div>
              <p className="text-[11px] sm:text-xs font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-wider mb-1">
                {stat.title}
              </p>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {stat.value}
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-400 dark:text-zinc-500 font-medium mt-1">
                {stat.subtitle}
              </p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
