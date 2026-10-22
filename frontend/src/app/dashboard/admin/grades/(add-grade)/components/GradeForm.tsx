/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { GradeFormData } from './types';
import GradeFormHeader from './GradeFormHeader';
import GradeFormActions from './GradeFormActions';
import GradeFormFields from './GradeFormFields';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useSchoolProfile } from '@/lib/api/hooks/useSchool';
import { getGradeEvaluation } from '@/utils/gradingSystem';

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
    const { user } = useAuthStore();
    const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
    const { data: schoolProfile } = useSchoolProfile(schoolId);

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
        if (score === null || isNaN(score)) return '-';
        const safeMax = maxMarks > 0 ? maxMarks : 100;
        const percentage = (score / safeMax) * 100;
        return getGradeEvaluation(percentage, schoolProfile?.gradingSystem).grade;
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
                        isEditing={isEditing}
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

