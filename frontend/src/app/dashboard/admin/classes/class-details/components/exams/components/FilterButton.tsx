import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FilterButtonProps {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ 
  label, 
  value, 
  options, 
  onChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-gray-800/50 pl-4 pr-3 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <p className="text-[#0e101b] dark:text-gray-300 text-sm font-medium leading-normal">
          {label}: {options.find(opt => opt.value === value)?.label || value}
        </p>
        <ChevronDown size={20} className="text-[#0e101b] dark:text-gray-300" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-sm text-left text-[#0e101b] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterButton;