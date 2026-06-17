import { Plus, FilePlus } from 'lucide-react';
import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  onCreateNew: () => void;
  onAddPaper?: () => void;
  activeTab?: 'exams' | 'quizzes' | 'subject-papers' | 'ca' | 'assignment';
}

export default function PageHeader({ title, onCreateNew, onAddPaper, activeTab }: PageHeaderProps) {
  const isSubjectPaperTab = activeTab === 'subject-papers';
  const isAssignmentTab = activeTab === 'assignment';
  const isCaTab = activeTab === 'ca';
  
  const buttonStyle = "flex items-center cursor-pointer justify-center gap-3 rounded-2xl h-14 px-8 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 dark:from-indigo-600 dark:to-violet-700 dark:hover:from-indigo-500 dark:hover:to-violet-600 text-white text-sm font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 dark:shadow-[0_8px_25px_rgba(99,102,241,0.3)] hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border border-transparent dark:border-indigo-500/30";

  let createLink = "/dashboard/teacher/exams&quizzes/create";
  let createLabel = "Create New Exam/Quiz";

  if (isAssignmentTab) {
    createLink = "/dashboard/teacher/assignments/create-assignment";
    createLabel = "Create New Assignment";
  } else if (isCaTab) {
    createLabel = "Create New CA";
  }

  return (
    <div className="flex flex-wrap justify-between items-center gap-4 mb-10">
      <h1 className="text-slate-900 dark:text-white text-3xl md:text-5xl font-black leading-tight tracking-tight">
        {title}
      </h1>
      
      {isSubjectPaperTab ? (
         <button
            onClick={onAddPaper}
            className={buttonStyle}
        >
            <FilePlus className="w-5 h-5" />
            <span>Add Subject Paper</span>
        </button>
      ) : (
        <Link href={createLink}>
            <button
            onClick={onCreateNew}
            className={buttonStyle}
            >
                <Plus className="w-5 h-5" />
                <span>{createLabel}</span>
            </button>
        </Link>
      )}
    </div>
  );
}
