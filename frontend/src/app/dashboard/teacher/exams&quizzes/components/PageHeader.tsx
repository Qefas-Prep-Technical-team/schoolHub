import { Plus } from 'lucide-react';
import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  onCreateNew: () => void;
}

export default function PageHeader({ title, onCreateNew }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
      <h1 className="text-text-light dark:text-text-dark text-2xl md:text-4xl font-bold leading-tight tracking-tight">
        {title}
      </h1>
      <Link href={"/dashboard/teacher/exams&quizzes/create"}>


      <button
        onClick={onCreateNew}
        className="flex items-center cursor-pointer justify-center gap-2 rounded-xl h-11 px-5 bg-primary text-white text-sm font-bold leading-normal tracking-wide shadow-sm hover:bg-primary/90 transition-colors duration-200"
      >
        <Plus className="w-5 h-5" />
        <span className="truncate">Create New Exam/Quiz</span>
      </button>
      </Link>
    </div>
  );
}