'use client';

import { useState } from "react";
import { cn } from "@/lib/utils";
import { FileText, ClipboardList, PenTool, BookOpen } from "lucide-react";
import { HeaderTooltip } from "@/app/dashboard/student/components/dashboard/HeaderTooltip";

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
        <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex flex-wrap gap-1 p-1 bg-slate-100 dark:bg-zinc-900 rounded-2xl w-full sm:w-fit border border-slate-200/80 dark:border-zinc-800">
                {types.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => {
                            setActive(id);
                            onTypeChange(id);
                        }}
                        className={cn(
                            "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex-1 sm:flex-none justify-center",
                            active === id
                                ? "bg-white dark:bg-zinc-800 text-pink-600 dark:text-pink-400 shadow-sm"
                                : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
                        )}
                    >
                        <Icon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", active === id ? "text-pink-600 dark:text-pink-400" : "opacity-60")} />
                        <span>{label}</span>
                    </button>
                ))}
            </div>
            <HeaderTooltip content="Filter between full-term examinations, periodic quizzes, continuous assessments (CA), and homework tasks." className="hidden sm:inline-flex" />
        </div>
    );
}
