// src/components/Dashboard/QuestionOption.tsx
import React from 'react';
import { QuestionOption } from './types';

const QuestionOptionComponent: React.FC<QuestionOption> = ({
    id,
    text,
    isCorrect = false,
    disabled = false
}) => {
    return (
        <label className={`
      flex items-center gap-4 rounded-lg border border-[#E5E7EB] dark:border-[#374151] p-4
      ${isCorrect ? 'border-primary bg-primary/10' : ''}
    `}>
            <input
                type="radio"
                name="question_1"
                checked={isCorrect}
                className="h-5 w-5 border-gray-300 dark:border-gray-600 dark:bg-gray-900 text-primary focus:ring-primary disabled:opacity-50"
            />
            <span className="flex-1 text-base text-gray-700 dark:text-gray-300">
                {text}
            </span>
        </label>
    );
};

export default QuestionOptionComponent;