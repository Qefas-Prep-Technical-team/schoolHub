import React, { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  children: ReactNode;
  htmlFor?: string;
  optional?: boolean;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  children, 
  htmlFor, 
  optional = false,
  className = ''
}) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <label htmlFor={htmlFor} className="text-gray-900 dark:text-white text-sm font-medium leading-normal pb-2">
        {label}
        {optional && (
          <span className="text-gray-400 dark:text-gray-500"> (Optional)</span>
        )}
      </label>
      {children}
    </div>
  );
};

export default FormField;