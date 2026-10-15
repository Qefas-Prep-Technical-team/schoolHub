'use client';

import { motion } from 'framer-motion';
import { 
  Users, 
  GraduationCap, 
  Target, 
  Calendar, 
  TrendingUp,
  ArrowUpRight,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HeaderTooltip } from './HeaderTooltip';

interface InsightsGridProps {
  stats: {
    totalClasses: number;
    totalStudents: number;
    upcomingLessons: number;
    averagePerformance: number;
    attendanceRate: number;
  };
}

interface CardItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend: string;
  trendUp: boolean;
  sub: string;
  tooltip: string;
}

export default function InsightsGrid({ stats }: InsightsGridProps) {
  const cards: CardItem[] = [
    {
      label: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      trend: '+3.2%',
      trendUp: true,
      sub: 'vs last month',
      tooltip: 'Calculates the total number of students actively enrolled across all your assigned classes. Use this count to gauge your overall grading workload and ensure every student on your roster is accounted for in ongoing assessments.'
    },
    {
      label: 'Total Classes',
      value: stats.totalClasses,
      icon: GraduationCap, 
      trend: '+1.5%',
      trendUp: true,
      sub: 'vs last month',
      tooltip: 'Displays the active teaching sections and classrooms assigned to you this term. Use this to verify your section schedule and ensure class cohort materials are synchronized.'
    },
    {
      label: 'Avg Performance',
      value: `${stats.averagePerformance}%`,
      icon: Target,
      trend: '+0.8%',
      trendUp: true,
      sub: 'vs last month',
      tooltip: 'Aggregates cumulative scores across all completed assignments, quizzes, and exams in your assigned subjects. Use this baseline to quickly gauge whether classes are grasping current curriculum concepts or require targeted revision.'
    },
    {
      label: 'Upcoming Classes',
      value: stats.upcomingLessons,
      icon: Calendar,
      trend: '-2',
      trendUp: false,
      sub: 'vs last week',
      tooltip: 'Counts scheduled class periods remaining on your daily timetable. Use this to anticipate your upcoming lesson preparation and room transitions throughout the day.'
    },
    {
      label: 'Attendance Rate',
      value: `${stats.attendanceRate}%`,
      icon: TrendingUp,
      trend: '+0.4%',
      trendUp: true,
      sub: 'vs last month',
      tooltip: 'Tracks the percentage of students marked present across all your classes for the current period. A sudden dip highlights attendance anomalies before they affect academic outcomes.'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
      {cards.map((card, index) => (
        <InsightCard key={card.label} card={card} index={index} />
      ))}
    </div>
  );
}

function InsightCard({ card, index }: { card: CardItem; index: number }) {
  const { label, value, icon: Icon, trend, trendUp, sub, tooltip } = card;
  const isLast = index === 4;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "bg-white dark:bg-neutral-900 rounded-2xl p-3.5 sm:p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between transition-all",
        isLast && "col-span-2 md:col-span-2 lg:col-span-1"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2 sm:mb-4">
        <div className="flex items-center gap-1.5 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-1">{label}</p>
          <HeaderTooltip content={tooltip} size={12} />
        </div>
        <div className="p-1.5 sm:p-2 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shrink-0">
          <Icon size={14} className="sm:w-4 sm:h-4 text-slate-600 dark:text-slate-300" />
        </div>
      </div>

      <div className="space-y-1 mb-2 sm:mb-4">
        <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <div className={cn(
          "flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-md",
          trendUp 
            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' 
            : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
        )}>
          <ArrowUpRight size={10} className={cn("sm:w-3 sm:h-3", !trendUp && 'rotate-90')} />
          {trend}
        </div>
        <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">{sub}</p>
      </div>
    </motion.div>
  );
}
