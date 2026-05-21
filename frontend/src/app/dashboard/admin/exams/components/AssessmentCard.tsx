'use client';

import {
    Calendar,
    FileText,
    Trophy,
    Target,
    Activity,
    ArrowRight,
    Edit2,
    Trash2,
    Undo2
} from 'lucide-react';
import { useDeleteExam, useUnpublishExam } from '@/lib/api/hooks/useExams';
import { useRouter } from 'next/navigation';
import DropdownMenu from './ui/DropdownMenu';
import { Exam } from '@/lib/api/services/examService';
import { format } from 'date-fns';
import { useState } from 'react';
import ConfirmationModal from './ui/ConfirmationModal';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import { useSchoolSettings } from '@/lib/api/hooks/useSchool';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';

interface AssessmentCardProps {
    assessment: Exam;
}

const statusStyles = {
    UPCOMING: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    ONGOING: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    COMPLETED: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    DRAFT: 'bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    PUBLISHED: 'bg-primary/5 text-primary border-indigo-100 dark:bg-primary/50/10 dark:text-indigo-400 dark:border-primary/20',
};

export default function AssessmentCard({ assessment }: AssessmentCardProps) {
    const router = useRouter();
    const { user } = useAuthStore();
    const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
    const { data: settings } = useSchoolSettings(schoolId);
    const primaryColor = settings?.themeColor || '#2563eb';

    const deleteExamMutation = useDeleteExam();
    const unpublishExamMutation = useUnpublishExam();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isUnpublishDialogOpen, setIsUnpublishDialogOpen] = useState(false);

    const menuItems = [
        { label: 'View Papers', onClick: () => router.push(`/dashboard/admin/exams/${assessment.id}/papers`), icon: <FileText size={14} /> },
        { label: 'Edit Exam', onClick: () => router.push(`/dashboard/admin/exams/${assessment.id}/edit`), icon: <Edit2 size={14} /> },
    ];
 
    if (assessment.status === 'PUBLISHED') {
        menuItems.push({ 
            label: 'Withdraw', 
            onClick: () => setIsUnpublishDialogOpen(true),
            icon: <Undo2 size={14} />
        });
    }
 
    menuItems.push({ 
        label: 'Delete', 
        onClick: () => setIsDeleteDialogOpen(true),
        icon: <Trash2 size={14} className="text-rose-500" />
    });

    return (
        <div 
            className="group relative bg-white dark:bg-slate-900/40 backdrop-blur-3xl border border-slate-100 dark:border-white/5 rounded-[3.5rem] p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col h-full"
            onClick={() => router.push(`/dashboard/admin/exams/${assessment.id}/papers`)}
        >
            {/* Dynamic Ambient Glow */}
            <div 
                className="absolute -right-10 -top-10 w-48 h-48 rounded-full blur-[80px] opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-700 pointer-events-none" 
                style={{ backgroundColor: primaryColor }}
            />

            <div className="flex justify-between items-start mb-10 relative z-10">
                <div className="flex items-center gap-5">
                    <div 
                        className="size-16 rounded-[1.5rem] bg-slate-50 dark:bg-white/5 flex items-center justify-center p-4 text-slate-400 group-hover:scale-110 transition-all duration-500 border border-slate-100 dark:border-white/5 shadow-inner"
                        style={{ color: primaryColor }}
                    >
                        <Trophy className="size-full" strokeWidth={2.5} />
                    </div>
                    <div className="space-y-1">
                        <div className={cn(
                            "inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                            statusStyles[assessment.status as keyof typeof statusStyles] || statusStyles.DRAFT
                        )}>
                            {assessment.status}
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                             {assessment.scope} EXAM
                        </div>
                    </div>
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu items={menuItems} />
                </div>
            </div>

            <div className="flex-1 relative z-10">
                <h3 
                    className="text-2xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-primary transition-colors leading-[1.1] uppercase tracking-tighter"
                    style={{ '--primary': primaryColor } as React.CSSProperties}
                >
                    {assessment.title}
                </h3>
                {assessment.description && (
                    <p className="text-sm font-medium text-slate-500 line-clamp-2 mb-8 leading-relaxed italic">
                        &quot;{assessment.description}&quot;
                    </p>
                )}
            </div>

            <div className="space-y-6 pt-8 border-t border-slate-50 dark:border-white/5 relative z-10">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Category</span>
                        <div className="flex items-center gap-2">
                             <Target size={12} className="text-primary" />
                             <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">{assessment.mode}</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date Created</span>
                        <div className="flex items-center gap-2">
                             <Calendar size={12} className="text-emerald-500" />
                             <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">
                                {format(new Date(assessment.createdAt), 'MMM d, yy')}
                             </span>
                        </div>
                    </div>
                </div>
 
                {assessment.departments && assessment.departments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {assessment.departments.map((d: { department?: { id: string, name: string } }) => (
                            <span key={d.department?.id} className="text-[9px] font-black bg-slate-50 dark:bg-white/5 text-slate-500 px-3 py-1 rounded-lg border border-slate-100 dark:border-white/10 uppercase tracking-tighter">
                                {d.department?.name}
                            </span>
                        ))}
                    </div>
                )}
 
                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                            <Activity size={14} strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Status: Active
                        </span>
                    </div>
                    <div 
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] group-hover:gap-4 transition-all"
                        style={{ color: primaryColor }}
                    >
                        <span>View Exam</span>
                        <ArrowRight size={14} strokeWidth={3} />
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
                        onError: (error: { response?: { data?: { message?: string } } }) => {
                            toast.error(error.response?.data?.message || "Failed to unpublish exam");
                        }
                    });
                }}
                title="Withdraw Exam"
                description={`Confirm withdrawal of exam "${assessment.title}". Students will no longer be able to access it.`}
                confirmText="Withdraw Exam"
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
                        onError: (error: { response?: { data?: { message?: string } } }) => {
                            toast.error(error.response?.data?.message || "Failed to delete exam");
                        }
                    });
                }}
                title="Delete Exam"
                description={`This action will permanently delete "${assessment.title}" and all its subject papers. This action cannot be undone.`}
                confirmText="Delete Exam"
                variant="danger"
                isLoading={deleteExamMutation.isPending}
            />
        </div>
    );
}

