import { Plus, FilePlus, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PageHeaderProps {
  title: string;
  onCreateNew: (category: 'EXAM' | 'QUIZ' | 'CA' | 'ASSIGNMENT') => void;
  onAddPaper?: () => void;
  activeTab?: 'exams' | 'quizzes' | 'subject-papers' | 'ca' | 'assignment';
}

export default function PageHeader({ title, onCreateNew, onAddPaper, activeTab }: PageHeaderProps) {
  const baseItemStyle = "flex items-center gap-2 cursor-pointer text-xs font-semibold py-2";

  return (
    <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-4 mb-6">
      <h1 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-black leading-tight tracking-tight">
        {title}
      </h1>
      
      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center cursor-pointer justify-center gap-2 rounded-xl h-10 px-4 text-xs font-bold shadow-sm transition-all duration-300 border hover:-translate-y-0.5 active:scale-95 whitespace-nowrap bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500 hover:shadow-emerald-900/20">
              <Plus className="w-4 h-4" strokeWidth={3} />
              <span>Create New</span>
              <ChevronDown className="w-4 h-4 opacity-70" strokeWidth={2.5} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-2">
            <DropdownMenuItem onClick={() => onCreateNew('EXAM')} className={baseItemStyle}>
              <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
              <span>Single Paper Exam</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCreateNew('QUIZ')} className={baseItemStyle}>
              <Plus className="w-4 h-4 text-purple-600 dark:text-purple-400" strokeWidth={2.5} />
              <span>Quiz</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCreateNew('CA')} className={baseItemStyle}>
              <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
              <span>CA</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCreateNew('ASSIGNMENT')} className={baseItemStyle}>
              <Plus className="w-4 h-4 text-amber-600 dark:text-amber-400" strokeWidth={2.5} />
              <span>Assignment</span>
            </DropdownMenuItem>
            {onAddPaper && (
              <DropdownMenuItem onClick={onAddPaper} className={baseItemStyle}>
                <FilePlus className="w-4 h-4 text-slate-600 dark:text-slate-400" strokeWidth={2.5} />
                <span>Paper</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
