// src/components/Dashboard/QuestionOption.tsx
import React from 'react';
import { QuestionOption } from './types';

interface QuestionOptionProps extends QuestionOption {
    name?: string;
    isSelected?: boolean;
    onSelect?: (id: string) => void;
}

import LaTeXRenderer from '@/components/ui/LaTeXRenderer';

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
                flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-all duration-200
                ${isSelected 
                    ? 'border-primary bg-primary/10 dark:bg-primary/20 dark:border-primary shadow-sm' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-primary/50 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
        >
            <input
                type="radio"
                name={name}
                checked={isSelected}
                disabled={disabled}
                onChange={() => {}} // Controlled by label onClick for better consistency
                className="h-5 w-5 border-slate-300 dark:border-slate-600 dark:bg-slate-900 text-primary focus:ring-primary focus:ring-offset-0"
            />
            <LaTeXRenderer 
                content={text}
                className="flex-1 text-base text-slate-800 dark:text-slate-200 font-medium leading-relaxed"
            />
        </label>
    );
};

export default QuestionOptionComponent;