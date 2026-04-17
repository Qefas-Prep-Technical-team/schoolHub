'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  CheckCircle2, 
  Award, 
  AlertCircle 
} from 'lucide-react';
import { StudentGrade } from './types';

interface GradeStatsCardsProps {
  grades: StudentGrade[];
}

const GradeStatsCards: React.FC<GradeStatsCardsProps> = ({ grades }) => {
  // Simple stats calculation
  const totalStudents = grades.length;
  const gradedCount = grades.filter(g => g.status === 'Graded').length;
  const completionRate = totalStudents > 0 ? Math.round((gradedCount / totalStudents) * 100) : 0;
  
  const avgPercentage = grades.length > 0 
    ? Math.round(grades.reduce((acc, current) => {
        const percentage = parseFloat(current.totalScore.replace('%', ''));
        return acc + (isNaN(percentage) ? 0 : percentage);
      }, 0) / totalStudents)
    : 0;

  const topPerformers = grades.filter(g => g.grade === 'A+' || g.grade === 'A').length;
  const pendingCount = grades.filter(g => g.status === 'Pending' || g.status === 'Missing').length;

  const stats = [
    {
      label: 'Class Average',
      value: `${avgPercentage}%`,
      icon: TrendingUp,
      color: 'blue',
      description: 'Overall class performance'
    },
    {
      label: 'Completion',
      value: `${completionRate}%`,
      icon: CheckCircle2,
      color: 'emerald',
      description: `${gradedCount} of ${totalStudents} graded`
    },
    {
      label: 'Top Students',
      value: topPerformers,
      icon: Award,
      color: 'purple',
      description: 'Students with A or above'
    },
    {
      label: 'To Review',
      value: pendingCount,
      icon: AlertCircle,
      color: 'amber',
      description: 'Pending or missing grades'
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
      {stats.map((stat, idx) => (
        <motion.div
          key={idx}
          variants={item}
          className="relative group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-5 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
        >
          {/* Background Decoration */}
          <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-${stat.color}-500/5 blur-2xl group-hover:bg-${stat.color}-500/10 transition-colors`} />
          
          <div className="flex items-start justify-between">
            <div className={`p-2.5 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/30 text-${stat.color}-600 dark:text-${stat.color}-400`}>
              <stat.icon size={22} />
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">{stat.value}</h3>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{stat.description}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default GradeStatsCards;
