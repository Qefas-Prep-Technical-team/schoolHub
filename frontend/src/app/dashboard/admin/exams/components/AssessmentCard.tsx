'use client';

import {
    School,
    Laptop,
    Calendar,
    Clock,
    FileText
} from 'lucide-react';
import { useDeleteExam, useUnpublishExam } from '@/lib/api/hooks/useExams';
import { useRouter } from 'next/navigation';
import DropdownMenu from './ui/DropdownMenu';
import Link from 'next/link';
import { Exam } from '@/lib/api/services/examService';
import { format } from 'date-fns';
import { useState } from 'react';
import ConfirmationModal from './ui/ConfirmationModal';
import { toast } from 'react-toastify';

interface AssessmentCardProps {
    assessment: Exam;
}

const statusStyles = {
    UPCOMING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    ONGOING: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    PUBLISHED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
};

export default function AssessmentCard({ assessment }: AssessmentCardProps) {
    const router = useRouter();
    const deleteExamMutation = useDeleteExam();
    const unpublishExamMutation = useUnpublishExam();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isUnpublishDialogOpen, setIsUnpublishDialogOpen] = useState(false);

    const menuItems = [
        { label: 'View Papers', onClick: () => router.push(`/dashboard/admin/exams/${assessment.id}/papers`) },
        { label: 'Edit', onClick: () => router.push(`/dashboard/admin/exams/${assessment.id}/edit`) },
    ];

    if (assessment.status === 'PUBLISHED') {
        menuItems.push({ 
            label: 'Unpublish', 
            onClick: () => setIsUnpublishDialogOpen(true)
        });
    }

    menuItems.push({ 
        label: 'Delete', 
        onClick: () => setIsDeleteDialogOpen(true)
    });

    return (
        <div className="flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden hover:border-primary/50 transition-colors relative group">
            <Link href={`/dashboard/admin/exams/${assessment.id}/papers`} className="absolute inset-0 z-0" />
            <div className="p-5 relative z-10 pointer-events-none">
                <div className="flex justify-between items-start">
                    <div className="pointer-events-auto">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {assessment.title}
                        </h3>
                        {assessment.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                {assessment.description}
                            </p>
                        )}
                    </div>

                    <div className="pointer-events-auto">
                        <DropdownMenu items={menuItems} />
                    </div>
                </div>

                <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <School size={16} />
                        <span>Scope: {assessment.scope}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <FileText size={16} />
                        <span>Mode: {assessment.mode}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Laptop size={16} />
                        <span>Creation: {assessment.creationMode}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Calendar size={16} />
                        <span>Created: {format(new Date(assessment.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                </div>
            </div>

            <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 relative z-10">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    statusStyles[assessment.status as keyof typeof statusStyles] || statusStyles.DRAFT
                }`}>
                    {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1).toLowerCase()}
                </span>
            </div>

            <ConfirmationModal
                isOpen={isUnpublishDialogOpen}
                onClose={() => setIsUnpublishDialogOpen(false)}
                onConfirm={() => {
                    unpublishExamMutation.mutate(assessment.id, {
                        onSuccess: () => {
                            setIsUnpublishDialogOpen(false);
                            toast.success("Exam unpublished successfully!");
                        },
                        onError: (error: any) => {
                            toast.error(error.response?.data?.message || "Failed to unpublish exam");
                        }
                    });
                }}
                title="Unpublish Exam"
                description={`Are you sure you want to unpublish "${assessment.title}"? Student access will be restricted immediately.`}
                confirmText="Unpublish"
                variant="warning"
                isLoading={unpublishExamMutation.isPending}
            />

            <ConfirmationModal
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={() => {
                    deleteExamMutation.mutate(assessment.id, {
                        onSuccess: () => {
                            setIsDeleteDialogOpen(false);
                            toast.success("Exam deleted successfully!");
                        },
                        onError: (error: any) => {
                            toast.error(error.response?.data?.message || "Failed to delete exam");
                        }
                    });
                }}
                title="Delete Exam"
                description={`This will permanently delete "${assessment.title}" and all its subject papers. This action cannot be undone.`}
                confirmText="Delete Exam"
                variant="danger"
                isLoading={deleteExamMutation.isPending}
            />
        </div>
    );
}