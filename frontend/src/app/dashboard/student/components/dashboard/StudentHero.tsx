'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Trophy, Calendar, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StudentHeroProps {
  username: string;
  selectedSchoolName?: string;
  termInfo?: string;
}

const StudentHero: React.FC<StudentHeroProps> = ({ 
  username, 
  selectedSchoolName = "Qefas Hub Academy",
  termInfo = "2023/24 - Second Term"
}) => {
  return (
    <section className="relative overflow-hidden rounded-[3rem] p-8 md:p-14 shadow-2xl border border-pink-100/50 dark:border-pink-900/20 bg-white dark:bg-slate-900 group">
      {/* Animated Background Elements */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-pink-500/10 dark:bg-pink-500/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-rose-500/10 dark:bg-rose-500/20 rounded-full blur-3xl animate-pulse delay-700 pointer-events-none" />
      
      {/* Abstract Design Pattern */}
      <div className="absolute top-0 right-0 p-12 opacity-[0.03] dark:opacity-[0.08] group-hover:scale-110 transition-transform duration-1000 pointer-events-none">
         <Trophy size={400} className="text-pink-600 -rotate-12" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
        <div className="space-y-6 max-w-2xl">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20 rounded-full px-5 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm backdrop-blur-md">
              Scholar Command
            </Badge>
            <div className="flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700/50 shadow-sm">
              <Star size={12} className="text-amber-500 fill-amber-500" />
              <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                Elite Status
              </span>
            </div>
          </div>
          
          <div className="space-y-1">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none italic uppercase">
              Keep Pushing, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-500 not-italic">
                {username || 'Scholar'}
              </span>
            </h1>
          </div>
          
          <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 font-bold max-w-xl leading-relaxed">
            Your educational journey at <span className="text-slate-900 dark:text-white font-black">{selectedSchoolName}</span> is evolving. Access your global performance benchmarks below.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
             <div className="flex items-center gap-3 bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-800 p-2 pr-6 rounded-2xl group/sub transition-all hover:scale-105">
                <div className="h-10 w-10 rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover/sub:rotate-12 transition-transform">
                    <Calendar size={20} />
                </div>
                <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Current Iteration</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{termInfo}</p>
                </div>
             </div>
          </div>
        </div>

        {/* Quick Identity Section */}
        <div className="hidden lg:flex flex-col items-end gap-6">
            <div className="relative group/id">
                <div className="absolute inset-0 bg-pink-500 rounded-[2rem] blur-2xl opacity-10 group-hover/id:opacity-20 transition-opacity" />
                <div className="relative h-24 w-24 rounded-[2rem] bg-gradient-to-br from-pink-500 to-rose-600 p-1">
                    <div className="h-full w-full rounded-[1.8rem] bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                        <span className="text-3xl font-black text-pink-600">
                          {username ? username.charAt(0).toUpperCase() : 'S'}
                        </span>
                    </div>
                </div>
                <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center shadow-2xl border-2 border-white dark:border-slate-900">
                    <Sparkles size={16} className="text-pink-500" />
                </div>
            </div>
            <div className="text-right space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Global ID</p>
                <p className="text-lg font-black text-slate-900 dark:text-white tracking-widest">#{username?.slice(0, 4).toUpperCase() || 'HUB'}-2024</p>
            </div>
        </div>
      </div>
    </section>
  );
};

export default StudentHero;
