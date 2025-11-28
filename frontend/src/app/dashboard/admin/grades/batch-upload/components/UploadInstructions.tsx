'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function UploadInstructions() {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <details
            className="flex flex-col rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 group"
            open={isOpen}
            onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
        >
            <summary className="flex cursor-pointer items-center justify-between gap-6 py-2 list-none">
                <h3 className="text-slate-800 dark:text-slate-200 text-base font-medium leading-normal">
                    How to Upload Grades
                </h3>
                <ChevronDown
                    size={20}
                    className={`text-slate-500 dark:text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''
                        }`}
                />
            </summary>

            <div className="pb-2 text-slate-600 dark:text-slate-400 text-sm font-normal leading-relaxed space-y-2">
                <p>1. Download the provided CSV/Excel template.</p>
                <p>2. Fill in the student and grade information, following the specified format.</p>
                <p>3. Drag and drop or browse to upload the completed file.</p>
                <p>4. Review the validated data and process the grades.</p>
            </div>
        </details>
    );
}