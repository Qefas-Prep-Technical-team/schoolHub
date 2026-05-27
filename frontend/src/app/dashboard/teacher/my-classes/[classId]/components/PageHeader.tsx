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
      className="relative mb-8 overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-xl border border-slate-800 flex flex-col"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-50%] right-[-10%] w-[60%] h-[150%] bg-primary/20 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 p-8 md:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-5 flex-1 min-w-0">
          
          {/* Top Badges */}
          <div className="flex flex-wrap items-center gap-3">
             {isSessionLoading ? (
               <div className="h-8 w-40 bg-slate-800 rounded-xl animate-pulse"></div>
             ) : (
               <div className="px-4 py-1.5 bg-primary/20 backdrop-blur-md border border-primary/30 rounded-xl flex items-center gap-2">
                  <Sparkles size={14} className="text-primary-light animate-pulse" />
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
          <div className="space-y-1">
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
              {classData.name}
            </h1>
            <p className="text-lg md:text-xl font-bold text-slate-400 flex items-center gap-2">
              <span className="text-primary-light">{classData.subject}</span>
              <span className="text-slate-600 px-1">•</span> 
              <span>Teacher: {classData.teacher}</span>
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddAnnouncement}
          className="shrink-0 flex items-center justify-center gap-2 h-14 px-8 bg-white text-slate-900 rounded-2xl hover:bg-slate-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] text-xs font-black uppercase tracking-widest"
        >
          <Megaphone className="w-4 h-4 text-primary" />
          <span>Announcement</span>
        </motion.button>
      </div>

      {/* Meta Bar at bottom */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-800 border-t border-slate-800 bg-slate-900/50 backdrop-blur-md">
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
        <div className="flex items-center gap-3 p-5 md:p-6 hover:bg-white/5 transition-colors group">
            <div className="p-2.5 bg-slate-800 rounded-xl text-slate-400 group-hover:text-primary-light transition-colors">
                <Icon size={18} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col overflow-hidden">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{label}</span>
                <span className="text-sm font-bold text-slate-200 truncate">{value}</span>
            </div>
        </div>
    );
}