'use client';

import { motion } from 'framer-motion';
import { Sparkles, GraduationCap, School, BookOpen } from 'lucide-react';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';

interface TeacherHeroProps {
  selectedSchoolName: string;
  isPersonal: boolean;
}

export default function TeacherHero({ selectedSchoolName, isPersonal }: TeacherHeroProps) {
  const { user } = useAuthStore();
  
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 p-8 md:p-12 text-white shadow-2xl shadow-emerald-500/20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8"
      >
        <div className="space-y-6 flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-widest">
            <Sparkles size={12} className="text-emerald-300" />
            Teacher Command Center
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Welcome back, <br />
              <span className="text-emerald-200">{user?.name?.split(' ')[0] || 'Educator'}!</span>
            </h1>
            <p className="text-emerald-50/70 font-medium text-lg max-w-xl leading-relaxed">
              Managing your academic ecosystem, tracking student growth, and organizing your curriculum in one high-performance interface.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white text-emerald-900 font-black text-xs uppercase tracking-wider shadow-lg">
              <School size={14} />
              {isPersonal ? "Global Insights" : selectedSchoolName}
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-white font-bold text-xs uppercase tracking-wider">
              <BookOpen size={14} />
              Academic Session 2023/24
            </div>
          </div>
        </div>

        <div className="hidden lg:block relative">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="size-64 rounded-[3rem] bg-gradient-to-tr from-white/10 to-transparent border border-white/10 backdrop-blur-2xl flex items-center justify-center relative overflow-hidden group"
          >
            <GraduationCap size={120} className="text-white/20 group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/20 to-transparent" />
          </motion.div>
          {/* Decorative Orbs */}
          <div className="absolute -top-4 -right-4 size-12 rounded-full bg-emerald-400 blur-2xl animate-pulse" />
          <div className="absolute -bottom-6 -left-6 size-16 rounded-full bg-teal-400/30 blur-2xl animate-pulse" />
        </div>
      </motion.div>

      {/* Background Abstract Layer */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 size-96 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 size-80 bg-teal-500/10 rounded-full blur-3xl opacity-50" />
    </div>
  );
}
