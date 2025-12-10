import React from 'react';

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  id: string;
}

const TimeInput: React.FC<TimeInputProps> = ({ value, onChange, label, id }) => {
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="text-gray-900 dark:text-white text-sm font-medium leading-normal pb-2">
        {label}
      </label>
      <input
        id={id}
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-transparent h-12 placeholder:text-gray-400 dark:placeholder:text-gray-500 px-3 text-base font-normal leading-normal"
      />
    </div>
  );
};

export default TimeInput;