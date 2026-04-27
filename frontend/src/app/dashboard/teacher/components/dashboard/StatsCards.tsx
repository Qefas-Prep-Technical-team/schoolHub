import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Activity 
} from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalClasses: number;
    totalStudents: number;
    upcomingLessons: number;
    averagePerformance?: number;
    attendanceRate?: number;
  };
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      label: 'My Classes',
      value: stats.totalClasses,
      icon: BookOpen,
      color: 'blue',
      description: 'Active teaching sections'
    },
    {
      label: 'My Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'emerald',
      description: 'Total student reach'
    },
    {
      label: 'Today\'s Lessons',
      value: stats.upcomingLessons,
      icon: Calendar,
      color: 'purple',
      description: 'Scheduled for today'
    },
    {
      label: 'Average Performance',
      value: `${stats.averagePerformance || 0}%`,
      icon: TrendingUp,
      color: 'amber',
      description: 'Class average'
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      {cards.map((card, idx) => (
        <motion.div
          key={idx}
          variants={item}
          className="relative group overflow-hidden rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl p-6 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-500"
        >
          {/* Decorative Background */}
          <div className={`absolute -right-6 -top-6 h-28 w-28 rounded-full bg-${card.color}-500/5 blur-3xl group-hover:bg-${card.color}-500/10 transition-colors duration-500`} />
          
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-2xl bg-${card.color}-500/10 text-${card.color}-600 dark:text-${card.color}-400 group-hover:scale-110 transition-transform duration-500`}>
              <card.icon size={24} strokeWidth={2.5} />
            </div>
          </div>
          
          <div className="relative">
            <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{card.value}</h3>
            <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
              {card.label}
            </p>
            <p className="text-[10px] font-bold text-slate-400/80 dark:text-slate-500/80 mt-2 line-clamp-1 italic">
              {card.description}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StatsCards;
