'use client';

import { motion } from 'framer-motion';
import { 
  Users, 
  GraduationCap, 
  Target, 
  Calendar, 
  TrendingUp,
  ArrowUpRight,
  LucideIcon
} from 'lucide-react';

interface InsightsGridProps {
  stats: {
    totalClasses: number;
    totalStudents: number;
    upcomingLessons: number;
    averagePerformance: number;
    attendanceRate: number;
  };
}

export default function InsightsGrid({ stats }: InsightsGridProps) {
  const cards = [
    {
      label: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      trend: '+3.2%',
      trendUp: true,
      sub: 'vs last month'
    },
    {
      label: 'Total Classes',
      value: stats.totalClasses,
      icon: GraduationCap, 
      trend: '+1.5%',
      trendUp: true,
      sub: 'vs last month'
    },
    {
      label: 'Avg Performance',
      value: `${stats.averagePerformance}%`,
      icon: Target,
      trend: '+0.8%',
      trendUp: true,
      sub: 'vs last month'
    },
    {
      label: 'Upcoming Classes',
      value: stats.upcomingLessons,
      icon: Calendar,
      trend: '-2',
      trendUp: false,
      sub: 'vs last week'
    },
    {
      label: 'Attendance Rate',
      value: `${stats.attendanceRate}%`,
      icon: TrendingUp,
      trend: '+0.4%',
      trendUp: true,
      sub: 'vs last month'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {cards.map((card, index) => (
        <InsightCard key={index} card={card} index={index} />
      ))}
    </div>
  );
}

function InsightCard({ card, index }: { card: any, index: number }) {
  const { label, value, icon: Icon, trend, trendUp, sub } = card;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between"
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <div className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
          <Icon size={16} className="text-slate-600 dark:text-slate-300" />
        </div>
      </div>

      <div className="space-y-1 mb-4">
        <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
      </div>

      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${
          trendUp 
            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' 
            : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
        }`}>
          <ArrowUpRight size={12} className={!trendUp ? 'rotate-90' : ''} />
          {trend}
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500">{sub}</p>
      </div>
    </motion.div>
  );
}
