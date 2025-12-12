import React from 'react';

interface FormInputProps {
  label: string;
  type: 'text' | 'email' | 'tel' | 'url' | 'textarea' | 'select';
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  options?: string[];
  rows?: number;
  className?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  type,
  placeholder,
  value,
  onChange,
  required = false,
  options = [],
  rows = 3,
  className = ''
}) => {
  const commonClasses = "w-full px-4 text-sm font-normal leading-normal transition-colors bg-background-light dark:bg-background-dark border rounded-lg border-border-light dark:border-border-dark focus:border-primary focus:ring-primary/50 text-text-light-primary dark:text-text-dark-primary";

  return (
    <label className={`flex flex-col w-full ${className}`}>
      <p className="pb-2 text-sm font-medium text-text-light-primary dark:text-text-dark-primary">
        {label} {required && <span className="text-red-500">*</span>}
      </p>
      
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={`${commonClasses} py-3 resize-none`}
          required={required}
        />
      ) : type === 'select' ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${commonClasses} h-12 appearance-none`}
          required={required}
        >
          <option value="">Select {label.toLowerCase()}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${commonClasses} h-12`}
          required={required}
        />
      )}
    </label>
  );
};

export default FormInput;