import React from 'react';

interface GradeBadgeProps {
  grade: string;
  isError?: boolean;
}

const GradeBadge: React.FC<GradeBadgeProps> = ({ grade, isError = false }) => {
  const getGradeColor = (grade: string): { bg: string; text: string } => {
    if (isError) {
      return {
        bg: 'bg-red-100 dark:bg-red-900',
        text: 'text-red-800 dark:text-red-200',
      };
    }

    switch (grade) {
      case 'A':
      case 'A-':
        return {
          bg: 'bg-green-100 dark:bg-green-900',
          text: 'text-green-800 dark:text-green-200',
        };
      case 'B':
      case 'B+':
      case 'B-':
        return {
          bg: 'bg-blue-100 dark:bg-blue-900',
          text: 'text-blue-800 dark:text-blue-200',
        };
      case 'C':
      case 'C+':
      case 'C-':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900',
          text: 'text-yellow-800 dark:text-yellow-200',
        };
      case 'D':
      case 'F':
        return {
          bg: 'bg-red-100 dark:bg-red-900',
          text: 'text-red-800 dark:text-red-200',
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-900',
          text: 'text-gray-800 dark:text-gray-200',
        };
    }
  };

  const colors = getGradeColor(grade);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
    >
      {grade}
    </span>
  );
};

export default GradeBadge;