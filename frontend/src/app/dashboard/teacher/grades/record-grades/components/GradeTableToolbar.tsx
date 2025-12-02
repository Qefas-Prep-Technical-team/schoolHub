import React from 'react';
import { Copy, Trash2, MoreVertical } from 'lucide-react';

interface GradeTableToolbarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: (selected: boolean) => void;
  onApplySameScore: () => void;
  onClearSelected: () => void;
}

const GradeTableToolbar: React.FC<GradeTableToolbarProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onApplySameScore,
  onClearSelected,
}) => {
  const isAllSelected = selectedCount === totalCount;

  return (
    <div className="flex justify-between items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-background-dark shadow-sm">
      <div className="flex items-center gap-4">
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={(e) => onSelectAll(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary dark:bg-gray-700"
          aria-label="Select all students"
        />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {selectedCount} students selected
        </span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onApplySameScore}
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:bg-primary/10 rounded-full"
          title="Apply same score to selected"
        >
          <Copy className="w-5 h-5" />
        </button>
        <button
          onClick={onClearSelected}
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-500 hover:bg-red-500/10 rounded-full"
          title="Clear selected rows"
        >
          <Trash2 className="w-5 h-5" />
        </button>
        <button
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:bg-primary/10 rounded-full"
          title="More actions"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default GradeTableToolbar;