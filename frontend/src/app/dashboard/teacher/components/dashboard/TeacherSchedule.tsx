'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, MoreHorizontal } from 'lucide-react';

interface ScheduleItem {
  id: string;
  time: string;
  subject: string;
  className: string;
  room: string;
  status: 'past' | 'current' | 'upcoming';
  color: string;
}

interface TeacherScheduleProps {
  schedule?: any[];
}

const TeacherSchedule: React.FC<TeacherScheduleProps> = ({ schedule = [] }) => {
  const currentMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  // Process and sort real data
  const processedSchedule = schedule.map(item => {
    const [h, m] = (item.startTime || "00:00").split(':').map(Number);
    const startMins = h * 60 + m;
    
    let status: 'past' | 'current' | 'upcoming' = 'upcoming';
    // Assume a class is ~60 mins for status calculation if no end time logic is strict
    if (startMins <= currentMinutes && startMins > currentMinutes - 60) {
      status = 'current';
    } else if (startMins < currentMinutes) {
      status = 'past';
    }

    let formattedTime = item.time;
    if (formattedTime) {
      formattedTime = formattedTime.split('-').map((t: string) => {
        const [h, m] = t.trim().split(':').map(Number);
        if (isNaN(h)) return t.trim();
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
      }).join(' - ');
    }

    return {
      id: item.id,
      time: formattedTime,
      subject: item.title.split(' - ')[0] || item.title,
      className: item.type === 'class' ? (item.title.split(' - ')[1] || '') : 'Break',
      room: item.room,
      status,
      color: 'emerald',
      startMins
    };
  }).sort((a, b) => a.startMins - b.startMins);

  // Find the 4 periods closest to current time
  const futurePeriods = processedSchedule.filter(item => item.startMins >= currentMinutes - 60);
  const displaySchedule = futurePeriods.length >= 4 
    ? futurePeriods.slice(0, 4) 
    : processedSchedule.slice(-4);

  return (
    <div className="flex flex-col rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-neutral-900 p-8 shadow-2xl shadow-slate-200/40 dark:shadow-none h-full transition-all duration-500 hover:border-emerald-500/20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Timeline</h3>
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">Daily Agenda</p>
        </div>
        <button className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-600 transition-colors border border-slate-100 dark:border-slate-800">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-neutral-800">
        {displaySchedule.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No schedule found for today</p>
          </div>
        ) : displaySchedule.map((item, idx) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative flex gap-6"
          >
            {/* Timeline Dot */}
            <div className={`mt-2 h-8 w-8 rounded-full border-4 z-10 flex items-center justify-center shrink-0 shadow-lg ${
              item.status === 'current' ? 'border-emerald-600 bg-emerald-600 ring-4 ring-emerald-500/30 scale-110' : 
              item.status === 'past' ? 'border-white dark:border-neutral-900 bg-slate-200 dark:bg-neutral-800' : 'border-slate-100 dark:border-neutral-800 bg-white dark:bg-neutral-800'
            }`}>
               {item.status === 'current' && <div className="size-2 bg-white rounded-full animate-pulse" />}
            </div>

            <div className={`flex-1 rounded-[1.5rem] p-5 transition-all duration-500 group ${
              item.status === 'current' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20' : 
              'bg-slate-50 dark:bg-slate-800/30 border border-transparent hover:border-emerald-100 dark:hover:border-emerald-900/30'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-black uppercase tracking-widest ${item.status === 'current' ? 'text-emerald-100' : 'text-slate-400'}`}>
                  {item.time}
                </span>
                {item.status === 'current' && (
                  <span className="text-[8px] font-black uppercase bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">Now Live</span>
                )}
              </div>
              <h4 className={`font-black text-base lg:text-lg tracking-tight ${item.status === 'current' ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                {item.subject}
              </h4>
              <div className="flex items-center gap-4 mt-3">
                {item.className && (
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} className={item.status === 'current' ? 'text-emerald-100/70' : 'text-slate-400'} />
                    <span className={`text-[10px] font-bold uppercase tracking-tight ${item.status === 'current' ? 'text-white/90' : 'text-slate-500'}`}>{item.className}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <MapPin size={12} className={item.status === 'current' ? 'text-emerald-100/70' : 'text-slate-400'} />
                  <span className={`text-[10px] font-bold uppercase tracking-tight ${item.status === 'current' ? 'text-white/90' : 'text-slate-500'}`}>{item.room}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TeacherSchedule;
