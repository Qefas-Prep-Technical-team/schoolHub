import { Assignment } from './types';
import LaTeXRenderer from '@/components/ui/LaTeXRenderer';
import { BookOpen, Info } from 'lucide-react';

interface Props {
  instructions: Assignment['instructions'];
}

export default function InstructionsPanel({ instructions }: Props) {
  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-6 md:p-8 shadow-xs">
      <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="size-8 sm:size-9 rounded-xl bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 flex items-center justify-center border border-pink-100 dark:border-pink-900/40">
            <BookOpen className="h-4 w-4" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
            Assignment Instructions
          </h3>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
          <Info className="h-3 w-3" /> Teacher Guidance
        </span>
      </div>

      {instructions ? (
        <div className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed break-words">
          <LaTeXRenderer content={instructions} />
        </div>
      ) : (
        <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs sm:text-sm italic">
          No additional instructions provided for this assignment.
        </div>
      )}
    </div>
  );
}