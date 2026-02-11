import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PageHeaderProps {
  title: string;
}

export default function PageHeader({ title }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <Link
        href="/exams"
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-300 transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Exams & Quizzes</span>
      </Link>
      
      <div className="flex justify-between items-center">
        <h1 className="text-gray-900 dark:text-gray-100 text-2xl md:text-3xl font-bold leading-tight tracking-tight">
          {title}
        </h1>
      </div>
    </div>
  );
}