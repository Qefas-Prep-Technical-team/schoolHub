import { ChevronDown } from 'lucide-react';

interface ToolbarProps {
  selectAll: boolean;
  onSelectAll: () => void;
  bulkAction: string;
  onBulkActionChange: (action: string) => void;
  onApplyBulkAction: () => void;
  selectedCount: number;
}

const bulkActions = [
  { value: '', label: 'Bulk Actions' },
  { value: 'delete', label: 'Delete Selected' },
  { value: 'change_marks', label: 'Change Marks' },
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'change_type', label: 'Change Question Type' },
  { value: 'change_status', label: 'Change Status' },
];

export default function Toolbar({
  selectAll,
  onSelectAll,
  bulkAction,
  onBulkActionChange,
  onApplyBulkAction,
  selectedCount,
}: ToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 mb-4 bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={onSelectAll}
            className="h-5 w-5 rounded border-gray-300 dark:border-gray-700 bg-transparent text-primary focus:ring-primary/50 dark:bg-gray-800 dark:checked:bg-primary transition-colors cursor-pointer"
          />
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300 cursor-pointer select-none">
            Select All
          </label>
        </div>
        {selectedCount > 0 && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {selectedCount} selected
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="relative flex-1 sm:flex-none">
          <select
            value={bulkAction}
            onChange={(e) => onBulkActionChange(e.target.value)}
            className="appearance-none w-full h-10 pl-4 pr-10 text-sm font-medium bg-gray-100 dark:bg-gray-800 border-none rounded-lg text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary/50 focus:outline-none transition-colors cursor-pointer"
          >
            {bulkActions.map((action) => (
              <option key={action.value} value={action.value}>
                {action.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none w-4 h-4" />
        </div>
        <button
          onClick={onApplyBulkAction}
          disabled={!bulkAction || selectedCount === 0}
          className={`flex items-center justify-center rounded-lg h-10 px-4 text-sm font-bold leading-normal tracking-wide transition-colors ${
            bulkAction && selectedCount > 0
              ? 'bg-primary text-white hover:bg-primary/90 cursor-pointer'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
        >
          Apply
        </button>
      </div>
    </div>
  );
}