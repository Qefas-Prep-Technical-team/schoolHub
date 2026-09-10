import { FileText, ArrowRight, CheckCircle2, AlertCircle, FileBox } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Submission {
  id: string;
  studentName: string;
  assignment: string;
  avatar: string;
  submittedDate: string;
  status: 'pending' | 'graded' | 'late';
  grade?: number;
}

interface RecentSubmissionsProps {
  submissions: Submission[];
  onGradeSubmission: (submissionId: string) => void;
  onViewAll: () => void;
}

export default function RecentSubmissions({ submissions, onGradeSubmission, onViewAll }: RecentSubmissionsProps) {
  const getStatusStyles = (status: Submission['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
      case 'graded':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      case 'late':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
      default:
        return 'bg-slate-100 text-slate-500 dark:bg-emerald-900/40';
    }
  };

  const getStatusIcon = (status: Submission['status']) => {
    switch (status) {
      case 'pending':
        return <AlertCircle size={10} />;
      case 'graded':
        return <CheckCircle2 size={10} />;
      case 'late':
        return <AlertCircle size={10} />;
    }
  };

  return (
    <div className="bg-white/70 dark:bg-emerald-950/40 backdrop-blur-3xl border border-slate-200/60 dark:border-emerald-800/50 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/5 blur-[80px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
          <FileText className="text-emerald-600" size={20} />
          Recent Submissions
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
        {submissions.map((submission, idx) => (
          <motion.div
            key={submission.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group flex items-center justify-between p-5 bg-white/40 dark:bg-emerald-900/30 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all border border-slate-200/50 dark:border-emerald-700/40 hover:border-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/5 cursor-pointer relative overflow-hidden"
          >
            {/* Hover Indicator */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex items-center gap-5 relative z-10">
              <div className="w-14 h-14 rounded-[1.25rem] overflow-hidden shadow-inner transition-transform group-hover:scale-110 group-hover:-rotate-3 border border-slate-200/50 dark:border-emerald-700/50">
                <Image
                  src={submission.avatar || `/users/user ${(idx % 6) + 1}.jpeg`}
                  alt={submission.studentName}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <p className="text-base font-black text-slate-900 dark:text-white tracking-tight group-hover:text-emerald-600 transition-colors">
                  {submission.studentName}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    {submission.assignment}
                  </span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="text-[9px] font-bold tracking-widest text-slate-400">
                    {submission.submittedDate}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                   <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest ${getStatusStyles(submission.status)}`}>
                      {getStatusIcon(submission.status)}
                      {submission.status}
                   </span>
                   {submission.grade && (
                     <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-600/10 px-2 py-0.5 rounded-md">
                       Grade: {submission.grade}%
                     </span>
                   )}
                </div>
              </div>
            </div>

            <button
              onClick={() => onGradeSubmission(submission.id)}
              className="relative z-10 flex items-center justify-center h-10 px-5 bg-white/50 dark:bg-emerald-950/50 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-emerald-600 hover:text-white hover:border-transparent transition-all border border-slate-200/50 dark:border-emerald-800/50 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm hover:shadow-md active:scale-95 group-hover:border-emerald-600/30"
            >
              {submission.status === 'graded' ? 'Review' : 'Grade'}
            </button>
          </motion.div>
        ))}
      </div>

      {submissions.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-50 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-emerald-700/50">
             <FileBox className="text-slate-300" size={24} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No recent submissions</p>
        </div>
      )}
    </div>
  );
}