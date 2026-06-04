import { ArrowUpRight, BookOpen, Calendar, Clock, MapPin, MoreHorizontal, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export interface ClassItem {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  room: string;
  progress: number;
  assignmentsDue: number;
  nextSession: string;
  days: string[];
  description: string;
  color: string;
}

interface ClassCardProps {
  cls: ClassItem;
  idx: number;
}

export function ClassCard({ cls, idx }: ClassCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: idx * 0.05, duration: 0.4, ease: "easeOut" }}
      className="group relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/40 dark:border-slate-700/50 rounded-[3rem] p-8 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] transition-all duration-500 overflow-hidden"
    >
      {/* Visual Accent */}
      <div 
        className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-125 transition-all duration-1000 pointer-events-none"
      >
          <BookOpen size={240} style={{ color: cls.color }} />
      </div>

      <div className="absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ backgroundColor: cls.color }} />

      <div className="relative z-10 space-y-8">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
              <span 
                className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border shadow-sm backdrop-blur-md"
                style={{ color: cls.color, backgroundColor: `${cls.color}15`, borderColor: `${cls.color}20` }}
              >
                  {cls.subject}
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors tracking-tight leading-tight pt-3">
                 {cls.title}
              </h3>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700">
              <MoreHorizontal className="text-slate-400" />
          </Button>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
          {cls.description}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                  <User size={18} />
              </div>
              <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Teacher</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[100px]">{cls.teacher}</span>
              </div>
          </div>
          <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-500 group-hover:text-indigo-500 transition-colors">
                  <MapPin size={18} />
              </div>
              <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Classroom</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[100px]">{cls.room}</span>
              </div>
          </div>
        </div>

        {/* Progress & Session */}
        <div className="space-y-6 pt-5 border-t border-slate-200/50 dark:border-slate-700/50">
          <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">CA Score</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{cls.progress === 0 ? 'N/A' : `${cls.progress}%`}</span>
              </div>
              <div className="h-2 w-full bg-slate-200/50 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${cls.progress}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full rounded-full shadow-sm" 
                      style={{ backgroundColor: cls.color }}
                  />
              </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-[1.5rem] bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/60 dark:border-slate-700/50 shadow-sm">
              <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{cls.days.join(' • ')}</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: cls.color }}>
                  <Clock size={16} />
                  <span className="text-[10px] font-black tracking-tighter uppercase whitespace-nowrap">{cls.nextSession.split(' - ')[0]}</span>
              </div>
          </div>
        </div>

        {/* CTA */}
        <Link href={`/dashboard/student/my-classes/${cls.id}`} className="block">
            <Button className="w-full h-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-primary text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] group/btn transition-all shadow-sm hover:shadow-md">
                  Enter Class
                  <ArrowUpRight className="ml-2 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" size={16} />
            </Button>
        </Link>
      </div>
    </motion.div>
  );
}
