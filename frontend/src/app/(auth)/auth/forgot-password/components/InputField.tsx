// components/InputField.tsx
"use client";
import { useState } from "react";

interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  type?: string;
  disabled?: boolean;
}

export default function InputField({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  onBlur, 
  error, 
  type = "text",
  disabled = false 
}: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-text-light dark:text-text-dark">
        {label}
      </label>
      <div className={`relative transition-all duration-200 ${
        error ? 'animate-shake' : ''
      }`}>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 ${
            error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-600 dark:focus:border-red-400' 
              : 'border-gray-300 focus:border-primary focus:ring-primary/20 dark:border-gray-600 dark:focus:border-primary'
          } ${
            disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60' : 'bg-white dark:bg-gray-900'
          } text-text-light dark:text-text-dark placeholder-gray-400 dark:placeholder-gray-500`}
        />
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1 animate-fadeIn">
          {error}
        </p>
      )}
    </div>
  );
}