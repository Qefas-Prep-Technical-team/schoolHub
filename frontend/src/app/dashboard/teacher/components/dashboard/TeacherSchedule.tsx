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

const TeacherSchedule: React.FC = () => {
  // Mock schedule data for the vibrancy demo
  const schedule: ScheduleItem[] = [
    {
      id: '1',
      time: '08:30 AM',
      subject: 'Mathematics',
      className: 'Grade 10A',
      room: 'Room 204',
      status: 'past',
      color: 'emerald'
    },
    {
      id: '2',
      time: '10:15 AM',
      subject: 'Advanced Algebra',
      className: 'Grade 11B',
      room: 'Main Lab',
      status: 'current',
      color: 'emerald'
    },
    {
      id: '3',
      time: '01:30 PM',
      subject: 'Geometry',
      className: 'Grade 9C',
      room: 'Room 102',
      status: 'upcoming',
      color: 'emerald'
    },
    {
      id: '4',
      time: '03:00 PM',
      subject: 'Statistics',
      className: 'Grade 12A',
      room: 'Library',
      status: 'upcoming',
      color: 'emerald'
    }
  ];

  return (
    <div className="flex flex-col rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 p-8 shadow-2xl shadow-slate-200/40 dark:shadow-none h-full transition-all duration-500 hover:border-emerald-500/20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Timeline</h3>
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">Daily Agenda</p>
        </div>
        <button className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-600 transition-colors border border-slate-100 dark:border-slate-800">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800/50">
        {schedule.map((item, idx) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative flex gap-6"
          >
            {/* Timeline Dot */}
            <div className={`mt-2 h-8 w-8 rounded-full border-4 border-white dark:border-slate-900 z-10 flex items-center justify-center shrink-0 shadow-lg ${
              item.status === 'current' ? 'bg-emerald-600 ring-4 ring-emerald-500/20 scale-110' : 
              item.status === 'past' ? 'bg-slate-200 dark:bg-slate-700' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800'
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
                <div className="flex items-center gap-1.5">
                  <Clock size={12} className={item.status === 'current' ? 'text-emerald-100/70' : 'text-slate-400'} />
                  <span className={`text-[10px] font-bold uppercase tracking-tight ${item.status === 'current' ? 'text-white/90' : 'text-slate-500'}`}>{item.className}</span>
                </div>
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
