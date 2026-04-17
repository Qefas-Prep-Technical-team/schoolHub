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
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mb-12 overflow-hidden rounded-[3rem] bg-slate-900 shadow-2xl"
    >
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[120%] bg-primary/20 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[100%] bg-blue-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
      </div>

      <div className="relative z-10 p-8 md:p-12 lg:p-14 flex flex-col md:flex-row justify-between items-end gap-10">
        <div className="space-y-6 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
             <div className="px-4 py-1.5 bg-primary/20 backdrop-blur-xl border border-primary/30 rounded-xl flex items-center gap-2">
                <Sparkles size={14} className="text-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-light whitespace-nowrap">
                   Active Academic Session
                </span>
             </div>
             <div className="px-4 py-1.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl flex items-center gap-2">
                <Hash size={14} className="text-slate-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                   {classData.subjectCode}
                </span>
             </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-2xl">
              {classData.name}
            </h1>
            <p className="text-xl md:text-2xl font-bold text-slate-400 max-w-2xl flex items-center gap-3 italic">
              <GraduationCap className="text-primary" />
              {classData.subject} <span className="text-slate-700">|</span> {classData.teacher}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <HeroMetaItem icon={Calendar} label="Cycle" value={`${classData.academicYear} • ${classData.term}`} />
            <HeroMetaItem icon={Users} label="Enrollment" value={`${classData.studentCount} Students`} />
            {classData.room && <HeroMetaItem icon={MapPin} label="Location" value={classData.room} />}
            {classData.schedule && <HeroMetaItem icon={Clock} label="Timing" value={classData.schedule} />}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddAnnouncement}
          className="flex items-center justify-center gap-3 h-16 px-8 bg-white text-slate-900 rounded-2xl hover:bg-slate-100 transition-all shadow-2xl shadow-white/5 text-sm font-black uppercase tracking-widest whitespace-nowrap mb-2"
        >
          <Megaphone className="w-5 h-5 text-primary" />
          <span>New Announcement</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

function HeroMetaItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-slate-500">
                <Icon size={14} strokeWidth={2.5} />
                <span className="text-[9px] font-black uppercase tracking-[0.15em] leading-none">{label}</span>
            </div>
            <span className="text-sm font-bold text-slate-100 tracking-wide">{value}</span>
        </div>
    );
}