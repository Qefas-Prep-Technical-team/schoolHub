// src/components/UI/QuestionButton.tsx
import React from 'react';

interface QuestionButtonProps {
    number: number;
    isActive?: boolean;
    onClick?: () => void;
}

const QuestionButton: React.FC<QuestionButtonProps> = ({
    number,
    isActive = false,
    onClick
}) => {
    return (
        <button
            onClick={onClick}
            className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg ${isActive
                    ? 'bg-primary text-white'
                    : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
        >
            {number}
        </button>
    );
};

export default QuestionButton;