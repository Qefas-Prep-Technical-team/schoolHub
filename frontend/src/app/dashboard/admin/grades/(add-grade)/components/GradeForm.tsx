/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { GradeFormData } from './types';
import GradeFormHeader from './GradeFormHeader';
import GradeFormActions from './GradeFormActions';
import GradeFormFields from './GradeFormFields';


interface GradeFormProps {
    initialData?: Partial<GradeFormData>;
    isEditing?: boolean;
    onClose: () => void;
    onSubmit: (data: GradeFormData) => void;
}

const defaultFormData: GradeFormData = {
    studentId: '',
    classId: '',
    subjectId: '',
    assessmentType: '',
    score: null,
    maxMarks: 100,
    remarks: ''
};

export default function GradeForm({
    initialData,
    isEditing = false,
    onClose,
    onSubmit
}: GradeFormProps) {
    const [formData, setFormData] = useState<GradeFormData>({
        ...defaultFormData,
        ...initialData
    });

    const handleInputChange = (field: keyof GradeFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const calculateGrade = (score: number | null, maxMarks: number): string => {
        if (score === null) return '-';

        const percentage = (score / maxMarks) * 100;

        if (percentage >= 90) return 'A+';
        if (percentage >= 85) return 'A';
        if (percentage >= 80) return 'A-';
        if (percentage >= 75) return 'B+';
        if (percentage >= 70) return 'B';
        if (percentage >= 65) return 'B-';
        if (percentage >= 60) return 'C+';
        if (percentage >= 55) return 'C';
        if (percentage >= 50) return 'C-';
        if (percentage >= 45) return 'D+';
        if (percentage >= 40) return 'D';
        return 'F';
    };

    const currentGrade = calculateGrade(formData.score, formData.maxMarks);

    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6">
            <div className="flex w-full max-w-3xl flex-col rounded-xl bg-white dark:bg-zinc-900 shadow-lg">
                <GradeFormHeader
                    title={isEditing ? 'Edit Grade' : 'Add Grade'}
                    onClose={onClose}
                />

                <form onSubmit={handleSubmit}>
                    <GradeFormFields
                        formData={formData}
                        currentGrade={currentGrade}
                        onInputChange={handleInputChange}
                    />

                    <GradeFormActions
                        onCancel={onClose}
                        submitLabel={isEditing ? 'Update Grade' : 'Save Grade'}
                    />
                </form>
            </div>
        </div>
    );
}