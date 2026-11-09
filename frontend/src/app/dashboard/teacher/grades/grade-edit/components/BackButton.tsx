import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { HeaderTooltip } from '@/app/dashboard/teacher/components/dashboard/HeaderTooltip';

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick, label = 'Back to Grades' }) => {
  return (
    <div className="flex items-center justify-between gap-2 mb-2">
      <button
        onClick={onClick}
        className="flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5" />
        {label}
      </button>
      <HeaderTooltip
        content="Review and adjust formative or summative assessment records for this student. Changes update continuous assessment calculations and notify parents when selected."
      />
    </div>
  );
};

export default BackButton;
