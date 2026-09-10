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
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      case 'overdue':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      default:
        return 'bg-slate-100 text-slate-500 dark:bg-emerald-900/40';
    }
  };

  return (
    <div className="bg-white/70 dark:bg-emerald-950/40 backdrop-blur-3xl border border-slate-200/60 dark:border-emerald-800/50 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
          <Clock className="text-emerald-600" size={20} />
          Academic Deadlines
        </h2>
        <button
          onClick={onViewAll}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-800 transition-all"
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
            className="group flex items-center justify-between p-5 bg-white/40 dark:bg-emerald-900/30 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all border border-slate-200/50 dark:border-emerald-700/40 hover:border-amber-500/30 hover:shadow-xl hover:shadow-amber-500/5 cursor-pointer relative overflow-hidden"
          >
            {/* Hover Indicator */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex items-center gap-5 relative z-10">
              <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center bg-slate-50 dark:bg-emerald-950/50 shadow-inner transition-transform group-hover:scale-110 group-hover:rotate-3 border border-slate-200/50 dark:border-emerald-800/50`}>
                 <Bookmark className="text-emerald-600" size={18} strokeWidth={2.5} />
              </div>
              <div className="space-y-1">
                <p className="text-base font-black text-slate-900 dark:text-white tracking-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {activity.title}
                </p>
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      <Calendar size={12} className="text-emerald-400" />
                      {activity.date}
                   </div>
                   <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest ${getStatusStyles(activity.status)}`}>
                      {activity.status}
                   </span>
                </div>
              </div>
            </div>
            <button className="relative z-10 p-3 rounded-xl bg-white/50 dark:bg-emerald-950/50 text-slate-400 group-hover:text-amber-500 group-hover:shadow-md transition-all active:scale-95 border border-slate-200/50 dark:border-emerald-800/50">
               <ArrowRight size={16} strokeWidth={3} />
            </button>
          </motion.div>
        ))}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-50 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-emerald-700/50">
               <CheckCircle2 className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No Pending Deadlines</p>
        </div>
      )}
    </div>
  );
}