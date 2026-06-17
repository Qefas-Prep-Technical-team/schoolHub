'use client';

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
    videoUrl?: string;
    onVideoUrlChange?: (url: string) => void;
    referenceUrl?: string;
    onReferenceUrlChange?: (url: string) => void;
    availableSubjects?: { id: string; name: string }[];
    availableClasses?: { id: string; name: string }[];
}

export default function AssignmentDetails({
    title,
    onTitleChange,
    subject,
    onSubjectChange,
    classes,
    onClassesChange,
    instructions,
    onInstructionsChange,
    videoUrl,
    onVideoUrlChange,
    referenceUrl,
    onReferenceUrlChange,
    availableSubjects = [],
    availableClasses = []
}: AssignmentDetailsProps) {
    const subjectOptions = [
        { value: '', label: 'Select a subject' },
        ...availableSubjects.map(s => ({ value: s.id, label: s.name }))
    ];

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

                <Select
                    label="Assign to Class"
                    options={[
                        { value: '', label: 'Select a class' },
                        ...availableClasses.map(c => ({ value: c.id, label: c.name }))
                    ]}
                    value={classes[0]?.id || ''}
                    onChange={(e) => {
                        const classId = e.target.value;
                        const classObj = availableClasses.find(c => c.id === classId);
                        if (classObj) {
                            onClassesChange([{ id: classObj.id, name: classObj.name }]);
                        } else {
                            onClassesChange([]);
                        }
                    }}
                />

                <div className="flex flex-col col-span-2 md:col-span-1">
                    <p className="text-[#0e121b] dark:text-white text-base font-medium leading-normal pb-2">
                        Video URL (Optional)
                    </p>
                    <Input
                        placeholder="https://youtube.com/..."
                        value={videoUrl || ''}
                        onChange={(e) => onVideoUrlChange?.(e.target.value)}
                    />
                </div>

                <div className="flex flex-col col-span-2 md:col-span-1">
                    <p className="text-[#0e121b] dark:text-white text-base font-medium leading-normal pb-2">
                        Reference Link (Optional)
                    </p>
                    <Input
                        placeholder="https://example.com/resource"
                        value={referenceUrl || ''}
                        onChange={(e) => onReferenceUrlChange?.(e.target.value)}
                    />
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
