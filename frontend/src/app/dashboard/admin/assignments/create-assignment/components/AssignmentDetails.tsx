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
    department?: string;
    onDepartmentChange?: (department: string) => void;
    classes: ClassTag[];
    onClassesChange: (classes: ClassTag[]) => void;
    instructions: string;
    onInstructionsChange: (instructions: string) => void;
    availableSubjects?: { id: string; name: string }[];
    availableClasses?: { id: string; name: string }[];
    availableDepartments?: { id: string; name: string }[];
}

export default function AssignmentDetails({
    title,
    onTitleChange,
    subject,
    onSubjectChange,
    department,
    onDepartmentChange,
    classes,
    onClassesChange,
    instructions,
    onInstructionsChange,
    availableSubjects = [],
    availableClasses = [],
    availableDepartments = []
}: AssignmentDetailsProps) {
    const [selectedClassId, setSelectedClassId] = useState('');

    const subjectOptions = [
        { value: '', label: 'Select a subject' },
        ...availableSubjects.map(s => ({ value: s.id, label: s.name }))
    ];

    const departmentOptions = [
        { value: '', label: 'Select a department (optional)' },
        ...availableDepartments.map(d => ({ value: d.id, label: d.name }))
    ];

    const handleRemoveClass = (id: string) => {
        onClassesChange(classes.filter(cls => cls.id !== id));
    };

    const handleAddClass = (classId: string) => {
        if (!classId) return;
        const classObj = availableClasses.find(c => c.id === classId);
        if (classObj && !classes.find(c => c.id === classId)) {
            onClassesChange([...classes, { id: classObj.id, name: classObj.name }]);
        }
        setSelectedClassId('');
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

                {onDepartmentChange && (
                    <Select
                        label="Department (Optional)"
                        options={departmentOptions}
                        value={department || ''}
                        onChange={(e) => onDepartmentChange(e.target.value)}
                    />
                )}

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
                        <select
                            value={selectedClassId}
                            onChange={(e) => handleAddClass(e.target.value)}
                            className="flex-1 bg-transparent focus:outline-none min-w-[150px] text-sm text-[#0e121b] dark:text-white dark:bg-[#111721]"
                        >
                            <option value="" className="dark:bg-[#111721] dark:text-white">Select a class to add...</option>
                            {availableClasses.filter(c => !classes.find(cls => cls.id === c.id)).map(c => (
                                <option key={c.id} value={c.id} className="dark:bg-[#111721] dark:text-white">{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <p className="text-sm text-[#506795] dark:text-[#A1A1AA] mt-2">
                        Select classes from the dropdown to add them.
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
