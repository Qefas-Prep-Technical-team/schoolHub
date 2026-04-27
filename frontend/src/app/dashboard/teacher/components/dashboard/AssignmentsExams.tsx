import { ArrowRight, FileText, ClipboardList, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface Assignment {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  status: 'pending' | 'due_soon' | 'recent';
  action: string | null;
  dueDate: string | null;
}

interface AssignmentsExamsProps {
  assignments: Assignment[];
  onViewAll: () => void;
}

export default function AssignmentsExams({ assignments, onViewAll }: AssignmentsExamsProps) {
  const getStatusColor = (status: Assignment['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'due_soon':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      case 'recent':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  const getStatusText = (status: Assignment['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending Grade';
      case 'due_soon':
        return 'Urgent';
      case 'recent':
        return 'Latest';
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 p-8 shadow-2xl shadow-slate-200/40 dark:shadow-none h-full transition-all duration-500 hover:border-emerald-500/20">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
            Curriculum <span className="text-emerald-600">Feed</span>
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mt-1.5 flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active Assessments
          </p>
        </div>
        <button
          onClick={onViewAll}
          className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-emerald-600 transition-all active:scale-95 border border-slate-100 dark:border-slate-800 hover:border-emerald-200"
        >
          Explore All
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="space-y-4 flex-1">
        {assignments.map((assignment, idx) => (
          <motion.div
            key={assignment.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center p-5 bg-slate-50/50 dark:bg-slate-800/30 rounded-[1.5rem] border border-transparent hover:border-emerald-100 dark:hover:border-emerald-900/30 hover:bg-white dark:hover:bg-slate-800/60 hover:shadow-xl transition-all duration-500 group"
          >
            {/* Icon */}
            <div className={`p-4 rounded-2xl bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110 shadow-sm transition-all duration-500`}>
              {assignment.icon === 'assignment' ? <FileText size={22} /> : <ClipboardList size={22} />}
            </div>

            {/* Content */}
            <div className="flex-1 ml-5 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                 <p className="font-black text-slate-900 dark:text-slate-100 text-base tracking-tight leading-none">
                  {assignment.title}
                </p>
                <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-full border ${getStatusColor(assignment.status)}`}>
                  {getStatusText(assignment.status)}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight truncate">
                  {assignment.description}
                </p>
                {assignment.dueDate && (
                  <>
                    <span className="text-slate-200 dark:text-slate-800">|</span>
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600/70 dark:text-emerald-400/70 uppercase">
                      <Clock size={11} />
                      {new Date(assignment.dueDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Action */}
            <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
               <button className="p-3 rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:scale-110 active:scale-95 transition-all">
                 <ArrowRight size={18} />
               </button>
            </div>
          </motion.div>
        ))}
      </div>

      {assignments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 mb-6 group-hover:scale-110 transition-transform duration-700">
            <ClipboardList className="w-12 h-12 text-slate-300 dark:text-slate-600" />
          </div>
          <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Focus Achieved</h4>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">All tasks synchronized</p>
        </div>
      )}
    </div>
  );
}
