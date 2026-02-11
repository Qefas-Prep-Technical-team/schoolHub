'use client';

import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  helperText?: string;
  maxLength?: number;
  showCharCount?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    label, 
    error, 
    fullWidth = false, 
    helperText,
    maxLength,
    showCharCount = false,
    className = '', 
    id,
    value = '',
    onChange,
    ...props 
  }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const charCount = typeof value === 'string' ? value.length : 0;

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label 
            htmlFor={textareaId}
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          id={textareaId}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          className={`
            block w-full rounded-lg border 
            ${error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : 'border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-primary'
            }
            dark:bg-slate-700 dark:text-white 
            shadow-sm 
            focus:outline-none focus:ring-2 focus:ring-opacity-50
            px-3 py-2 sm:text-sm
            resize-y min-h-[100px]
            transition-colors duration-200
            ${className}
          `}
          {...props}
        />

        <div className="flex justify-between mt-1">
          <div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
            
            {helperText && !error && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {helperText}
              </p>
            )}
          </div>

          {showCharCount && maxLength && (
            <p className={`text-xs ${
              charCount > maxLength * 0.9 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-slate-500 dark:text-slate-400'
            }`}>
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;