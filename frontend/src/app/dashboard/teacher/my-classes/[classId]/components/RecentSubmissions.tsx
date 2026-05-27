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
        return 'bg-slate-100 text-slate-500 dark:bg-slate-800';
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40 dark:shadow-none">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <FileText className="text-primary" size={20} />
          Recent Submissions
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
        {submissions.map((submission, idx) => (
          <motion.div
            key={submission.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm transition-transform group-hover:scale-105 border border-slate-200 dark:border-slate-700">
                <Image
                  src={submission.avatar || `/users/user ${(idx % 6) + 1}.jpeg`}
                  alt={submission.studentName}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-primary transition-colors">
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
                     <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                       Grade: {submission.grade}%
                     </span>
                   )}
                </div>
              </div>
            </div>

            <button
              onClick={() => onGradeSubmission(submission.id)}
              className="flex items-center justify-center h-10 px-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl hover:bg-primary hover:text-white hover:border-transparent transition-all border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest shadow-sm active:scale-95"
            >
              {submission.status === 'graded' ? 'Review' : 'Grade'}
            </button>
          </motion.div>
        ))}
      </div>

      {submissions.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700">
             <FileBox className="text-slate-300" size={24} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No recent submissions</p>
        </div>
      )}
    </div>
  );
}