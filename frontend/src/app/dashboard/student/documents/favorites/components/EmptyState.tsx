import { Card } from './ui/Card';
import { Star } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title = "No More Pinned Documents",
  description = "Find a document in the main library and click the star icon to pin it here for easy access.",
  actionText = "Browse Documents",
  actionHref = "/documents",
  onAction,
}: EmptyStateProps) {
  return (
    <Card className="md:col-span-2 lg:col-span-3">
      <div className="flex flex-col items-center justify-center gap-4 p-10 text-center">
        {/* Icon */}
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
          <Star className="w-8 h-8" />
        </div>

        {/* Text Content */}
        <div className="flex flex-col gap-1 max-w-sm">
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>

        {/* Action Button */}
        {actionHref ? (
          <Link
            href={actionHref}
            className="mt-2 px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {actionText} →
          </Link>
        ) : onAction ? (
          <button
            onClick={onAction}
            className="mt-2 px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {actionText}
          </button>
        ) : null}

        {/* Tips */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            💡 <strong>Tip:</strong> Documents marked with a star appear here
          </p>
        </div>
      </div>
    </Card>
  );
}