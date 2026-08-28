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
  const commonClasses = "w-full px-4 text-sm font-semibold leading-normal transition-all bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none";

  return (
    <label className={`flex flex-col w-full gap-2 ${className}`}>
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={`${commonClasses} py-4 resize-none`}
          required={required}
        />
      ) : type === 'select' ? (
        <div className="relative">
          <select
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className={`${commonClasses} h-14 appearance-none pr-10`}
            required={required}
          >
            <option value="" disabled className="text-slate-400">Select {label.toLowerCase()}</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${commonClasses} h-14`}
          required={required}
        />
      )}
    </label>
  );
};

export default FormInput;

