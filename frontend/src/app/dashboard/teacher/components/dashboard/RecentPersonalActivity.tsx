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
      color: 'blue',
      icon: UserPlus
    },
    {
      id: '3',
      type: 'message',
      title: 'New Message',
      description: 'Parent of Mike Wazowski sent a follow-up query.',
      time: 'Yesterday',
      color: 'purple',
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
    <div className="flex flex-col rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">Personal Feed</h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Unique to You</p>
        </div>
        <History size={18} className="text-slate-400" />
      </div>

      <div className="space-y-4">
        {activities.map((item, idx) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-300 group shadow-sm border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
          >
            <div className={`mt-1 h-10 w-10 shrink-0 rounded-xl flex items-center justify-center bg-${item.color}-500/10 text-${item.color}-500 group-hover:scale-110 transition-transform`}>
              <item.icon size={20} />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex justify-between items-start mb-0.5">
                <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 truncate">{item.title}</h4>
                <span className="text-[10px] font-bold text-slate-400 shrink-0">{item.time}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic line-clamp-2">
                "{item.description}"
              </p>
            </div>
          </motion.div>
        ))}
      </div>
      
      <button className="mt-6 w-full py-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95">
        View All Activity
      </button>
    </div>
  );
};

export default RecentPersonalActivity;
