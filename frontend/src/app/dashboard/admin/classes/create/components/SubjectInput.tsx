import React, { useState } from 'react';
import { X } from 'lucide-react';

interface SubjectInputProps {
  subjects: string[];
  onSubjectsChange: (subjects: string[]) => void;
}

const SubjectInput: React.FC<SubjectInputProps> = ({ subjects, onSubjectsChange }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddSubject = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (!subjects.includes(inputValue.trim())) {
        onSubjectsChange([...subjects, inputValue.trim()]);
      }
      setInputValue('');
    }
  };

  const handleRemoveSubject = (subjectToRemove: string) => {
    onSubjectsChange(subjects.filter((subject) => subject !== subjectToRemove));
  };

  return (
    <div className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent p-2 min-h-11 flex flex-wrap items-center gap-2">
      {subjects.map((subject) => (
        <span
          key={subject}
          className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full"
        >
          {subject}
          <button
            onClick={() => handleRemoveSubject(subject)}
            className="hover:text-primary/70"
            aria-label={`Remove ${subject}`}
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleAddSubject}
        placeholder="Add subjects..."
        className="flex-1 bg-transparent focus:outline-none min-w-[100px] text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
      />
    </div>
  );
};

export default SubjectInput;