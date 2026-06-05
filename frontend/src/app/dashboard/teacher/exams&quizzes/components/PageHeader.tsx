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

  return (
    <div className="flex flex-wrap justify-between items-center gap-4 mb-10">
      <h1 className="text-slate-900 dark:text-white text-3xl md:text-5xl font-black leading-tight tracking-tight">
        {title}
      </h1>
      
      {isSubjectPaperTab ? (
         <button
            onClick={onAddPaper}
            className="flex items-center cursor-pointer justify-center gap-3 rounded-2xl h-14 px-8 bg-primary text-white text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 hover:-translate-y-1 transition-all duration-300"
        >
            <FilePlus className="w-5 h-5" />
            <span>Add Subject Paper</span>
        </button>
      ) : (
        <Link href="/dashboard/teacher/exams&quizzes/create">
            <button
            onClick={onCreateNew}
            className="flex items-center cursor-pointer justify-center gap-3 rounded-2xl h-14 px-8 bg-primary text-white text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 hover:-translate-y-1 transition-all duration-300"
            >
                <Plus className="w-5 h-5" />
                <span>Create New Exam/Quiz</span>
            </button>
        </Link>
      )}
    </div>
  );
}
