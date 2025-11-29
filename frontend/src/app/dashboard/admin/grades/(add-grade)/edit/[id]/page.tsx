'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { GradeFormData } from '../../components/types';
import GradeForm from '../../components/GradeForm';
import SchoolLoaderIOS from '@/components/reuseables/SchoolLoaderIOS';


// Mock function to fetch grade data - replace with actual API call
const fetchGradeData = async (id: string): Promise<GradeFormData> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    return {
        studentId: '1',
        classId: '1',
        subjectId: '1',
        assessmentType: 'quiz',
        score: 85,
        maxMarks: 100,
        remarks: 'Good work on the quiz.'
    };
};

export default function EditGradePage() {
    const router = useRouter();
    const params = useParams();
    const gradeId = params.id as string;

    const [initialData, setInitialData] = useState<GradeFormData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadGradeData = async () => {
            try {
                const data = await fetchGradeData(gradeId);
                setInitialData(data);
            } catch (error) {
                console.error('Error loading grade:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (gradeId) {
            loadGradeData();
        }
    }, [gradeId]);

    const handleSubmit = async (formData: GradeFormData) => {
        try {
            // Simulate API call
            console.log('Updating grade:', formData);
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Redirect back to grades page or show success message
            router.push('/grades');
        } catch (error) {
            console.error('Error updating grade:', error);
            // Handle error (show toast, etc.)
        }
    };

    const handleClose = () => {
        router.back();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <SchoolLoaderIOS />
            </div>
        );
    }

    return (
        <GradeForm
            initialData={initialData || undefined}
            isEditing={true}
            onClose={handleClose}
            onSubmit={handleSubmit}
        />
    );
}