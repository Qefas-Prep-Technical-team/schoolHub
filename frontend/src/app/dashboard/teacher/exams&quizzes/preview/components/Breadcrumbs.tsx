import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumbs({ title, id, fromClass }: { title?: string, id?: string | null, fromClass?: string | null }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {fromClass ? (
        <>
          <Link
            href={`/dashboard/teacher/my-classes/${fromClass}?tab=exams`}
            className="text-gray-500 dark:text-gray-400 text-sm font-medium hover:text-emerald-600 transition-colors"
          >
            Class Details
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </>
      ) : (
        <>
          <Link
            href="/dashboard/teacher/exams&quizzes"
            className="text-gray-500 dark:text-gray-400 text-sm font-medium hover:text-emerald-600 transition-colors"
          >
            Exams & Quizzes
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </>
      )}
      {id ? (
        <Link
          href={fromClass ? `/dashboard/teacher/my-classes/${fromClass}?tab=exams` : `/dashboard/teacher/exams&quizzes/${id}`}
          className="text-gray-500 dark:text-gray-400 text-sm font-medium hover:text-emerald-600 transition-colors"
        >
          {title || 'Assessment'}
        </Link>
      ) : (
        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
          {title || 'Assessment'}
        </span>
      )}
      <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      <span className="text-sm font-medium text-gray-900 dark:text-white">
        Preview
      </span>
    </div>
  );
}
