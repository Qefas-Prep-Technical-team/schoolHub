// src/components/Dashboard/QuestionOption.tsx
import React from 'react';
import { QuestionOption } from './types';

interface QuestionOptionProps extends QuestionOption {
    name?: string;
    isSelected?: boolean;
    onSelect?: (id: string) => void;
}

const QuestionOptionComponent: React.FC<QuestionOptionProps> = ({
    id,
    text,
    name = "question_option",
    isSelected = false,
    disabled = false,
    onSelect
}) => {
    return (
        <label 
            onClick={() => !disabled && onSelect?.(id)}
            className={`
                flex items-center gap-4 rounded-lg border border-[#E5E7EB] dark:border-[#374151] p-4 cursor-pointer transition-all
                ${isSelected ? 'border-primary bg-primary/10' : 'hover:border-primary/50'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
        >
            <input
                type="radio"
                name={name}
                checked={isSelected}
                disabled={disabled}
                onChange={() => {}} // Controlled by label onClick for better consistency
                className="h-5 w-5 border-gray-300 dark:border-gray-600 dark:bg-gray-900 text-primary focus:ring-primary"
            />
            <span className="flex-1 text-base text-gray-700 dark:text-gray-300">
                {text}
            </span>
        </label>
    );
};

export default QuestionOptionComponent;