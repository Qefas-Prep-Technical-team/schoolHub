import { useState } from 'react';

interface Props {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}

export default function FilterChips({ label, options, selected, onSelect }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 px-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <p className="text-gray-800 dark:text-gray-200 text-sm font-medium leading-normal">
          {label}
        </p>
        <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 text-base">
          expand_more
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-1 left-0 z-20 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onSelect(option);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                  selected === option
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}