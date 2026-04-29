'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  UserPlus, 
  MessageSquare, 
  AlertTriangle,
  History
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'grade' | 'enrollment' | 'message' | 'alert';
  title: string;
  description: string;
  time: string;
  color: string;
  icon: any;
}

const RecentPersonalActivity: React.FC = () => {
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'grade',
      title: 'Grading Complete',
      description: 'You graded 12 Algebra assignments for Grade 10A.',
      time: '2 hours ago',
      color: 'emerald',
      icon: CheckCircle2
    },
    {
      id: '2',
      type: 'enrollment',
      title: 'New Student',
      description: 'Sarah Jenkins joined your Calculus class.',
      time: '5 hours ago',
      color: 'emerald',
      icon: UserPlus
    },
    {
      id: '3',
      type: 'message',
      title: 'New Message',
      description: 'Parent of Mike Wazowski sent a follow-up query.',
      time: 'Yesterday',
      color: 'emerald',
      icon: MessageSquare
    },
    {
      id: '4',
      type: 'alert',
      title: 'Missing Grades',
      description: '3 students in Grade 9C missed the Midterm.',
      time: '2 days ago',
      color: 'amber',
      icon: AlertTriangle
    }
  ];

  return (
    <div className="flex flex-col rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 p-8 shadow-2xl shadow-slate-200/40 dark:shadow-none h-full transition-all duration-500 hover:border-emerald-500/20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Focus <span className="text-emerald-600">Feed</span></h3>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Personal Contextual Data</p>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800">
           <History size={20} className="text-slate-400" />
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {activities.map((item, idx) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center gap-5 p-4 rounded-[1.5rem] bg-slate-50/50 dark:bg-slate-800/30 border border-transparent hover:border-emerald-100 dark:hover:border-emerald-900/30 hover:bg-white dark:hover:bg-slate-800/60 transition-all duration-500 group"
          >
            <div className={`h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center ${
              item.color === 'emerald' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
            } group-hover:rotate-6 transition-transform duration-500`}>
              <item.icon size={20} />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-base font-black text-slate-900 dark:text-slate-100 truncate tracking-tight">{item.title}</h4>
                <span className="text-[9px] font-black uppercase text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-800 shrink-0">{item.time}</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed line-clamp-1 italic tracking-tight">
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
      
      <button className="mt-8 w-full py-4 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
        History Archives
      </button>
    </div>
  );
};

export default RecentPersonalActivity;
