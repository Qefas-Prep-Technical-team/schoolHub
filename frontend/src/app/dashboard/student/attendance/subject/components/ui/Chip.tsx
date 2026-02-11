// src/components/UI/Chip.tsx
import React from 'react';

interface ChipProps {
    label: string;
    value: string;
    icon: string;
    onClick?: () => void;
}

const Chip: React.FC<ChipProps> = ({ label, value, icon, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 px-4 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-base">
                {icon}
            </span>
            <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-normal">
                {label}
            </p>
            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-base">
                expand_more
            </span>
        </button>
    );
};

export default Chip;