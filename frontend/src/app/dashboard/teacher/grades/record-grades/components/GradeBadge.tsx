import React from 'react';
import { getGradeColorAndBg } from '@/utils/gradingSystem';

interface GradeBadgeProps {
  grade: string;
  isError?: boolean;
}

const GradeBadge: React.FC<GradeBadgeProps> = ({ grade, isError = false }) => {
  if (isError) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
        {grade}
      </span>
    );
  }

  const { color, bg } = getGradeColorAndBg(grade);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${bg} ${color}`}
    >
      {grade}
    </span>
  );
};

export default GradeBadge;
