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
  subjectNames?: string[];
}

export default function TeacherHero({ 
  selectedSchoolName, 
  isPersonal, 
  totalClasses = 0, 
  sessionName = "Session Not Set", 
  classNames = [],
  subjectNames = []
}: TeacherHeroProps) {
  const { user } = useAuthStore();
  
  const displaySession = sessionName === "Session Not Set" ? "No Session" : sessionName;
  const greetingName = user?.name?.split(' ')[0] || 'Educator';

  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);

  useEffect(() => {
    if (subjectNames.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSubjectIndex((prev) => (prev + 1) % subjectNames.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [subjectNames.length]);

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">MONDAY • JUNE 29, 2026</p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Good morning, Teacher {greetingName} 👋
          </h1>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-[#1E293B] to-[#334155] shadow-sm border border-slate-800 flex flex-col md:flex-row">
        
        {/* Left Content */}
        <div className="flex-1 p-8 md:p-10 z-10">
          <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-white/90 font-medium text-xs mb-4">
            {displaySession} • {isPersonal ? "Global" : selectedSchoolName}
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Welcome back to {isPersonal ? "your Dashboard" : selectedSchoolName}
          </h2>
          
          <p className="text-slate-300 text-sm md:text-base max-w-lg mb-8 leading-relaxed">
            You have {totalClasses} classes assigned this term. Attendance is up 3.2% this week and students are performing well. Great momentum heading into mid-terms.
          </p>
          
          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 bg-white text-slate-900 font-semibold rounded-full text-sm hover:bg-slate-100 transition-colors shadow-sm">
              View weekly report
            </button>
            <button className="px-5 py-2.5 bg-transparent border border-white/20 text-white font-semibold rounded-full text-sm hover:bg-white/10 transition-colors">
              Announce
            </button>
          </div>
        </div>

        {/* Right Image & Subjects Slider */}
        <div className="hidden md:block w-1/3 relative overflow-hidden">
           <div 
             className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
             style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1000&auto=format&fit=crop")' }}
           />
           {/* Gradient fade to blend image into background */}
           <div className="absolute inset-0 bg-gradient-to-r from-[#334155] via-[#334155]/80 to-[#334155]/40" />
           
           <div className="absolute inset-0 flex flex-col items-end justify-center p-8 z-20">
             {subjectNames.length > 0 && (
               <div className="text-right">
                 <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Assigned Subjects</p>
                 <div className="h-10 relative w-48 overflow-hidden">
                   <AnimatePresence mode="popLayout">
                     <motion.div
                       key={currentSubjectIndex}
                       initial={{ y: 20, opacity: 0 }}
                       animate={{ y: 0, opacity: 1 }}
                       exit={{ y: -20, opacity: 0 }}
                       transition={{ duration: 0.5, ease: "easeOut" }}
                       className="absolute right-0 text-xl font-bold text-white whitespace-nowrap"
                     >
                       {subjectNames[currentSubjectIndex]}
                     </motion.div>
                   </AnimatePresence>
                 </div>
                 
                 {subjectNames.length > 1 && (
                   <div className="flex justify-end gap-1.5 mt-3">
                     {subjectNames.map((_, i) => (
                       <div 
                         key={i} 
                         className={`h-1.5 rounded-full transition-all duration-300 ${
                           i === currentSubjectIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/30'
                         }`}
                       />
                     ))}
                   </div>
                 )}
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
