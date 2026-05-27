'use client';

import {
    School,
    Laptop,
    Calendar,
    FileText,
    ArrowRight,
    PenTool,
    BookOpen
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

    const isQuiz = assessment.category === 'QUIZ';
    const isCA = (assessment.category as string) === 'CA';
    const isExam = !isQuiz && !isCA;

    // Distinct Theme Configuration
    const theme = isQuiz ? {
        border: 'border-orange-500/20 hover:border-orange-500/50',
        bg: 'bg-gradient-to-br from-white to-orange-50 dark:from-slate-900 dark:to-orange-950/20',
        iconBg: 'bg-orange-500 text-white shadow-orange-500/30',
        textHighlight: 'text-orange-600 dark:text-orange-400',
        statusBg: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
        icon: PenTool,
        accentHover: 'group-hover:bg-orange-500'
    } : isCA ? {
        border: 'border-emerald-500/20 hover:border-emerald-500/50',
        bg: 'bg-gradient-to-br from-white to-emerald-50 dark:from-slate-900 dark:to-emerald-950/20',
        iconBg: 'bg-emerald-500 text-white shadow-emerald-500/30',
        textHighlight: 'text-emerald-600 dark:text-emerald-400',
        statusBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        icon: BookOpen,
        accentHover: 'group-hover:bg-emerald-500'
    } : {
        border: 'border-blue-500/20 hover:border-blue-500/50',
        bg: 'bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-blue-950/20',
        iconBg: 'bg-blue-600 text-white shadow-blue-600/30',
        textHighlight: 'text-blue-600 dark:text-blue-400',
        statusBg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        icon: FileText,
        accentHover: 'group-hover:bg-blue-600'
    };

    const Icon = theme.icon;

    return (
        <div className={`relative rounded-3xl border ${theme.border} ${theme.bg} overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 group`}>
            <Link href={`/dashboard/admin/exams/${assessment.id}/papers`} className="absolute inset-0 z-0" />
            
            {/* Top decorative bar */}
            <div className={`h-1.5 w-full ${theme.iconBg} absolute top-0 left-0`} />

            <div className="p-7 relative z-10 pointer-events-none">
                <div className="flex justify-between items-start mb-6">
                    <div className={`p-3.5 rounded-2xl shadow-lg ${theme.iconBg} transition-transform duration-500 group-hover:rotate-6`}>
                        <Icon className="h-6 w-6" strokeWidth={2.5} />
                    </div>
                    
                    <div className="flex items-center gap-3 pointer-events-auto">
                        <span className={`px-3 py-1 text-[11px] font-black uppercase tracking-widest rounded-full ${theme.statusBg}`}>
                            {assessment.status}
                        </span>
                        <DropdownMenu items={menuItems} />
                    </div>
                </div>

                <div className="pointer-events-auto">
                    <h3 className={`font-black text-2xl mb-2 text-slate-900 dark:text-white line-clamp-1 transition-colors group-hover:${theme.textHighlight}`}>
                        {assessment.title}
                    </h3>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-2 h-10">
                        {assessment.description || "No description provided."}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-y-4 mt-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Scope</span>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                            <School className={`h-4 w-4 ${theme.textHighlight}`} />
                            <span className="truncate">{assessment.scope?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mode</span>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                            <Laptop className={`h-4 w-4 ${theme.textHighlight}`} />
                            <span className="truncate">{assessment.mode?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        </div>
                    </div>

                    <div className="flex flex-col col-span-2 border-t border-slate-200 dark:border-white/10 pt-4 mt-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Departments</span>
                        {assessment.departments && assessment.departments.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {assessment.departments.map((d: any) => (
                                    <span key={d.department?.id} className={`text-[10px] px-2 py-1 rounded-md border font-bold uppercase tracking-wider ${theme.statusBg} border-transparent`}>
                                        {d.department?.name}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md font-bold uppercase tracking-widest inline-block">
                                General Assessment
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-end mt-8 pt-5 border-t border-slate-200 dark:border-white/10 pointer-events-none">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Created</span>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(new Date(assessment.createdAt), 'MMM d, yyyy')}
                        </div>
                    </div>
                    
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-400 ${theme.accentHover} group-hover:text-white transition-all duration-300`}>
                        <ArrowRight className="h-5 w-5" />
                    </div>
                </div>
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
                description={`Are you sure you want to delete "${assessment.title}"? This cannot be undone.`}
                confirmText="Delete"
                variant="danger"
                isLoading={deleteExamMutation.isPending}
            />
        </div>
    );
}