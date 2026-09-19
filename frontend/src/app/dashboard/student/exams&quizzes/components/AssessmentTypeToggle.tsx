'use client';

import { useState } from "react";
import { cn } from "@/lib/utils";
import { FileText, ClipboardList, PenTool, BookOpen } from "lucide-react";

interface AssessmentTypeToggleProps {
    onTypeChange: (type: 'exams' | 'quizzes' | 'ca' | 'assignment') => void;
}

export default function AssessmentTypeToggle({ onTypeChange }: AssessmentTypeToggleProps) {
    const types = [
        { id: 'exams', label: 'Exams', icon: FileText },
        { id: 'quizzes', label: 'Quizzes', icon: ClipboardList },
        { id: 'ca', label: 'CA', icon: PenTool },
        { id: 'assignment', label: 'Assignments', icon: BookOpen },
    ] as const;

    const [active, setActive] = useState<'exams' | 'quizzes' | 'ca' | 'assignment'>('exams');

    return (
        <div className="flex flex-wrap gap-1 p-1 bg-slate-100/50 dark:bg-slate-800/40 rounded-xl w-full sm:w-fit border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
            {types.map(({ id, label, icon: Icon }) => (
                <button
                    key={id}
                    onClick={() => {
                        setActive(id);
                        onTypeChange(id);
                    }}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300",
                        active === id
                            ? "bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-sm"
                            : "text-slate-500 hover:text-pink-600 dark:hover:text-pink-400"
                    )}
                >
                    <Icon size={16} className={cn(active === id ? "text-pink-600 dark:text-pink-400" : "opacity-50")} />
                    {label}
                </button>
            ))}
        </div>
    );
}
