import { FileText, Plus } from 'lucide-react';

interface EmptyStateProps {
  onAddQuestion: () => void;
}

export default function EmptyState({ onAddQuestion }: EmptyStateProps) {
  return (
    <div className="mt-8 text-center">
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-900/50 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
        <FileText className="w-16 h-16 text-gray-400 dark:text-gray-600" />
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          No questions yet
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Click the button below to add your first question.
        </p>
        <button
          onClick={onAddQuestion}
          className="mt-6 flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Your First Question</span>
        </button>
      </div>
    </div>
  );
}