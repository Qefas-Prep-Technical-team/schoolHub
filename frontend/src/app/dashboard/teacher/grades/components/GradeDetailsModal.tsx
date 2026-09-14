import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StudentGrade } from './types';
import { Button } from '@/components/ui/button';
import { X, User, BookOpen, Clock, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GradeDetailsModalProps {
  grade: StudentGrade | null;
  isOpen: boolean;
  onClose: () => void;
}

const GradeDetailsModal: React.FC<GradeDetailsModalProps> = ({ grade, isOpen, onClose }) => {
  if (!grade) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Graded':
      case 'PUBLISHED':
        return 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/10 dark:border-emerald-800/50';
      case 'Pending':
      case 'DRAFT':
        return 'text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-900/10 dark:border-amber-800/50';
      case 'Missing':
        return 'text-red-600 bg-red-50 border-red-100 dark:text-red-400 dark:bg-red-900/10 dark:border-red-800/50';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-100 dark:text-slate-400 dark:bg-slate-900/10 dark:border-slate-800/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Graded':
      case 'PUBLISHED':
        return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'Pending':
      case 'DRAFT':
        return <Clock size={16} className="text-amber-500" />;
      case 'Missing':
        return <AlertCircle size={16} className="text-red-500" />;
      default:
        return null;
    }
  };

  const initials = grade.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-emerald-100 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-950 z-50">
        <div className="relative">
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-white/50 hover:bg-white/90 dark:bg-slate-900/50 dark:hover:bg-slate-900 backdrop-blur-sm transition-colors text-slate-500"
            >
              <X size={16} />
            </Button>
          </div>

          <div className="bg-emerald-50/80 dark:bg-emerald-900/10 p-8 pb-12 rounded-t-[2.5rem] border-b border-emerald-100 dark:border-emerald-800/50 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5 dark:opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '16px 16px', color: 'var(--emerald-600)' }} />
            
            <div className="relative flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-3xl bg-emerald-100 dark:bg-emerald-800/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner mb-4 overflow-hidden border-4 border-white dark:border-slate-900">
                {grade.profilePicture ? (
                  <img src={grade.profilePicture} alt={grade.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-black">{initials}</span>
                )}
              </div>
              <DialogTitle className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {grade.name}
              </DialogTitle>
              <p className="text-sm font-bold text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-widest mt-1">
                {grade.studentCode}
              </p>
            </div>
          </div>

          <div className="p-8 -mt-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 grid grid-cols-2 gap-6 relative z-10">
              
              <div className="col-span-2 flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assessment</p>
                    <p className="text-sm font-black text-slate-900 dark:text-slate-100">{grade.subjectPaper}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800/50">
                    {grade.assessmentType}
                  </span>
                </div>
              </div>

              <div className="flex flex-col">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Score</p>
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-slate-100 leading-none">{grade.score}</span>
                  <span className="text-sm font-bold text-slate-400 mb-0.5">/ {grade.totalScore}</span>
                </div>
              </div>

              <div className="flex flex-col items-end text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Final Grade</p>
                <div className={cn(
                  "px-3 py-1 rounded-xl text-lg font-black shadow-sm flex items-center justify-center min-w-[3rem]",
                  grade.grade.startsWith('A') ? "bg-emerald-500 text-white" :
                  grade.grade.startsWith('B') ? "bg-blue-500 text-white" :
                  grade.grade.startsWith('C') ? "bg-amber-500 text-white" :
                  "bg-red-500 text-white"
                )}>
                  {grade.grade}
                </div>
              </div>

              <div className="col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Status</span>
                </div>
                <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", getStatusColor(grade.status))}>
                  {getStatusIcon(grade.status)}
                  {grade.status}
                </div>
              </div>

              {grade.remarks && (
                <div className="col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Remarks</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    "{grade.remarks}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GradeDetailsModal;
