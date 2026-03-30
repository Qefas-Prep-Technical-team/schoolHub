'use client';

import { useState } from "react";
import { cn } from "@/lib/utils";
import { FileText, ClipboardList } from "lucide-react";

interface AssessmentTypeToggleProps {
    onTypeChange: (type: 'exams' | 'quizzes') => void;
}

export default function AssessmentTypeToggle({ onTypeChange }: AssessmentTypeToggleProps) {
    const types = [
        { id: 'exams', label: 'Exams', icon: FileText },
        { id: 'quizzes', label: 'Quizzes', icon: ClipboardList },
    ] as const;

    const [active, setActive] = useState<'exams' | 'quizzes'>('exams');

    return (
        <div className="mt-8 flex gap-3 p-1.5 bg-slate-100/50 dark:bg-slate-800/40 rounded-2xl w-fit border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
            {types.map(({ id, label, icon: Icon }) => (
                <button
                    key={id}
                    onClick={() => {
                        setActive(id);
                        onTypeChange(id);
                    }}
                    className={cn(
                        "flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-300",
                        active === id
                            ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-[0_4px_15px_rgba(0,0,0,0.08)] scale-105"
                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    )}
                >
                    <Icon size={16} className={cn(active === id ? "text-primary" : "text-current opacity-40")} />
                    {label}
                </button>
            ))}
        </div>
    );
}