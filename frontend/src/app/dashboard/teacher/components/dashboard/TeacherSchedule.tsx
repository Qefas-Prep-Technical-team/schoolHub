'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Coffee, BookOpen, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HeaderTooltip } from './HeaderTooltip';

interface TeacherScheduleProps {
  schedule?: any[];
}

const TeacherSchedule: React.FC<TeacherScheduleProps> = ({ schedule = [] }) => {
  const currentMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  // Process and sort real data
  const processedSchedule = schedule.map(item => {
    const [h, m] = (item.startTime || "00:00").split(':').map(Number);
    const startMins = (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
    
    let endMins = startMins + 60;
    if (item.endTime) {
      const [eh, em] = item.endTime.split(':').map(Number);
      if (!isNaN(eh) && !isNaN(em)) {
        endMins = eh * 60 + em;
      }
    }

    let status: 'past' | 'current' | 'upcoming' = 'upcoming';
    if (currentMinutes >= startMins && currentMinutes < endMins) {
      status = 'current';
    } else if (currentMinutes >= endMins) {
      status = 'past';
    }

    let formattedTime = item.time;
    if (formattedTime) {
      formattedTime = formattedTime.split('-').map((t: string) => {
        const [sh, sm] = t.trim().split(':').map(Number);
        if (isNaN(sh)) return t.trim();
        const ampm = sh >= 12 ? 'PM' : 'AM';
        const h12 = sh % 12 || 12;
        return `${h12}:${(sm ?? 0).toString().padStart(2, '0')} ${ampm}`;
      }).join(' - ');
    }

    const isFree = Boolean(item.isFree || item.type === 'free');
    const isBreak = item.type === 'break';
    const type: 'class' | 'break' | 'free' = isFree ? 'free' : isBreak ? 'break' : 'class';

    const subject = isFree
      ? 'Free Period'
      : isBreak
      ? item.title || item.subject || 'Break Time'
      : item.subject || (item.title ? item.title.split(' - ')[0] : 'Subject');

    const className = isFree
      ? 'Free'
      : isBreak
      ? 'Break'
      : item.className || (item.title && item.title.includes(' - ') ? item.title.split(' - ')[1] : '');

    const room = isFree
      ? item.room || 'Staff Room / Office'
      : isBreak
      ? 'Campus / Grounds'
      : item.room || 'Classroom';

    return {
      id: item.id || `schedule-${startMins}`,
      time: formattedTime,
      subject,
      className,
      room,
      status,
      type,
      isFree,
      startMins
    };
  }).sort((a, b) => a.startMins - b.startMins);

  const classesCount = processedSchedule.filter(i => i.type === 'class').length;
  const freeCount = processedSchedule.filter(i => i.isFree).length;

  return (
    <div className="flex flex-col rounded-2xl sm:rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-neutral-900 p-4 sm:p-6 md:p-8 shadow-2xl shadow-slate-200/40 dark:shadow-none h-full transition-all duration-500 hover:border-emerald-500/20">
      <div className="flex items-center justify-between mb-4 sm:mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Timeline</h3>
            <HeaderTooltip 
              content="Displays your daily teaching agenda across all classes you are assigned to. Highlights the specific subjects you teach and clearly marks free and break periods in your schedule." 
              size={14} 
            />
          </div>
          <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
            <p className="text-[9px] sm:text-[10px] font-black text-emerald-500 uppercase tracking-widest">Daily Agenda</p>
            {processedSchedule.length > 0 && (
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500">
                • {classesCount} {classesCount === 1 ? 'class' : 'classes'} {freeCount > 0 && `• ${freeCount} free`}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6 flex-1 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar relative before:absolute before:left-[11px] sm:before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-neutral-800 max-h-[460px]">
        {processedSchedule.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Clock size={20} />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No schedule found for today</p>
            <p className="text-xs text-slate-400/80 mt-1 font-medium">Timetable periods for your assigned classes will appear here.</p>
          </div>
        ) : processedSchedule.map((item, idx) => {
          const isLive = item.status === 'current';
          const isFree = item.isFree;
          const isBreak = item.type === 'break';

          return (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="relative flex gap-3 sm:gap-6"
            >
              {/* Timeline Dot */}
              <div className={`mt-1.5 sm:mt-2 h-6 w-6 sm:h-8 sm:w-8 rounded-full border-[3px] sm:border-4 z-10 flex items-center justify-center shrink-0 shadow-lg ${
                isLive
                  ? isFree
                    ? 'border-sky-600 bg-sky-600 ring-4 ring-sky-500/30 scale-110'
                    : isBreak
                    ? 'border-amber-600 bg-amber-600 ring-4 ring-amber-500/30 scale-110'
                    : 'border-emerald-600 bg-emerald-600 ring-4 ring-emerald-500/30 scale-110'
                  : item.status === 'past'
                  ? 'border-white dark:border-neutral-900 bg-slate-200 dark:bg-neutral-800'
                  : isFree
                  ? 'border-sky-200 dark:border-sky-900/60 bg-sky-50 dark:bg-sky-950/40'
                  : isBreak
                  ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40'
                  : 'border-slate-100 dark:border-neutral-800 bg-white dark:bg-neutral-800'
              }`}>
                {isLive && <div className="size-1.5 sm:size-2 bg-white rounded-full animate-pulse" />}
              </div>

              {/* Card Container */}
              <div className={`flex-1 rounded-xl sm:rounded-[1.5rem] p-3.5 sm:p-5 transition-all duration-500 group ${
                isLive
                  ? isFree
                    ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-xl shadow-sky-600/20'
                    : isBreak
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-xl shadow-amber-600/20'
                    : 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20'
                  : isFree
                  ? 'bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/40 hover:border-sky-300 dark:hover:border-sky-700/60'
                  : isBreak
                  ? 'bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 hover:border-amber-300 dark:hover:border-amber-700/60'
                  : 'bg-slate-50 dark:bg-slate-800/30 border border-transparent hover:border-emerald-100 dark:hover:border-emerald-900/30'
              }`}>
                <div className="flex justify-between items-start mb-1.5 sm:mb-2">
                  <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${
                    isLive ? 'text-white/80' : isFree ? 'text-sky-600 dark:text-sky-400' : isBreak ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'
                  }`}>
                    {item.time}
                  </span>
                  
                  {isLive ? (
                    <span className="text-[7px] sm:text-[8px] font-black uppercase bg-white/20 backdrop-blur-md px-1.5 sm:px-2 py-0.5 rounded-full border border-white/10">
                      {isFree ? 'Free Now' : isBreak ? 'Break Time' : 'Now Live'}
                    </span>
                  ) : isFree ? (
                    <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-wider bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300 px-2 py-0.5 rounded-full border border-sky-200/70 dark:border-sky-800/70">
                      Free Period
                    </span>
                  ) : isBreak ? (
                    <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200/70 dark:border-amber-800/70">
                      Break
                    </span>
                  ) : item.className ? (
                    <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-wider bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200/70 dark:border-emerald-800/70">
                      {item.className}
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  {isFree ? (
                    <Coffee size={16} className={cn("shrink-0", isLive ? "text-white" : "text-sky-500 dark:text-sky-400")} />
                  ) : isBreak ? (
                    <Sparkles size={16} className={cn("shrink-0", isLive ? "text-white" : "text-amber-500 dark:text-amber-400")} />
                  ) : (
                    <BookOpen size={16} className={cn("shrink-0", isLive ? "text-white" : "text-emerald-600 dark:text-emerald-400")} />
                  )}
                  <h4 className={`font-black text-sm sm:text-base lg:text-lg tracking-tight ${
                    isLive ? 'text-white' : isFree ? 'text-sky-950 dark:text-sky-100' : isBreak ? 'text-amber-950 dark:text-amber-100' : 'text-slate-900 dark:text-slate-100'
                  }`}>
                    {item.subject}
                  </h4>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-3">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <Clock size={11} className={cn("sm:w-3 sm:h-3", isLive ? 'text-white/80' : isFree ? 'text-sky-500/80' : isBreak ? 'text-amber-500/80' : 'text-slate-400')} />
                    <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-tight ${
                      isLive ? 'text-white/90' : isFree ? 'text-sky-700 dark:text-sky-300' : isBreak ? 'text-amber-700 dark:text-amber-300' : 'text-slate-500'
                    }`}>
                      {isFree ? 'No Class Assigned' : item.className || 'Session'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <MapPin size={11} className={cn("sm:w-3 sm:h-3", isLive ? 'text-white/80' : isFree ? 'text-sky-500/80' : isBreak ? 'text-amber-500/80' : 'text-slate-400')} />
                    <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-tight ${
                      isLive ? 'text-white/90' : isFree ? 'text-sky-700 dark:text-sky-300' : isBreak ? 'text-amber-700 dark:text-amber-300' : 'text-slate-500'
                    }`}>
                      {item.room}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TeacherSchedule;
