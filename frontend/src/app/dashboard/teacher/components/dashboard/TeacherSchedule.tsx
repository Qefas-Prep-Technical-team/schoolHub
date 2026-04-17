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
      color: 'blue'
    },
    {
      id: '2',
      time: '10:15 AM',
      subject: 'Advanced Algebra',
      className: 'Grade 11B',
      room: 'Main Lab',
      status: 'current',
      color: 'primary'
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
      color: 'purple'
    }
  ];

  return (
    <div className="flex flex-col rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">Daily Timeline</h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Today's Sessions</p>
        </div>
        <button className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
        {schedule.map((item, idx) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative flex gap-6"
          >
            {/* Timeline Dot */}
            <div className={`mt-1.5 h-6 w-6 rounded-full border-4 border-white dark:border-slate-900 z-10 flex items-center justify-center shrink-0 ${
              item.status === 'current' ? 'bg-primary ring-4 ring-primary/20 scale-125' : 
              item.status === 'past' ? 'bg-slate-300 dark:bg-slate-700' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            }`} />

            <div className={`flex-1 rounded-2xl p-4 transition-all duration-300 hover:shadow-md ${
              item.status === 'current' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 
              'bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50'
            }`}>
              <div className="flex justify-between items-start mb-1">
                <span className={`text-[10px] font-black uppercase tracking-wider ${item.status === 'current' ? 'text-white/80' : 'text-slate-400'}`}>
                  {item.time}
                </span>
                {item.status === 'current' && (
                  <span className="text-[9px] font-black uppercase bg-white/20 px-2 py-0.5 rounded-full">In Progress</span>
                )}
              </div>
              <h4 className={`font-black text-base ${item.status === 'current' ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                {item.subject}
              </h4>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <Clock size={12} className={item.status === 'current' ? 'text-white/70' : 'text-slate-400'} />
                  <span className={`text-xs font-bold ${item.status === 'current' ? 'text-white/90' : 'text-slate-500'}`}>{item.className}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={12} className={item.status === 'current' ? 'text-white/70' : 'text-slate-400'} />
                  <span className={`text-xs font-bold ${item.status === 'current' ? 'text-white/90' : 'text-slate-500'}`}>{item.room}</span>
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
