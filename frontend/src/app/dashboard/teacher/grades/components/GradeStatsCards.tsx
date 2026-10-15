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
import { HeaderTooltip } from "@/app/dashboard/teacher/components/dashboard/HeaderTooltip";

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

  const topPerformers = grades.filter(g => g.grade === 'A').length;
  const pendingCount = grades.filter(g => g.status === 'Pending' || g.status === 'Missing').length;

  const stats = [
    {
      label: 'Class Average',
      value: `${avgPercentage}%`,
      icon: TrendingUp,
      color: 'blue',
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      description: 'Overall class performance',
      tooltip: 'Measures the aggregated percentage score across all recorded assessments for this cohort. Use this to determine baseline mastery and evaluate overall class academic velocity.'
    },
    {
      label: 'Completion',
      value: `${completionRate}%`,
      icon: CheckCircle2,
      color: 'emerald',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      description: `${gradedCount} of ${totalStudents} graded`,
      tooltip: 'Percentage of evaluated records relative to total assigned scholars. Use this to track grading completion progress and ensure all submitted deliverables receive marks.'
    },
    {
      label: 'Top Students',
      value: topPerformers,
      icon: Award,
      color: 'purple',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      description: 'Students with A or above',
      tooltip: 'Count of scholars attaining the highest grade threshold (A or A+). Use this to identify advanced learners who may qualify for academic honors or extension projects.'
    },
    {
      label: 'To Review',
      value: pendingCount,
      icon: AlertCircle,
      color: 'amber',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      description: 'Pending or missing grades',
      tooltip: 'Deliverables currently in Pending or Missing evaluation status. Use this queue to eliminate unrecorded marks prior to term closing and transcript publishing deadlines.'
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
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8"
    >
      {stats.map((stat, idx) => (
        <motion.div
          key={idx}
          variants={item}
          className="relative group overflow-hidden rounded-2xl sm:rounded-3xl border border-emerald-100 dark:border-emerald-800/50 bg-white/60 dark:bg-emerald-950/20 backdrop-blur-md p-4 sm:p-5 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300 shadow-sm hover:shadow-emerald-500/10 flex flex-col justify-between"
        >
          {/* Top Row: Icon + Header Tooltip */}
          <div className="flex items-center justify-between">
            <div className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl ${stat.badgeColor} shrink-0`}>
              <stat.icon size={20} className="sm:size-5" />
            </div>
            <HeaderTooltip content={stat.tooltip} />
          </div>
          
          <div className="mt-3 sm:mt-4">
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
              {stat.label}
            </p>
            <div className="flex items-baseline gap-2 mt-0.5 sm:mt-1">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100">
                {stat.value}
              </h3>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 mt-1 truncate">
              {stat.description}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default GradeStatsCards;
