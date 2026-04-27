'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, BookOpen, Star, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConsoleInsightsProps {
  gpa: string;
  examsTaken: string | number;
  credits: string;
}

const ConsoleInsights: React.FC<ConsoleInsightsProps> = ({ gpa, examsTaken, credits }) => {
  const stats = [
    { 
      label: "Academic GPA", 
      value: gpa, 
      icon: Trophy, 
      color: "text-amber-500", 
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      trend: "+0.2 this term"
    },
    { 
      label: "Global Exam Registry", 
      value: examsTaken, 
      icon: Target, 
      color: "text-pink-600", 
      bg: "bg-pink-500/10",
      border: "border-pink-500/20",
      trend: "All validated"
    },
    { 
      label: "Course Intensity", 
      value: credits, 
      icon: BookOpen, 
      color: "text-indigo-500", 
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
      trend: "Progressing"
    },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="group relative overflow-hidden bg-white dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 rounded-[2.5rem] p-8 transition-all duration-500 hover:shadow-2xl hover:border-pink-500/20 hover:-translate-y-1 shadow-sm"
        >
          {/* Subtle Ambient Hover Glow */}
          <div className={cn("absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700", stat.bg)} />
          
          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex justify-between items-start">
                <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg border backdrop-blur-md", stat.bg, stat.color, stat.border)}>
                    <stat.icon size={28} />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                    <TrendingUp size={10} className={stat.color} />
                    <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">{stat.trend}</span>
                </div>
            </div>
            
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{stat.label}</p>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">{stat.value}</p>
                {stat.label.includes('GPA') && <Star size={16} className="text-amber-500 fill-amber-500 mb-2 animate-pulse" />}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </section>
  );
};

export default ConsoleInsights;
