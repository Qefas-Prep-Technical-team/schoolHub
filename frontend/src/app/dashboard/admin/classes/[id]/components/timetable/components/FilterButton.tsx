import React from 'react';
import { ChevronDown } from 'lucide-react';

interface FilterButtonProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ 
  label, 
  value, 
  options, 
  onChange 
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-gray-200 dark:bg-[#253046] pl-4 pr-3 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-[#364563] transition-colors"
      >
        <p className="text-sm font-medium leading-normal">
          {label}: {value}
        </p>
        <ChevronDown size={20} className="text-lg" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-[#253046] rounded-lg shadow-lg border border-gray-200 dark:border-[#364563] z-10">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-sm text-left text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-[#364563] first:rounded-t-lg last:rounded-b-lg"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterButton;