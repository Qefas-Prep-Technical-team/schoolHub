// src/components/Dashboard/InstructionsList.tsx
import React from 'react';
import { InstructionItem } from './types';

const InstructionsList: React.FC = () => {
    const instructions: InstructionItem[] = [
        { icon: 'timer', text: 'The timer starts as soon as you begin the exam and cannot be paused.' },
        { icon: 'auto_awesome', text: 'The exam will be automatically submitted when the time is over.' },
        { icon: 'tab_move', text: 'Do not switch tabs or minimize the browser window during the exam.' },
        { icon: 'looks_one', text: 'You are allowed only one attempt for this examination.' },
        { icon: 'arrow_back', text: 'Once you move to the next question, you cannot go back to the previous one.' },
    ];

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-[#0e121b] dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">
                Instructions & Rules
            </h2>
            <ul className="space-y-3 text-[#506795] dark:text-gray-300">
                {instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary mt-1">
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