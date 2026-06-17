import { Eye, Edit, PlusCircle, Trash2, Calendar, FileText, BarChart3, Clock } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export interface Exam {
  id: string;
  title: string;
  status: string;
  createdAt: string | Date;
  totalMarks?: number;
  durationMinutes?: number;
  subject?: {
    name: string;
  };
  class?: {
    name: string;
  };
  exams?: any[];
  questions?: any[];
  subjectPapers?: any[];
}

interface ExamsTableProps {
  exams: Exam[];
  activeTab: 'exams' | 'quizzes' | 'subject-papers' | 'ca' | 'assignment';
  viewMode?: 'list' | 'grid';
  currentPage?: number;
  itemsPerPage?: number;
}

export default function ExamsTable({ exams, activeTab, viewMode = 'list', currentPage = 1, itemsPerPage = 10 }: ExamsTableProps) {
  const isSubjectPaperTab = activeTab === 'subject-papers';

  const getStatusStyles = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PUBLISHED':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'APPROVED':
      case 'COMPLETED':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'DRAFT':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  if (exams.length === 0) {
    const emptyLabel = activeTab === 'subject-papers' ? 'Subject Paper' : activeTab.slice(0, -1);
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="p-6 rounded-full bg-slate-100 dark:bg-slate-800 mb-6 opacity-50">
          <FileText className="w-12 h-12 text-slate-400" />
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">No {activeTab.replace('-', ' ')} Records</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xs text-sm font-bold uppercase tracking-widest leading-relaxed">
          Start by creating your first {emptyLabel} or adjust filters to see more results.
        </p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {exams.map((exam, idx) => {
          const baseIndex = (currentPage - 1) * itemsPerPage;
          const numStr = String(baseIndex + idx + 1).padStart(2, '0');
          
          return (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="group relative flex flex-col justify-between p-6 rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-500 min-h-[280px]"
            >
              {/* Header inside Card */}
              <div className="flex items-start justify-between gap-4">
                <div className={`p-3 rounded-[1.2rem] bg-primary/5 text-primary group-hover:scale-110 transition-transform duration-500`}>
                  <FileText size={20} strokeWidth={2.5} />
                </div>
                
                {/* Numbering and Status */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-400 dark:text-slate-600">
                    #{numStr}
                  </span>
                  <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] rounded-lg border ${getStatusStyles(exam.status)}`}>
                    {exam.status}
                  </span>
                </div>
              </div>

              {/* Title & Subjects */}
              <div className="mt-4 flex-1">
                <h4 className="text-base font-black text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                  {exam.title || exam.subject?.name || 'Untitled Paper'}
                </h4>
                
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    <BarChart3 size={9} />
                    {isSubjectPaperTab ? (exam.subject?.name || 'No Subject') : (exam.class?.name || 'All Classes')}
                  </div>
                  {isSubjectPaperTab && (exam.exams?.length || 0) > 0 && (
                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-primary/70 bg-primary/5 px-2 py-0.5 rounded-md">
                      <PlusCircle size={9} />
                      Linked: {exam.exams?.length}
                    </div>
                  )}
                </div>
              </div>

              {/* Metrics Divider */}
              <div className="my-4 border-t border-slate-100 dark:border-slate-800/50 pt-4 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="block text-xs font-black text-slate-900 dark:text-slate-100">{exam.totalMarks || 0}</span>
                  <span className="text-[8px] font-black uppercase tracking-tighter text-slate-400">Total Marks</span>
                </div>
                <div>
                  <span className="block text-xs font-black text-slate-900 dark:text-slate-100">
                    {isSubjectPaperTab ? (exam.questions?.length || 0) : (exam.subjectPapers?.length || 0)}
                  </span>
                  <span className="text-[8px] font-black uppercase tracking-tighter text-slate-400">
                    {isSubjectPaperTab ? 'Questions' : 'Papers'}
                  </span>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-0.5 text-xs font-black text-slate-900 dark:text-slate-100">
                    <Clock size={10} className="text-slate-400" />
                    {exam.durationMinutes || 'None'}
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-tighter text-slate-400">Mins</span>
                </div>
              </div>

              {/* Actions & Created Date */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100/50 dark:border-slate-800/30">
                <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                  <Calendar size={10} />
                  {new Date(exam.createdAt || '').toLocaleDateString()}
                </div>

                <div className="flex items-center gap-1.5">
                  <Link href={isSubjectPaperTab ? `/dashboard/teacher/exams&quizzes/preview?paperId=${exam.id}` : `/dashboard/teacher/exams&quizzes/preview`}>
                    <button className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary hover:bg-primary/10 transition-all active:scale-90" title="Preview">
                      <Eye size={14} strokeWidth={2.5} />
                    </button>
                  </Link>
                  <Link href={isSubjectPaperTab ? `/dashboard/teacher/exams&quizzes/add-question?paperId=${exam.id}` : `/dashboard/teacher/exams&quizzes/question-list`}>
                    <button className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary hover:bg-primary/10 transition-all active:scale-90" title="Edit">
                      <Edit size={14} strokeWidth={2.5} />
                    </button>
                  </Link>
                  <button className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-90" title="Delete">
                    <Trash2 size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Headers (Visual Only) */}
      <div className="hidden lg:flex items-center justify-between px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        <div className="flex-1 pl-12"># &nbsp;&nbsp;&nbsp; {isSubjectPaperTab ? 'Paper Details' : 'Assessment Details'}</div>
        <div className="flex items-center gap-20 px-10">
          <div className="w-20 text-center">Metrics</div>
          <div className="w-24 text-center">Status</div>
          <div className="w-32 text-right">Actions</div>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        {exams.map((exam, idx) => {
          const baseIndex = (currentPage - 1) * itemsPerPage;
          const numStr = String(baseIndex + idx + 1).padStart(2, '0');

          return (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group flex flex-col lg:flex-row items-center justify-between gap-6 p-6 md:p-8 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-500"
            >
              {/* Title & Context */}
              <div className="flex items-center gap-6 flex-1 min-w-0">
                {/* Numbering */}
                <div className="text-sm font-black text-slate-400 dark:text-slate-600 w-8 shrink-0">
                  #{numStr}
                </div>
                <div className={`p-4 rounded-[1.5rem] bg-primary/5 text-primary group-hover:scale-110 transition-transform duration-500`}>
                  <FileText size={24} strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-lg font-black text-slate-900 dark:text-slate-100 truncate group-hover:text-primary transition-colors">
                    {exam.title || exam.subject?.name || 'Untitled Paper'}
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                      <BarChart3 size={10} />
                      {isSubjectPaperTab ? (exam.subject?.name || 'No Subject') : (exam.class?.name || 'All Classes')}
                    </div>
                    {isSubjectPaperTab && (exam.exams?.length || 0) > 0 && (
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary/70 bg-primary/5 px-2 py-1 rounded-lg">
                        <PlusCircle size={10} />
                        Linked to {exam.exams?.length} Exam{(exam.exams?.length || 0) > 1 ? 's' : ''}
                      </div>
                    )}
                    <span className="text-slate-300 dark:text-slate-700 mx-1">•</span>
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <Calendar size={12} />
                      {new Date(exam.createdAt || '').toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="flex flex-wrap items-center gap-8 px-6 border-x border-slate-100 dark:border-slate-800/50">
                <div className="flex flex-col items-center">
                  <span className="text-sm font-black text-slate-900 dark:text-slate-100">{exam.totalMarks || 0}</span>
                  <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400">Total Marks</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                    {isSubjectPaperTab ? (exam.questions?.length || 0) : (exam.subjectPapers?.length || 0)}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400">
                    {isSubjectPaperTab ? 'Questions' : 'Papers'}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-sm font-black text-slate-900 dark:text-slate-100">
                    <Clock size={12} className="text-slate-400" />
                    {exam.durationMinutes || 'None'}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400">Mins</span>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-6">
                <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] rounded-xl border ${getStatusStyles(exam.status)}`}>
                  {exam.status}
                </span>

                <div className="flex items-center gap-2">
                  <Link href={isSubjectPaperTab ? `/dashboard/teacher/exams&quizzes/preview?paperId=${exam.id}` : `/dashboard/teacher/exams&quizzes/preview`}>
                    <button className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary hover:bg-primary/10 transition-all active:scale-90" title="Preview">
                      <Eye size={18} strokeWidth={2.5} />
                    </button>
                  </Link>
                  <Link href={isSubjectPaperTab ? `/dashboard/teacher/exams&quizzes/add-question?paperId=${exam.id}` : `/dashboard/teacher/exams&quizzes/question-list`}>
                    <button className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary hover:bg-primary/10 transition-all active:scale-90" title="Edit">
                      <Edit size={18} strokeWidth={2.5} />
                    </button>
                  </Link>
                  <button className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-90" title="Delete">
                    <Trash2 size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
