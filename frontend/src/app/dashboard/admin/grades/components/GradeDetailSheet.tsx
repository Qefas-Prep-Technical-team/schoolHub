'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, User, BookOpen, Award, Calendar, Tag, 
  CheckCircle2, Clock, Send, Edit, Trash2, 
  School, Hash, FileText, BarChart3, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface GradeDetailSheetProps {
  grade: any | null;
  onClose: () => void;
  onEdit?: (grade: any) => void;
  onPublish?: (grade: any) => void;
  onDelete?: (grade: any) => void;
  primaryColor?: string;
}

export default function GradeDetailSheet({ 
  grade, 
  onClose, 
  onEdit, 
  onPublish, 
  onDelete,
  primaryColor = '#2563eb'
}: GradeDetailSheetProps) {
  if (!grade) return null;

  const percent = grade.maxMarks > 0 ? Math.round((grade.score / grade.maxMarks) * 100) : 0;
  const isPassed = percent >= 50;
  const isPublished = grade.status === 'PUBLISHED' || grade.examAttemptId || grade.subjectExamAttemptId;

  const getLetterGrade = (pct: number) => {
    if (pct >= 90) return { letter: 'A+', color: '#10b981' };
    if (pct >= 80) return { letter: 'A', color: '#10b981' };
    if (pct >= 70) return { letter: 'B', color: '#3b82f6' };
    if (pct >= 60) return { letter: 'C', color: '#f59e0b' };
    if (pct >= 50) return { letter: 'D', color: '#f97316' };
    return { letter: 'F', color: '#ef4444' };
  };

  const letterGrade = getLetterGrade(percent);
  const initials = grade.student?.name?.substring(0, 2).toUpperCase() || 'ST';
  const assessmentLabel = grade.assessmentType || grade.category || 'General';

  return (
    <AnimatePresence>
      {grade && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          />

          {/* Slide-over panel */}
          <motion.div
            key="sheet"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full" style={{ backgroundColor: isPublished ? '#10b981' : '#f59e0b' }} />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              <button 
                onClick={onClose}
                className="size-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* Hero score section */}
              <div className="px-6 pt-6 pb-8" style={{ background: `linear-gradient(135deg, ${primaryColor}08 0%, transparent 100%)` }}>
                <div className="flex items-start justify-between mb-6">
                  {/* Avatar */}
                  <div className="size-16 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}99)` }}
                  >
                    {initials}
                  </div>

                  {/* Score badge */}
                  <div className="text-right">
                    <div className="text-5xl font-black" style={{ color: letterGrade.color }}>{letterGrade.letter}</div>
                    <div className="text-sm font-semibold text-slate-500 mt-1">{percent}%</div>
                  </div>
                </div>

                {/* Student name */}
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{grade.student?.name || 'Unknown Student'}</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {grade.student?.studentCode && <span className="font-mono mr-2">{grade.student.studentCode}</span>}
                  {grade.class?.name && <span>· {grade.class.name}</span>}
                  {grade.student?.gradeLevel && <span> · Level {grade.student.gradeLevel}</span>}
                </p>

                {/* Score bar */}
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5">
                    <span>Score</span>
                    <span className="text-slate-900 dark:text-white font-black">{grade.score} / {grade.maxMarks}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <motion.div 
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
                      style={{ backgroundColor: letterGrade.color }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>0</span>
                    <span className={isPassed ? 'text-emerald-500 font-semibold' : 'text-red-500 font-semibold'}>
                      {isPassed ? '✓ Passed' : '✗ Failed'}
                    </span>
                    <span>{grade.maxMarks}</span>
                  </div>
                </div>
              </div>

              {/* Detail rows */}
              <div className="px-6 space-y-0 border-t border-slate-100 dark:border-slate-800">

                <DetailRow icon={<BookOpen size={14} />} label="Subject" value={grade.subject || '—'} />
                <DetailRow icon={<Tag size={14} />} label="Assessment Type" value={assessmentLabel} highlight />
                <DetailRow icon={<Star size={14} />} label="Weight" value={grade.weight ? `${grade.weight}x` : '1x'} />
                <DetailRow icon={<School size={14} />} label="Class" value={grade.class?.name || '—'} />
                {grade.exam?.title && <DetailRow icon={<FileText size={14} />} label="Linked Exam" value={grade.exam.title} />}
                {grade.subjectPaper?.title && <DetailRow icon={<FileText size={14} />} label="Subject Paper" value={grade.subjectPaper.title} />}
                {grade.term && <DetailRow icon={<Calendar size={14} />} label="Term" value={grade.term} />}
                {grade.remarks && (
                  <div className="py-4 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Remarks</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{grade.remarks}</p>
                  </div>
                )}
                <DetailRow 
                  icon={<Calendar size={14} />} 
                  label="Recorded On" 
                  value={grade.createdAt ? format(new Date(grade.createdAt), 'MMM d, yyyy · h:mm a') : '—'} 
                />
                {grade.teacher && (
                  <DetailRow icon={<User size={14} />} label="Recorded By" value={grade.teacher?.name || 'Teacher'} />
                )}
              </div>
            </div>

            {/* Action footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0 flex flex-col gap-2.5">
              {onEdit && (
                <Button
                  onClick={() => onEdit(grade)}
                  className="w-full h-11 rounded-xl font-semibold text-sm gap-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Edit size={15} /> Edit Grade
                </Button>
              )}
              <div className="flex gap-2">
                {onPublish && !isPublished && (
                  <Button
                    variant="outline"
                    onClick={() => onPublish(grade)}
                    className="flex-1 h-10 rounded-xl font-semibold text-sm gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-900 dark:hover:bg-emerald-950"
                  >
                    <Send size={14} /> Publish
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="outline"
                    onClick={() => onDelete(grade)}
                    className="flex-1 h-10 rounded-xl font-semibold text-sm gap-2 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                  >
                    <Trash2 size={14} /> Delete
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function DetailRow({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-xs font-semibold">{label}</span>
      </div>
      <span className={`text-sm font-semibold text-right max-w-[55%] truncate ${highlight ? 'px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider' : 'text-slate-900 dark:text-white'}`}>
        {value}
      </span>
    </div>
  );
}
