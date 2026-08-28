'use client';

import { SubjectPaper, examService } from '@/lib/api/services/examService';
import { FileText, User, Calendar, BookOpen, Trash2, ArrowRight, Layers } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import ConfirmationModal from '../components/ui/ConfirmationModal';

interface SubjectPaperCardProps {
  paper: SubjectPaper & { 
    subject?: { name: string }, 
    teacher?: { name: string },
    exam?: { title: string },
    _count?: { questions: number }
  };
  examId?: string;
  viewMode?: 'grid' | 'list';
  index?: number;
}

export default function SubjectPaperCard({ paper, examId: propExamId, viewMode = 'grid', index = 0 }: SubjectPaperCardProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const effectiveExamId = propExamId || paper.examId || 'none';

  const deleteMutation = useMutation({
    mutationFn: () => examService.deletePaper(effectiveExamId, paper.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-papers', effectiveExamId] });
      queryClient.invalidateQueries({ queryKey: ['subject-papers'] });
      toast.success('Subject paper deleted successfully');
      setIsDeleteModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete paper');
    }
  });

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
      case 'REVIEW': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
      case 'APPROVED': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
      case 'REJECTED': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
      case 'PUBLISHED': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const statusStyle = getStatusStyles(paper.status);

  const detailUrl = effectiveExamId !== 'none'
    ? `/dashboard/admin/exams/${effectiveExamId}/papers/${paper.id}`
    : `/dashboard/admin/exams/papers/${paper.id}`;

  if (viewMode === 'list') {
    return (
      <>
        <div className="group relative transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 lg:gap-8 border-l-4 border-transparent hover:border-purple-500/50">
          <Link href={detailUrl} className="absolute inset-0 z-0" />
          
          <div className="flex items-center gap-6 w-full sm:w-auto relative z-10 pointer-events-none">
            <div className="text-sm font-black text-slate-400 w-8 text-center shrink-0 hidden sm:block">
                #{index + 1}
            </div>
            
            <div className="h-12 w-12 rounded-2xl bg-purple-600 text-white shadow-purple-600/30 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
                <Layers size={20} strokeWidth={2.5} />
            </div>
            
            <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black text-slate-900 dark:text-white truncate flex items-center gap-2 transition-colors group-hover:text-purple-600 dark:group-hover:text-purple-400">
                    {paper.title || `${paper.subject?.name} Paper`}
                    <span className="sm:hidden text-xs text-slate-400 font-bold">#{index + 1}</span>
                </h3>
                
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                        <BookOpen size={12} className="text-purple-600 dark:text-purple-400" />
                        {paper.subject?.name || 'Unknown'}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                        <User size={12} className="text-purple-600 dark:text-purple-400" />
                        {paper.teacher?.name || 'Unassigned'}
                    </span>
                </div>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pl-20 sm:pl-0 relative z-10">
            <div className="flex gap-6 hidden md:flex">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Time</span>
                    <div className="flex items-center gap-1 text-sm font-black text-slate-700 dark:text-slate-300">
                        {paper.durationMinutes || 0}<span className="text-xs font-medium text-slate-400">m</span>
                    </div>
                </div>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 my-auto" />
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Score</span>
                    <div className="flex items-center gap-1 text-sm font-black text-slate-700 dark:text-slate-300">
                        {paper.totalMarks || 0}<span className="text-xs font-medium text-slate-400">pts</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl ${statusStyle} shadow-sm`}>
                    {paper.status}
                </span>

                <button 
                    onClick={handleDeleteClick}
                    className="p-2 z-20 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative pointer-events-auto"
                    aria-label="Delete paper"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
          </div>
        </div>

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={() => deleteMutation.mutate()}
          title="Delete Subject Paper"
          description={`Are you sure you want to delete "${paper.title}"? This will also permanently delete all associated questions.`}
          variant="danger"
          confirmText="Delete Paper"
          isLoading={deleteMutation.isPending}
        />
      </>
    );
  }

  return (
    <>
      <div className="relative rounded-3xl border border-purple-500/20 bg-gradient-to-br from-white to-purple-50 dark:from-slate-900 dark:to-purple-950/20 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-purple-500/50 hover:-translate-y-1.5 group">
        <Link href={detailUrl} className="absolute inset-0 z-0" />
        
        {/* Top decorative bar */}
        <div className="h-1.5 w-full bg-purple-500 absolute top-0 left-0" />

        <div className="p-7 relative z-10 pointer-events-none">
            <div className="flex justify-between items-start mb-6">
                <div className="p-3.5 rounded-2xl shadow-lg bg-purple-600 text-white shadow-purple-600/30 transition-transform duration-500 group-hover:-rotate-6">
                    <Layers className="h-6 w-6" strokeWidth={2.5} />
                </div>
                
                <div className="flex items-center gap-3 pointer-events-auto">
                    <span className={`px-3 py-1 text-[11px] font-black uppercase tracking-widest rounded-full ${statusStyle}`}>
                        {paper.status}
                    </span>
                    <button 
                        onClick={handleDeleteClick}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10"
                        aria-label="Delete paper"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="pointer-events-auto">
                <h3 className="font-black text-2xl mb-2 text-slate-900 dark:text-white line-clamp-1 transition-colors group-hover:text-purple-600 dark:group-hover:text-purple-400">
                    {paper.title || `${paper.subject?.name} Paper`}
                </h3>
            </div>

            <div className="grid grid-cols-2 gap-y-4 mt-6">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Subject</span>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                        <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="truncate">{paper.subject?.name || 'Unknown'}</span>
                    </div>
                </div>

                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Teacher</span>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                        <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="truncate">{paper.teacher?.name || 'Unassigned'}</span>
                    </div>
                </div>

                <div className="flex flex-col col-span-2 border-t border-slate-200 dark:border-white/10 pt-4 mt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Linked Exams</span>
                    {paper.exams && paper.exams.length > 0 ? (
                        <div className="flex items-center text-sm font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 px-3 py-2 rounded-xl">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span className="truncate">
                                {paper.exams.length === 1 
                                ? paper.exams[0].exam?.title
                                : `${paper.exams[0].exam?.title} (+${paper.exams.length - 1} more)`
                                }
                            </span>
                        </div>
                    ) : (
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md font-bold uppercase tracking-widest inline-block">
                            Standalone Paper
                        </span>
                    )}
                </div>
            </div>

            <div className="flex justify-between items-end mt-8 pt-5 border-t border-slate-200 dark:border-white/10 pointer-events-none">
                <div className="flex gap-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Time</span>
                        <div className="flex items-center gap-1.5 text-lg font-black text-slate-700 dark:text-slate-300">
                            {paper.durationMinutes || 0}<span className="text-sm font-medium text-slate-400">m</span>
                        </div>
                    </div>
                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 my-auto" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Score</span>
                        <div className="flex items-center gap-1.5 text-lg font-black text-slate-700 dark:text-slate-300">
                            {paper.totalMarks || 0}<span className="text-sm font-medium text-slate-400">pts</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-400 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                    <ArrowRight className="h-5 w-5" />
                </div>
            </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Subject Paper"
        description={`Are you sure you want to delete "${paper.title}"? This will also permanently delete all associated questions.`}
        variant="danger"
        confirmText="Delete Paper"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
