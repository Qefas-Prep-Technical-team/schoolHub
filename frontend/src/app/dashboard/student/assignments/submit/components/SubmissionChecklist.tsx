import { ChecklistItem } from './types';

interface Props {
  items: ChecklistItem[];
  onChange: (itemId: string, checked: boolean) => void;
}

export default function SubmissionChecklist({ items, onChange }: Props) {
  const allChecked = items.every(item => item.checked);
  
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[#0e121b] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
          Submission Checklist
        </h2>
        {allChecked && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <span className="material-symbols-outlined">check_circle</span>
            <span className="text-sm font-medium">All checks complete!</span>
          </div>
        )}
      </div>
      
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={(e) => onChange(item.id, e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary transition-colors"
            />
            <span className={`text-base transition-colors ${
              item.checked 
                ? 'text-[#0e121b] dark:text-white/90 line-through decoration-gray-400' 
                : 'text-[#0e121b] dark:text-white/90'
            }`}>
              {item.label}
            </span>
          </label>
        ))}
      </div>
      
      {!allChecked && (
        <div className="rounded-lg bg-orange-50 dark:bg-orange-900/20 p-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-orange-500">warning</span>
            <div>
              <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                Complete all checklist items before submitting
              </p>
              <p className="text-sm text-orange-700 dark:text-orange-400">
                This ensures your submission meets all requirements.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}