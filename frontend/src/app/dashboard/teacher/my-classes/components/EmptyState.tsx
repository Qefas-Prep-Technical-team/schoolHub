import { Users, FilterX } from 'lucide-react';

interface EmptyStateProps {
    onResetFilters: () => void;
}

export default function EmptyState({ onResetFilters }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
                <Users className="w-12 h-12 text-gray-400 dark:text-gray-600" />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No classes found
            </h3>

            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
                No classes match your current filters. Try adjusting your filters or adding new classes.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={onResetFilters}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                    <FilterX className="w-4 h-4" />
                    Reset All Filters
                </button>

                <button
                    onClick={() => console.log('Add new class')}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <Users className="w-4 h-4" />
                    Add New Class
                </button>
            </div>
        </div>
    );
}