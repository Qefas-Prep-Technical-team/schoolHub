// src/components/Dashboard/InstructionsList.tsx
import React from 'react';
import { InstructionItem } from './types';

const InstructionsList: React.FC = () => {
  const instructions: InstructionItem[] = [
    { icon: 'timer', text: 'The timer starts when you begin.' },
    { icon: 'published_with_changes', text: 'Auto-submits on timeout.' },
    { icon: 'task_alt', text: 'Retakes are allowed.' },
    { icon: 'shuffle', text: 'Questions may be shuffled.' }
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
        Instructions
      </h3>
      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
        {instructions.map((instruction, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary">
              {instruction.icon}
            </span>
            <span>{instruction.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InstructionsList;