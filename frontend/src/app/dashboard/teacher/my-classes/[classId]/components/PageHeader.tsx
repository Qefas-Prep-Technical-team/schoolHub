'use client';

import { Megaphone, GraduationCap, MapPin, Calendar, Users, Hash, Clock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface ClassData {
  name: string;
  subject: string;
  subjectCode: string;
  level: string;
  teacher: string;
  studentCount: number;
  academicYear: string;
  term: string;
  room?: string;
  schedule?: string;
}

interface PageHeaderProps {
  classData: ClassData;
  onAddAnnouncement: () => void;
}

export default function PageHeader({ classData, onAddAnnouncement }: PageHeaderProps) {
  const isSessionLoading = classData.academicYear === "Current Session";

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mb-8 overflow-hidden rounded-[3rem] bg-slate-900 shadow-2xl border border-white/10 flex flex-col"
    >
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-50%] right-[-20%] w-[80%] h-[200%] bg-emerald-600/30 blur-[150px] rounded-full mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute bottom-[-50%] left-[-10%] w-[60%] h-[150%] bg-emerald-600/20 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
      </div>

      <div className="relative z-10 p-10 md:p-14 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-5 flex-1 min-w-0">
          
          {/* Top Badges */}
          <div className="flex flex-wrap items-center gap-3">
             {isSessionLoading ? (
               <div className="h-8 w-40 bg-slate-800 rounded-xl animate-pulse"></div>
             ) : (
               <div className="px-4 py-1.5 bg-emerald-600/20 backdrop-blur-md border border-emerald-600/30 rounded-xl flex items-center gap-2">
                  <Sparkles size={14} className="text-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white whitespace-nowrap">
                     {classData.academicYear} • {classData.term}
                  </span>
               </div>
             )}
             
             <div className="px-4 py-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl flex items-center gap-2">
                <Hash size={14} className="text-slate-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-300">
                   {classData.subjectCode}
                </span>
             </div>
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-3">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter drop-shadow-2xl leading-none">
              {classData.name}
            </h1>
            <div className="flex items-center gap-3 text-lg md:text-xl font-bold text-slate-300">
              <span className="px-3 py-1 bg-white/10 rounded-lg text-emerald-400 backdrop-blur-sm border border-white/10">{classData.subject}</span>
              <span className="text-slate-600">•</span> 
              <span className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white">{classData.teacher.charAt(0)}</div> {classData.teacher}</span>
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddAnnouncement}
          className="shrink-0 flex items-center justify-center gap-3 h-14 px-8 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-2xl transition-all shadow-[0_0_30px_rgba(255,255,255,0.05)] border border-white/20 hover:border-white text-[11px] font-black uppercase tracking-[0.2em] backdrop-blur-md group"
        >
          <Megaphone className="w-5 h-5 text-emerald-400 group-hover:text-emerald-600 transition-colors" />
          <span>Announce</span>
        </motion.button>
      </div>

      {/* Meta Bar at bottom */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/10 border-t border-white/10 bg-slate-900/60 backdrop-blur-xl">
        <HeroMetaCard icon={Calendar} label="Session" value={isSessionLoading ? "Loading..." : classData.academicYear} />
        <HeroMetaCard icon={Users} label="Students" value={`${classData.studentCount} Enrolled`} />
        <HeroMetaCard icon={MapPin} label="Location" value={classData.room || "TBD"} />
        <HeroMetaCard icon={Clock} label="Schedule" value={classData.schedule || "Not Set"} />
      </div>
    </motion.div>
  );
}

function HeroMetaCard({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) {
    return (
        <div className="flex items-center gap-4 p-6 md:p-8 hover:bg-white/5 transition-all duration-300 group cursor-default">
            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 group-hover:text-white group-hover:scale-110 transition-all shadow-inner">
                <Icon size={20} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col overflow-hidden">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-emerald-400 transition-colors">{label}</span>
                <span className="text-sm font-bold text-white tracking-tight truncate">{value}</span>
            </div>
        </div>
    );
}