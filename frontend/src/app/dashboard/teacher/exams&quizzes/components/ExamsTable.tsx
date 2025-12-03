import { Eye, Edit, PlusCircle, Trash2 } from 'lucide-react';
import { Exam } from './types';
import Link from 'next/link';


interface ExamsTableProps {
  exams: Exam[];
  activeTab: 'exams' | 'quizzes';
} 

export default function ExamsTable({ exams, activeTab }: ExamsTableProps) {
  const getStatusColor = (status: Exam['status']) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'completed':
        return 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      case 'draft':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  const handleAction = (action: string, examId: string) => {
    console.log(`${action} exam ${examId}`);
    // Implement action logic
  };

  if (exams.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-text-secondary-light dark:text-text-secondary-dark text-lg font-medium mb-2">
          No {activeTab} found
        </div>
        <p className="text-text-secondary-light dark:text-text-secondary-dark">
          Create your first {activeTab.slice(0, -1)} or adjust your filters
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left min-w-[800px]">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="px-4 py-3 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
              Title
            </th>
            <th className="px-4 py-3 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
              Class
            </th>
            <th className="px-4 py-3 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
              Subject
            </th>
            <th className="px-4 py-3 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark text-center">
              Marks
            </th>
            <th className="px-4 py-3 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark text-center">
              Questions
            </th>
            <th className="px-4 py-3 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
              Status
            </th>
            <th className="px-4 py-3 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
              Date Created
            </th>
            <th className="px-4 py-3 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {exams.map((exam) => (
            <tr
              key={exam.id}
              className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-150"
            >
              <td className="h-16 px-4 py-2 text-sm font-medium text-text-light dark:text-text-dark">
                {exam.title}
              </td>
              <td className="h-16 px-4 py-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                {exam.class}
              </td>
              <td className="h-16 px-4 py-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                {exam.subject}
              </td>
              <td className="h-16 px-4 py-2 text-sm text-text-secondary-light dark:text-text-secondary-dark text-center">
                {exam.marks}
              </td>
              <td className="h-16 px-4 py-2 text-sm text-text-secondary-light dark:text-text-secondary-dark text-center">
                {exam.questions}
              </td>
              <td className="h-16 px-4 py-2">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(exam.status)}`}>
                  {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                </span>
              </td>
              <td className="h-16 px-4 py-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                {exam.dateCreated}
              </td>
              <td className="h-16 px-4 py-2">
                <div className="flex items-center justify-end gap-1">
                  <Link href="/dashboard/teacher/exams&quizzes/preview">
                  <button
                    onClick={() => handleAction('view', exam.id)}
                    className="p-2 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-white/10 text-text-secondary-light dark:text-text-secondary-dark transition-colors"
                    title="View"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  </Link>
                     <Link href="/dashboard/teacher/exams&quizzes/question-list">
                  <button
                    onClick={() => handleAction('edit', exam.id)}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-text-secondary-light dark:text-text-secondary-dark transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  </Link>
                      <Link href="/dashboard/teacher/exams&quizzes/question-list">
                  <button
                    onClick={() => handleAction('add_questions', exam.id)}
                    className="p-2 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-white/10 text-text-secondary-light dark:text-text-secondary-dark transition-colors"
                    title="Add Questions"
                  >
                    <PlusCircle className="w-5 h-5" />
                  </button>
                  </Link>
                  <button
                    onClick={() => handleAction('delete', exam.id)}
                    className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}