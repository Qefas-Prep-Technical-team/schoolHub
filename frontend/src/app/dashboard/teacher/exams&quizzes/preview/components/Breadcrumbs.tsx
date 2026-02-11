import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumbs() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href="/exams"
        className="text-gray-500 dark:text-gray-400 text-sm font-medium hover:text-primary transition-colors"
      >
        Exams & Quizzes
      </Link>
      <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      <Link
        href="/exams/algebra-fundamentals"
        className="text-gray-500 dark:text-gray-400 text-sm font-medium hover:text-primary transition-colors"
      >
        Algebra Fundamentals
      </Link>
      <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      <span className="text-sm font-medium text-gray-900 dark:text-white">
        Preview
      </span>
    </div>
  );
}