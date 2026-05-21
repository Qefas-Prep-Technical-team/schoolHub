'use client';

import { useParams, useRouter } from 'next/navigation';
import { useGrade, gradeKeys } from '@/lib/api/hooks/useGrades';
import { gradeService } from '@/lib/api/services/gradeService';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import GradeForm from '../../components/GradeForm';
import { GradeFormData } from '../../components/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditGradePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const queryClient = useQueryClient();

    const { data: grade, isLoading, isError } = useGrade(id);

    const handleSubmit = async (formData: GradeFormData) => {
        try {
            await gradeService.updateGradeScore(id, {
                score: formData.score !== null ? formData.score : undefined,
                remarks: formData.remarks,
            });

            toast.success('Grade updated successfully!');
            queryClient.invalidateQueries({ queryKey: gradeKeys.all });
            router.push('/dashboard/admin/grades');
        } catch (error) {
            console.error('Error updating grade:', error);
            toast.error('Failed to update grade.');
        }
    };

    const handleClose = () => {
        router.back();
    };

    if (isLoading) {
        return (
            <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950/20">
                <div className="flex w-full max-w-3xl flex-col rounded-xl bg-white dark:bg-zinc-900 shadow-lg p-6 space-y-6">
                    <Skeleton className="h-8 w-1/3" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-24 w-full" />
                    <div className="flex justify-end gap-3">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !grade) {
        return (
            <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950/20">
                <div className="flex w-full max-w-md flex-col rounded-xl bg-white dark:bg-zinc-900 shadow-lg p-8 text-center space-y-4">
                    <h2 className="text-xl font-bold text-rose-600">Grade Not Found</h2>
                    <p className="text-gray-500 dark:text-gray-400">The grade record you are looking for does not exist or has been removed.</p>
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors mx-auto"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const initialData: GradeFormData = {
        studentId: grade.studentId,
        classId: grade.classId || '',
        subjectId: grade.subject || '',
        assessmentType: grade.assessmentType,
        score: grade.score,
        maxMarks: grade.maxMarks,
        remarks: grade.remarks || '',
        studentName: grade.student?.name || 'Unknown Student',
        className: grade.class?.name || 'Unknown Class',
        subjectName: grade.subject || 'Unknown Subject',
    };

    return (
        <GradeForm
            initialData={initialData}
            isEditing={true}
            onClose={handleClose}
            onSubmit={handleSubmit}
        />
    );
}
