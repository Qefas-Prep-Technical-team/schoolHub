import React from 'react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  label: string;
  id: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const FilterSelect: React.FC<FilterSelectProps> = ({
  label,
  id,
  options,
  value,
  onChange,
  className = '',
}) => {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        {label}
      </label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterSelect;