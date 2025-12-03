import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumbs() {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <Link
        href="/exams"
        className="text-gray-500 dark:text-gray-400 text-sm font-medium hover:text-primary transition-colors"
      >
        Exams
      </Link>
      <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      <Link
        href="/exams/mid-term-science"
        className="text-gray-500 dark:text-gray-400 text-sm font-medium hover:text-primary transition-colors"
      >
        Mid-term Science Exam
      </Link>
      <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      <span className="text-gray-900 dark:text-white text-sm font-medium">
        Questions
      </span>
    </div>
  );
}