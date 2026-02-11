import { Plus, Trash2 } from 'lucide-react';

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface OptionsManagerProps {
  options: Option[];
  onAddOption: () => void;
  onUpdateOption: (id: string, field: 'text' | 'isCorrect', value: string | boolean) => void;
  onDeleteOption: (id: string) => void;
}

export default function OptionsManager({
  options,
  onAddOption,
  onUpdateOption,
  onDeleteOption,
}: OptionsManagerProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-base font-medium text-gray-900 dark:text-gray-200">Options</p>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Select the correct answer
        </span>
      </div>
      
      <div className="flex flex-col gap-3">
        {options.map((option, index) => (
          <div key={option.id} className="flex items-center gap-3">
            <label className="cursor-pointer" title="Mark as correct answer">
              <input
                type="radio"
                checked={option.isCorrect}
                onChange={() => {
                  // Set this option as correct and others as false
                  options.forEach(opt => {
                    onUpdateOption(opt.id, 'isCorrect', opt.id === option.id);
                  });
                }}
                className="h-5 w-5 text-primary focus:ring-primary/50 border-gray-300 dark:border-gray-600 bg-transparent dark:checked:bg-primary cursor-pointer"
              />
              <span className="sr-only">Mark option {index + 1} as correct</span>
            </label>
            
            <span className="font-medium text-gray-600 dark:text-gray-400 min-w-[20px]">
              {String.fromCharCode(65 + index)}.
            </span>
            
            <input
              type="text"
              value={option.text}
              onChange={(e) => onUpdateOption(option.id, 'text', e.target.value)}
              placeholder={`Option ${index + 1}`}
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 h-12 px-4 text-gray-900 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            
            <button
              onClick={() => onDeleteOption(option.id)}
              disabled={options.length <= 2}
              className={`p-2 rounded-full transition-colors ${
                options.length > 2
                  ? 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500 dark:hover:text-red-400'
                  : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              }`}
              title={options.length > 2 ? 'Delete option' : 'Minimum 2 options required'}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
      
      <button
        onClick={onAddOption}
        className="flex items-center gap-2 self-start rounded-lg h-10 px-4 text-primary text-sm font-bold hover:bg-primary/10 transition-colors"
      >
        <Plus className="w-5 h-5" />
        <span>Add Option</span>
      </button>
      
      <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        <p>• Select the radio button to mark the correct answer</p>
        <p>• Minimum 2 options, maximum 10 options allowed</p>
        <p>• Drag options to reorder (coming soon)</p>
      </div>
    </div>
  );
}