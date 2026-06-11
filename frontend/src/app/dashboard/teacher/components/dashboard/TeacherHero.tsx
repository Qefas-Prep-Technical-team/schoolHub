'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, GraduationCap, School, BookOpen } from 'lucide-react';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';

interface TeacherHeroProps {
  selectedSchoolName: string;
  isPersonal: boolean;
  totalClasses?: number;
  sessionName?: string;
  classNames?: string[];
}

export default function TeacherHero({ selectedSchoolName, isPersonal, totalClasses = 0, sessionName = "Session Not Set", classNames = [] }: TeacherHeroProps) {
  const { user } = useAuthStore();
  
  // Auto-slider for class names
  const [currentClassIndex, setCurrentClassIndex] = useState(0);
  
  useEffect(() => {
    if (classNames.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentClassIndex((prev) => (prev + 1) % classNames.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [classNames.length]);

  // Determine what to show in the session badge
  const showNoClassWarning = totalClasses === 0 && (isPersonal || sessionName === "Session Not Set");
  const displaySession = showNoClassWarning ? "No Class Connected" : sessionName;

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-emerald-600 to-teal-800 p-8 md:p-12 shadow-2xl mb-8 border border-white/10 group">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700 ease-in-out" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-48 h-48 bg-black/20 rounded-full blur-2xl group-hover:bg-black/30 transition-all duration-700 ease-in-out" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-emerald-400/0 via-white/5 to-teal-400/0 skew-y-12 blur-xl group-hover:opacity-75 transition-opacity duration-1000" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
      >
        <div className="space-y-4 max-w-2xl">
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-inner">
              {isPersonal ? "Global Registry" : "School Instance"}
            </div>
            {sessionName !== "Session Not Set" && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-white font-bold text-xs uppercase tracking-wider">
                <BookOpen size={14} />
                {displaySession}
              </div>
            )}
            
            {/* Fallback if no classes and no session */}
            {classNames.length === 0 && sessionName === "Session Not Set" && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-500/20 backdrop-blur-md border border-red-400/30 text-white font-bold text-xs uppercase tracking-wider">
                <BookOpen size={14} />
                No Class Connected
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
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
            
            {/* Auto-Slider for Class Names moved to the bottom */}
            {classNames.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-white font-bold text-xs uppercase tracking-wider relative overflow-hidden min-w-[200px] h-9">
                <GraduationCap size={14} />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentClassIndex}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute left-9 right-4 truncate"
                  >
                    {classNames[currentClassIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            )}
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
