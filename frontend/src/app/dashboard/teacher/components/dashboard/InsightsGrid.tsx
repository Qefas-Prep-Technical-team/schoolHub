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
      label: 'Enrolled Students',
      value: stats.totalStudents,
      icon: Users,
      trend: '+12%',
      color: 'emerald',
      sub: 'Total Active'
    },
    {
      label: 'Assigned Classes',
      value: stats.totalClasses,
      icon: School, // Note: Replacing School with custom if needed, using GraduationCap for now
      trend: 'Normal',
      color: 'teal',
      sub: 'Current Load'
    },
    {
      label: 'Avg Performance',
      value: `${stats.averagePerformance}%`,
      icon: Target,
      trend: '+5.4%',
      color: 'emerald',
      sub: 'Class Growth'
    },
    {
      label: 'Lessons Planned',
      value: stats.upcomingLessons,
      icon: Calendar,
      trend: '-2',
      color: 'teal',
      sub: 'Upcoming Week'
    },
    {
      label: 'Attendance',
      value: `${stats.attendanceRate}%`,
      icon: TrendingUp,
      trend: 'Stable',
      color: 'emerald',
      sub: 'Daily Average'
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
  const { label, value, icon: Icon, trend, color, sub } = card;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none hover:border-emerald-500/30 transition-all duration-500 overflow-hidden"
    >
      <div className="relative z-10 flex flex-col h-full justify-between gap-4">
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-2xl ${color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-teal-50 text-teal-600'} dark:bg-emerald-500/10 group-hover:scale-110 transition-transform duration-500`}>
            <Icon size={20} />
          </div>
          <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
            <ArrowUpRight size={10} />
            {trend}
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</h3>
        </div>

        <div className="pt-2 border-t border-slate-50 dark:border-slate-800">
           <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter italic">{sub}</p>
        </div>
      </div>

      {/* Decorative Blob */}
      <div className="absolute -bottom-4 -right-4 size-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
    </motion.div>
  );
}

function School({ size }: { size: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  );
}
