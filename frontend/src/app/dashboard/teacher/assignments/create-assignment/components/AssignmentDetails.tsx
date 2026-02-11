'use client';

import { useState } from 'react';

import { ClassTag } from './types';
import Input from './ui/Input';
import Select from './ui/Select';
import RichTextEditor from './RichTextEditor';

interface AssignmentDetailsProps {
    title: string;
    onTitleChange: (title: string) => void;
    subject: string;
    onSubjectChange: (subject: string) => void;
    classes: ClassTag[];
    onClassesChange: (classes: ClassTag[]) => void;
    instructions: string;
    onInstructionsChange: (instructions: string) => void;
}

export default function AssignmentDetails({
    title,
    onTitleChange,
    subject,
    onSubjectChange,
    classes,
    onClassesChange,
    instructions,
    onInstructionsChange
}: AssignmentDetailsProps) {
    const [newClass, setNewClass] = useState('');

    const subjectOptions = [
        { value: '', label: 'Select a subject' },
        { value: 'mathematics', label: 'Mathematics' },
        { value: 'english', label: 'English Language Arts' },
        { value: 'science', label: 'Science' },
        { value: 'history', label: 'History' },
        { value: 'art', label: 'Art' },
        { value: 'music', label: 'Music' },
        { value: 'pe', label: 'Physical Education' },
    ];

    const handleRemoveClass = (id: string) => {
        onClassesChange(classes.filter(cls => cls.id !== id));
    };

    const handleAddClass = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && newClass.trim()) {
            e.preventDefault();
            const newClassObj: ClassTag = {
                id: Date.now().toString(),
                name: newClass.trim()
            };
            onClassesChange([...classes, newClassObj]);
            setNewClass('');
        }
    };

    return (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-xl border border-[#E4E4E7] dark:border-[#2D2D2F]">
            <h2 className="text-[#0e121b] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-6 pt-5 pb-3 border-b border-[#E4E4E7] dark:border-[#2D2D2F]">
                Assignment Details
            </h2>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                    label="Title"
                    placeholder="e.g., Chapter 5 Reading Quiz"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    fullWidth
                />

                <Select
                    label="Subject"
                    options={subjectOptions}
                    value={subject}
                    onChange={(e) => onSubjectChange(e.target.value)}
                />

                <div className="flex flex-col col-span-2">
                    <p className="text-[#0e121b] dark:text-white text-base font-medium leading-normal pb-2">
                        Assign to Class(es)
                    </p>
                    <div className="flex flex-wrap items-center gap-2 p-3 min-h-12 w-full rounded-lg border border-[#d1d8e6] dark:border-[#374151] bg-[#f6f6f8] dark:bg-[#111721]">
                        {classes.map((cls) => (
                            <span
                                key={cls.id}
                                className="flex items-center gap-1 bg-primary/20 text-primary text-sm font-medium px-2 py-1 rounded-full"
                            >
                                {cls.name}
                                <button
                                    onClick={() => handleRemoveClass(cls.id)}
                                    className="material-symbols-outlined text-sm hover:text-primary/70"
                                >
                                    close
                                </button>
                            </span>
                        ))}
                        <input
                            value={newClass}
                            onChange={(e) => setNewClass(e.target.value)}
                            onKeyDown={handleAddClass}
                            className="flex-1 bg-transparent focus:outline-none min-w-[100px] text-sm placeholder:text-[#506795]"
                            placeholder="Type class name and press Enter..."
                            type="text"
                        />
                    </div>
                    <p className="text-sm text-[#506795] dark:text-[#A1A1AA] mt-2">
                        Start typing to add classes. Press Enter to add.
                    </p>
                </div>

                <div className="flex flex-col col-span-2">
                    <p className="text-[#0e121b] dark:text-white text-base font-medium leading-normal pb-2">
                        Instructions
                    </p>
                    <RichTextEditor
                        value={instructions}
                        onChange={onInstructionsChange}
                    />
                </div>
            </div>
        </div>
    );
}