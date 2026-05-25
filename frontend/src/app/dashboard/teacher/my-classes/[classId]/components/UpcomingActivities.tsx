import { Calendar, ArrowRight, Clock, CheckCircle2, Bookmark } from 'lucide-react';
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
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'overdue':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      default:
        return 'bg-slate-100 text-slate-500 dark:bg-slate-800';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40 dark:shadow-none">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Clock className="text-primary" size={20} />
          Academic Deadlines
        </h2>
        <button
          onClick={onViewAll}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary-dark transition-all"
        >
          View All
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="space-y-3">
        {activities.map((activity, idx) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <div className="flex items-center gap-5">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white dark:bg-slate-900 shadow-sm transition-transform group-hover:scale-110 border border-slate-100 dark:border-slate-800`}>
                 <Bookmark className="text-primary" size={18} strokeWidth={2.5} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-primary transition-colors">
                  {activity.title}
                </p>
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      <Calendar size={12} className="text-primary-light" />
                      {activity.date}
                   </div>
                   <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest ${getStatusStyles(activity.status)}`}>
                      {activity.status}
                   </span>
                </div>
              </div>
            </div>
            <button className="p-3 rounded-xl bg-white dark:bg-slate-900 text-slate-400 hover:text-primary hover:shadow-md transition-all active:scale-95 border border-slate-100 dark:border-slate-800">
               <ArrowRight size={16} strokeWidth={3} />
            </button>
          </motion.div>
        ))}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700">
               <CheckCircle2 className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No Pending Deadlines</p>
        </div>
      )}
    </div>
  );
}