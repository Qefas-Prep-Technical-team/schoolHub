import { Card } from './ui/Card';
import { Button } from './ui/Button';
import {  SearchSlashIcon as SearchOff , PlusCircle } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  showAction?: boolean;
}

export default function EmptyState({
  title = "No Classes Found",
  description = "There are no classes that match your current search and filter criteria. Try adjusting your filters.",
  actionText = "Create a New Class",
  onAction,
  showAction = true,
}: EmptyStateProps) {
  return (
    <Card className="md:col-span-2 xl:col-span-3 border-dashed">
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <SearchOff className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
        <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
          {title}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md">
          {description}
        </p>
        
        {showAction && onAction && (
          <Button onClick={onAction}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {actionText}
          </Button>
        )}
        
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 w-full max-w-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Quick tips:
          </p>
          <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <li>• Try clearing your search filters</li>
            <li>• Check if the class name is spelled correctly</li>
            <li>• Contact support if you believe this is an error</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}