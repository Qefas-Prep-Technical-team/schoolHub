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
  const buttonStyle = "flex items-center cursor-pointer justify-center gap-2 rounded-xl h-10 px-4 bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-sm transition-all duration-300";

  let createLink = "/dashboard/teacher/exams&quizzes/create";
  let createLabel = "Create New Exam/Quiz";

  if (isAssignmentTab) {
    createLink = "/dashboard/teacher/assignments/create-assignment";
    createLabel = "Create New Assignment";
  } else if (isCaTab) {
    createLabel = "Create New CA";
  }

  return (
    <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
      <h1 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-black leading-tight tracking-tight">
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
