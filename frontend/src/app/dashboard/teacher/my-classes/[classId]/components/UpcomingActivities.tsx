import { Calendar, ArrowRight, Clock, AlertCircle, CheckCircle2, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';

interface Activity {
  id: string;
  title: string;
  type: 'quiz' | 'assignment' | 'exam' | 'project';
  date: string;
  description: string;
  status: 'upcoming' | 'overdue' | 'completed';
  icon: string;
  color: 'yellow' | 'orange' | 'red' | 'blue' | 'green';
}

interface UpcomingActivitiesProps {
  activities: Activity[];
  onViewAll: () => void;
}

export default function UpcomingActivities({ activities, onViewAll }: UpcomingActivitiesProps) {
  const getStatusStyles = (status: Activity['status']) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'overdue':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 shadow-xl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Clock className="text-primary" size={20} />
          Academic Deadlines
        </h2>
        <button
          onClick={onViewAll}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:gap-3 transition-all"
        >
          View All
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity, idx) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700/50"
          >
            <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-white dark:bg-slate-900 shadow-sm transition-transform group-hover:scale-110`}>
                 <Bookmark className="text-primary" size={22} strokeWidth={2.5} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                  {activity.title}
                </p>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  {activity.description}
                </p>
                <div className="flex items-center gap-4 mt-2">
                   <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400">
                      <Calendar size={12} className="text-primary" />
                      {activity.date}
                   </div>
                   <span className={`px-2.5 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-[0.1em] ${getStatusStyles(activity.status)}`}>
                      {activity.status}
                   </span>
                </div>
              </div>
            </div>
            <button className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-400 hover:text-primary transition-all active:scale-95">
               <ArrowRight size={18} strokeWidth={2.5} />
            </button>
          </motion.div>
        ))}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
               <CheckCircle2 className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No Pending Deadlines</p>
        </div>
      )}
    </div>
  );
}