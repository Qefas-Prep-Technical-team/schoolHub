'use client';

import { useState } from 'react';

interface AssessmentTypeToggleProps {
  onTypeChange?: (type: 'exams' | 'quizzes') => void;
}

export default function AssessmentTypeToggle({ onTypeChange }: AssessmentTypeToggleProps) {
  const [selectedType, setSelectedType] = useState<'exams' | 'quizzes'>('exams');

  const handleTypeChange = (type: 'exams' | 'quizzes') => {
    setSelectedType(type);
    onTypeChange?.(type);
  };

  return (
    <div className="max-w-md">
      <div className="flex h-12 items-center justify-center rounded-xl bg-slate-200/50 p-1.5 dark:bg-slate-800/50">
        <label className="flex h-full grow cursor-pointer items-center justify-center overflow-hidden rounded-lg px-2 text-sm font-medium leading-normal text-slate-500 transition-all duration-200 has-[:checked]:bg-white has-[:checked]:text-primary has-[:checked]:shadow-sm dark:text-slate-400 dark:has-[:checked]:bg-slate-900">
          <input
            type="radio"
            name="assessment_type"
            value="Exams"
            checked={selectedType === 'exams'}
            onChange={() => handleTypeChange('exams')}
            className="invisible w-0"
          />
          <span className="truncate">Exams</span>
        </label>
        
        <label className="flex h-full grow cursor-pointer items-center justify-center overflow-hidden rounded-lg px-2 text-sm font-medium leading-normal text-slate-500 transition-all duration-200 has-[:checked]:bg-white has-[:checked]:text-primary has-[:checked]:shadow-sm dark:text-slate-400 dark:has-[:checked]:bg-slate-900">
          <input
            type="radio"
            name="assessment_type"
            value="Quizzes"
            checked={selectedType === 'quizzes'}
            onChange={() => handleTypeChange('quizzes')}
            className="invisible w-0"
          />
          <span className="truncate">Quizzes</span>
        </label>
      </div>
    </div>
  );
}