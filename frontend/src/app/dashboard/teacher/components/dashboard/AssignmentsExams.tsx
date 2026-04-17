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
        return 'Pending Grading';
      case 'due_soon':
        return 'Due Soon';
      case 'recent':
        return 'Recently Submitted';
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Assignments & Exams
          </h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">Pending Management</p>
        </div>
        <button
          onClick={onViewAll}
          className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 hover:bg-primary/10 text-xs font-black uppercase tracking-widest text-primary transition-all active:scale-95"
        >
          View All
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="space-y-4">
        {assignments.map((assignment, idx) => (
          <motion.div
            key={assignment.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800/60 hover:shadow-lg transition-all duration-300 group"
          >
            {/* Icon */}
            <div className={`p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors`}>
              {assignment.icon === 'assignment' ? <FileText size={20} /> : <ClipboardList size={20} />}
            </div>

            {/* Content */}
            <div className="flex-1 ml-4 min-w-0">
              <p className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
                {assignment.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[10px] font-black uppercase tracking-tight text-slate-400 dark:text-slate-500 truncate">
                  {assignment.description}
                </p>
                {assignment.dueDate && (
                  <>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                      <Clock size={10} />
                      {new Date(assignment.dueDate).toLocaleDateString()}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Action/Status */}
            <div className="ml-4">
              {assignment.action ? (
                <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-90">
                  {assignment.action}
                </button>
              ) : (
                <span className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg border ${getStatusColor(assignment.status)}`}>
                  {getStatusText(assignment.status)}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {assignments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4 opacity-50">
            <ClipboardList className="w-10 h-10 text-slate-400" />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            No Pending Items
          </p>
        </div>
      )}
    </div>
  );
}