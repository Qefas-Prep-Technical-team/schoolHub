'use client';

import { SubjectPaper, examService } from '@/lib/api/services/examService';
import { 
  FileText, 
  User, 
  Calendar, 
  BookOpen, 
  Trash2, 
  Loader2, 
  Zap, 
  Clock, 
  Target, 
  ArrowRight,
  ShieldCheck,
  Workflow
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSchoolSettings } from '@/lib/api/hooks/useSchool';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';

interface SubjectPaperCardProps {
  paper: SubjectPaper & { 
    subject?: { name: string }, 
    teacher?: { name: string },
    exam?: { title: string },
    exams?: any[],
    _count?: { questions: number }
  };
  examId?: string;
}

const statusStyles = {
    DRAFT: 'bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    REVIEW: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    APPROVED: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    REJECTED: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
    PUBLISHED: 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
};

export default function SubjectPaperCard({ paper, examId: propExamId }: SubjectPaperCardProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  const { data: settings } = useSchoolSettings(schoolId);
  const primaryColor = settings?.themeColor || '#ea580c';

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

  const detailUrl = effectiveExamId !== 'none'
    ? `/dashboard/admin/exams/${effectiveExamId}/papers/${paper.id}`
    : `/dashboard/admin/exams/papers/${paper.id}`;

  return (
    <>
      <div 
        className="group relative bg-white dark:bg-slate-900/40 backdrop-blur-3xl border border-slate-100 dark:border-white/5 rounded-[3.5rem] p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col h-full"
        onClick={() => (window.location.href = detailUrl)}
      >
        {/* Ambient Glow */}
        <div 
          className="absolute -right-10 -top-10 w-48 h-48 rounded-full blur-[80px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none" 
          style={{ backgroundColor: primaryColor }}
        />

        <div className="flex justify-between items-start mb-10 relative z-10">
          <div className="flex items-center gap-5">
            <div 
                className="size-16 rounded-[1.5rem] bg-slate-50 dark:bg-white/5 flex items-center justify-center p-4 text-slate-400 group-hover:scale-110 transition-all duration-500 border border-slate-100 dark:border-white/5 shadow-inner"
                style={{ color: primaryColor }}
            >
              <FileText className="size-full" strokeWidth={2.5} />
            </div>
            <div className="space-y-1">
                <div className={cn(
                    "inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                    statusStyles[paper.status as keyof typeof statusStyles] || statusStyles.DRAFT
                )}>
                    {paper.status}
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                     MODULE NODE
                </div>
            </div>
          </div>

          <Button 
            onClick={handleDeleteClick}
            variant="ghost" 
            size="icon" 
            className="size-12 rounded-2xl bg-slate-50/50 dark:bg-white/5 border border-transparent hover:border-rose-100 hover:text-rose-600 dark:hover:border-rose-500/20 transition-all shadow-sm"
          >
            <Trash2 size={18} />
          </Button>
        </div>

        <div className="flex-1 relative z-10">
          <h3 
            className="text-2xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-primary transition-colors leading-[1.1] uppercase tracking-tighter"
            style={{ '--primary': primaryColor } as any}
          >
            {paper.title || `${paper.subject?.name} Assessment`}
          </h3>
          <div className="flex items-center gap-3 mb-8">
            <div className="size-6 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <BookOpen size={12} strokeWidth={2.5} />
            </div>
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                {paper.subject?.name || 'Institutional Core'}
            </span>
          </div>
        </div>
        
        <div className="space-y-6 pt-8 border-t border-slate-50 dark:border-white/5 relative z-10">
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Faculty lead</span>
                  <div className="flex items-center gap-2">
                       <User size={12} className="text-indigo-500" />
                       <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase truncate max-w-[100px]">
                          {paper.teacher?.name || 'Unassigned'}
                       </span>
                  </div>
              </div>
              <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Registry Sync</span>
                  <div className="flex items-center gap-2">
                       <Workflow size={12} className="text-emerald-500" />
                       <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">
                          {paper.exams?.length || 0} Nodes
                       </span>
                  </div>
              </div>
          </div>

          <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Temporal</span>
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">{paper.durationMinutes || 0} MINS</span>
                  </div>
                  <div className="w-px h-8 bg-slate-100 dark:bg-white/5" />
                  <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Efficiency</span>
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">{paper.totalMarks || 0} MARKS</span>
                  </div>
              </div>
              <div 
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] group-hover:gap-4 transition-all"
                style={{ color: primaryColor }}
              >
                  <span>Enter</span>
                  <ArrowRight size={14} strokeWidth={3} />
              </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Terminate Subject Node"
        description={`Confirm termination of subject node "${paper.title}". Associated questions will be purged from the registry.`}
        variant="danger"
        confirmText="Terminate Now"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
