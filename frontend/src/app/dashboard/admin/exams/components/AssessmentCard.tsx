'use client';

import {
    School,
    Laptop,
    Calendar,
    FileText,
    ArrowRight,
    PenTool,
    BookOpen,
    Layers,
    ChevronDown,
    FileCheck,
    AlertTriangle,
    Info,
} from 'lucide-react';
import {
    DropdownMenu as ShadcnDropdown,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeleteExam, useUnpublishExam } from '@/lib/api/hooks/useExams';
import { useRouter } from 'next/navigation';
import DropdownMenu from './ui/DropdownMenu';
import Link from 'next/link';
import { Exam } from '@/lib/api/services/examService';
import { format } from 'date-fns';
import { useState } from 'react';
import ConfirmationModal from './ui/ConfirmationModal';
import { toast } from 'react-toastify';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface AssessmentCardProps {
    assessment: Exam;
    viewMode?: 'grid' | 'list';
    index?: number;
    isSelected?: boolean;
    onSelect?: (checked: boolean) => void;
}

export default function AssessmentCard({ assessment, viewMode = 'grid', index = 0, isSelected = false, onSelect }: AssessmentCardProps) {
    const router = useRouter();
    const deleteExamMutation = useDeleteExam();
    const unpublishExamMutation = useUnpublishExam();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isUnpublishDialogOpen, setIsUnpublishDialogOpen] = useState(false);

    // Connected Subject Papers list extraction:
    // Support subjectExamPapers array, subjectPapers array, papers array, or totalPapers count from backend
    const rawPapers: any[] = (assessment as any)?.subjectExamPapers?.map((sep: any) => sep.subjectPaper || sep).filter(Boolean)
        || (assessment as any)?.subjectPapers
        || (assessment as any)?.papers
        || [];
    const papersCount = rawPapers.length > 0
        ? rawPapers.length
        : Number((assessment as any)?.totalPapers || (assessment as any)?._count?.subjectExamPapers || 0);
    const isMultiPaper = assessment.mode === 'MULTI_SUBJECT' || (assessment.mode as string) === 'COMBINED' || papersCount > 1;
    const singlePaper = rawPapers[0];

    // Compute destination route:
    // If single-paper exam/quiz/CA with an existing paper, route directly to the single paper workspace:
    // /dashboard/admin/exams/:examId/papers/:paperId
    // If multiple-paper exam or paper list not yet loaded, route to:
    // /dashboard/admin/exams/:examId/papers
    const targetUrl = !isMultiPaper && singlePaper?.id
        ? `/dashboard/admin/exams/${assessment.id}/papers/${singlePaper.id}`
        : `/dashboard/admin/exams/${assessment.id}/papers`;

    // Delete modal configuration states:
    // 'ALL': delete exam and all connected subject papers + questions
    // 'EXAM_ONLY': delete exam shell only, keeping papers standalone
    // 'SELECTED_PAPERS': delete exam and only the selected subject papers
    const [deleteMode, setDeleteMode] = useState<'ALL' | 'EXAM_ONLY' | 'SELECTED_PAPERS'>('ALL');
    const [selectedPaperIdsForDelete, setSelectedPaperIdsForDelete] = useState<string[]>([]);

    const handleOpenDeleteDialog = () => {
        setDeleteMode('ALL');
        setSelectedPaperIdsForDelete(rawPapers.map((p: any) => p.id));
        setIsDeleteDialogOpen(true);
    };

    const togglePaperSelection = (paperId: string) => {
        setSelectedPaperIdsForDelete((prev: string[]) =>
            prev.includes(paperId) ? prev.filter((id: string) => id !== paperId) : [...prev, paperId]
        );
    };

    const handleDeleteExam = () => {
        let options: { deletePapers?: boolean; paperIds?: string[] } = {};
        if (isMultiPaper && rawPapers.length > 0) {
            if (deleteMode === 'EXAM_ONLY') {
                options = { deletePapers: false };
            } else if (deleteMode === 'SELECTED_PAPERS') {
                options = { deletePapers: true, paperIds: selectedPaperIdsForDelete };
            } else {
                options = { deletePapers: true };
            }
        } else {
            // Single paper or general exam
            options = { deletePapers: true };
        }

        deleteExamMutation.mutate({ id: assessment.id, options }, {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Failed to delete exam");
            }
        });
    };

    const menuItems: any[] = [
        { label: 'View Papers', href: targetUrl },
        { label: 'Edit', href: targetUrl },
    ];

    if (assessment.status === 'PUBLISHED') {
        menuItems.push({
            label: 'Unpublish',
            onClick: () => setIsUnpublishDialogOpen(true)
        });
    }

    menuItems.push({
        label: 'Delete',
        destructive: true,
        onClick: handleOpenDeleteDialog
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

    const renderModals = () => (
        <>
            <ConfirmationModal
                isOpen={isUnpublishDialogOpen}
                onClose={() => setIsUnpublishDialogOpen(false)}
                onConfirm={() => {
                    unpublishExamMutation.mutate(assessment.id, {
                        onSuccess: () => {
                            setIsUnpublishDialogOpen(false);
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
                onConfirm={handleDeleteExam}
                title={`Delete ${assessment.category === 'QUIZ' ? 'Quiz' : (assessment.category as string) === 'CA' ? 'CA' : 'Exam'}`}
                description=""
                confirmText={deleteMode === 'EXAM_ONLY' ? "Delete Exam Shell Only" : "Permanently Delete"}
                variant="danger"
                isLoading={deleteExamMutation.isPending}
            >
                <div className="space-y-4 pt-1">
                    {/* Clear Warning Alert */}
                    <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 leading-relaxed">
                        <p className="font-bold flex items-center gap-1.5 mb-1 text-rose-700 dark:text-rose-300">
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            Warning: Permanent Deletion
                        </p>
                        <p>
                            Deleting <strong className="underline underline-offset-2">{assessment.title}</strong> cannot be undone. All questions, candidate answers, and settings will be permanently removed.
                        </p>
                    </div>

                    {/* Single Paper Warning */}
                    {!isMultiPaper && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
                            <p className="font-semibold text-slate-800 dark:text-slate-200 mb-0.5">Connected Paper Deletion:</p>
                            <p>
                                The subject paper <strong className="text-slate-900 dark:text-white">"{singlePaper?.title || singlePaper?.subject?.name || assessment.title}"</strong> and all of its questions and answers will be deleted alongside this assessment.
                            </p>
                        </div>
                    )}

                    {/* Multi-Paper Exam Selection Options */}
                    {isMultiPaper && rawPapers.length > 0 && (
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                                Choose What to Delete ({rawPapers.length} Papers Connected):
                            </label>

                            <div className="space-y-2">
                                <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${deleteMode === 'ALL'
                                        ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200 font-bold'
                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                                    }`}>
                                    <input
                                        type="radio"
                                        name={`delete-mode-${assessment.id}`}
                                        value="ALL"
                                        checked={deleteMode === 'ALL'}
                                        onChange={() => setDeleteMode('ALL')}
                                        className="mt-0.5 text-rose-600 focus:ring-rose-500 cursor-pointer"
                                    />
                                    <div>
                                        <span>Delete entire exam AND all {rawPapers.length} subject papers</span>
                                        <p className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                                            Removes the composite exam along with all its attached subject papers and questions.
                                        </p>
                                    </div>
                                </label>

                                <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${deleteMode === 'SELECTED_PAPERS'
                                        ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200 font-bold'
                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                                    }`}>
                                    <input
                                        type="radio"
                                        name={`delete-mode-${assessment.id}`}
                                        value="SELECTED_PAPERS"
                                        checked={deleteMode === 'SELECTED_PAPERS'}
                                        onChange={() => setDeleteMode('SELECTED_PAPERS')}
                                        className="mt-0.5 text-rose-600 focus:ring-rose-500 cursor-pointer"
                                    />
                                    <div className="w-full">
                                        <span>Delete exam and selected papers only</span>
                                        <p className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                                            Select which papers to delete. Unchecked papers will remain available as standalone papers.
                                        </p>
                                    </div>
                                </label>

                                {deleteMode === 'SELECTED_PAPERS' && (
                                    <div className="pl-6 space-y-1.5 max-h-36 overflow-y-auto p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                                        {rawPapers.map((paper: any) => {
                                            const isChecked = selectedPaperIdsForDelete.includes(paper.id);
                                            return (
                                                <label
                                                    key={paper.id}
                                                    className="flex items-center justify-between p-1.5 rounded-lg text-xs hover:bg-white dark:hover:bg-slate-800 cursor-pointer transition-colors"
                                                >
                                                    <div className="flex items-center gap-2 min-w-0 pr-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => togglePaperSelection(paper.id)}
                                                            className="rounded text-rose-600 focus:ring-rose-500 w-3.5 h-3.5 cursor-pointer shrink-0"
                                                        />
                                                        <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                                                            {paper.title || paper.subject?.name || 'Subject Paper'}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                                                        {paper.durationMinutes || 60}m
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}

                                <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${deleteMode === 'EXAM_ONLY'
                                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 font-bold'
                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                                    }`}>
                                    <input
                                        type="radio"
                                        name={`delete-mode-${assessment.id}`}
                                        value="EXAM_ONLY"
                                        checked={deleteMode === 'EXAM_ONLY'}
                                        onChange={() => setDeleteMode('EXAM_ONLY')}
                                        className="mt-0.5 text-amber-600 focus:ring-amber-500 cursor-pointer"
                                    />
                                    <div>
                                        <span>Delete exam shell only (Keep all papers safe)</span>
                                        <p className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                                            Deletes only the main exam. All {rawPapers.length} subject papers and questions will be saved as standalone papers.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </ConfirmationModal>
        </>
    );

    if (viewMode === 'list') {
        return (
            <>
                <tr className="group border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors relative">
                    <td className="p-4 text-center relative z-10">
                        <input
                            type="checkbox"
                            className="rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            checked={isSelected}
                            onChange={(e) => onSelect?.(e.target.checked)}
                        />
                    </td>
                    <td className="p-4 text-center text-xs font-bold text-slate-400 relative z-10">
                        #{index + 1}
                    </td>
                    <td className="p-4 relative">
                        <Link href={targetUrl} className="absolute inset-0 z-0" />
                        <div className="flex flex-col gap-1.5 relative z-10 pointer-events-none">
                            <div className="flex items-center gap-2.5">
                                <div className={`h-8 w-8 rounded-lg ${theme.iconBg} flex items-center justify-center shrink-0`}>
                                    <Icon size={14} strokeWidth={2.5} />
                                </div>
                                <span className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 transition-colors">
                                    {assessment.title}
                                </span>
                            </div>

                            {/* Tag & Dropdown under assessment title in Table View */}
                            <div className="flex items-center gap-2 pl-10.5 pointer-events-auto">
                                {isMultiPaper ? (
                                    <div className="flex items-center gap-1.5">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                                            <Layers size={10} />
                                            <span>Multi-Paper ({papersCount})</span>
                                        </span>

                                        {papersCount > 0 && (
                                            <ShadcnDropdown>
                                                <DropdownMenuTrigger asChild>
                                                    <button type="button" className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors px-1 py-0.5 rounded hover:bg-purple-50 dark:hover:bg-purple-900/30 cursor-pointer">
                                                        <span>Papers</span>
                                                        <ChevronDown size={11} />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start" className="w-64 p-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl z-50">
                                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 py-1">Connected Papers ({papersCount})</p>
                                                    {rawPapers.map((p: any, pIdx: number) => (
                                                        <div
                                                            key={p.id || pIdx}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                router.push(`/dashboard/admin/exams/${assessment.id}/papers/${p.id}`);
                                                            }}
                                                            className="flex items-center justify-between p-2 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-slate-700/60 cursor-pointer transition-colors"
                                                        >
                                                            <div className="min-w-0 pr-2">
                                                                <p className="truncate font-bold text-slate-800 dark:text-slate-200">{p.title || p.subject?.name || 'Subject Paper'}</p>
                                                                <p className="text-[10px] text-slate-500 dark:text-slate-400">{p.subject?.name || 'General'}</p>
                                                            </div>
                                                            <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded shrink-0">
                                                                {p.durationMinutes || 60}m
                                                            </span>
                                                        </div>
                                                    ))}
                                                </DropdownMenuContent>
                                            </ShadcnDropdown>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                                            <FileCheck size={10} />
                                            <span>Single Paper</span>
                                        </span>

                                        {singlePaper && (
                                            <Link
                                                href={`/dashboard/admin/exams/${assessment.id}/papers/${singlePaper.id}`}
                                                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <span>{singlePaper.title || singlePaper.subject?.name || 'Open Paper'}</span>
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </td>
                    <td className="p-4 text-xs font-bold text-slate-500 relative z-10">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-slate-700 dark:text-slate-300">{assessment.scope?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                            <span className="text-[10px] uppercase tracking-wider text-slate-400">{assessment.mode?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        </div>
                    </td>
                    <td className="p-4 relative z-10">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${theme.statusBg}`}>
                            {assessment.category}
                        </span>
                    </td>
                    <td className="p-4 relative z-10">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider inline-block ${assessment.status === 'PUBLISHED' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                            {assessment.status}
                        </span>
                    </td>
                    <td className="p-4 text-xs font-semibold text-slate-500 relative z-10">
                        {format(new Date(assessment.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="p-4 text-center relative z-20">
                        <div className="flex justify-center">
                            <DropdownMenu items={menuItems} />
                        </div>
                    </td>
                </tr>
                {renderModals()}
            </>
        );
    }

    return (
        <div className={`relative rounded-3xl border ${theme.border} ${theme.bg} overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 group`}>
            <Link href={targetUrl} className="absolute inset-0 z-0" />

            {/* Top decorative bar */}
            <div className={`h-1.5 w-full ${theme.iconBg} absolute top-0 left-0`} />

            <div className="p-7 relative z-10 pointer-events-none">
                <div className="flex justify-between items-start mb-5">
                    <div className={`p-3.5 rounded-2xl shadow-lg ${theme.iconBg} transition-transform duration-500 group-hover:rotate-6`}>
                        <Icon className="h-6 w-6" strokeWidth={2.5} />
                    </div>

                    <div className="flex items-center gap-2 pointer-events-auto">
                        <span className={`px-3 py-1 text-[11px] font-black uppercase tracking-widest rounded-full ${theme.statusBg}`}>
                            {assessment.status}
                        </span>
                        <DropdownMenu items={menuItems} />
                    </div>
                </div>

                {/* Structure Tag (Single Paper / Multi-Paper) & Dropdown */}
                <div className="mb-3 flex items-center gap-2 pointer-events-auto">
                    {isMultiPaper ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/70 shadow-xs">
                                <Layers size={11} />
                                <span>Multi-Paper ({papersCount})</span>
                            </span>

                            {papersCount > 0 && (
                                <ShadcnDropdown>
                                    <DropdownMenuTrigger asChild>
                                        <button type="button" className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 px-2 py-0.5 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-purple-200/80 dark:border-purple-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors shadow-2xs cursor-pointer">
                                            <span>View Papers</span>
                                            <ChevronDown size={11} />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-64 p-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl z-50">
                                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 py-1">Connected Papers ({papersCount})</p>
                                        {rawPapers.map((p: any, pIdx: number) => (
                                            <div
                                                key={p.id || pIdx}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/dashboard/admin/exams/${assessment.id}/papers/${p.id}`);
                                                }}
                                                className="flex items-center justify-between p-2 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-slate-700/60 cursor-pointer transition-colors"
                                            >
                                                <div className="min-w-0 pr-2">
                                                    <p className="truncate font-bold text-slate-800 dark:text-slate-200">{p.title || p.subject?.name || 'Subject Paper'}</p>
                                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{p.subject?.name || 'General'}</p>
                                                </div>
                                                <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded shrink-0">
                                                    {p.durationMinutes || 60}m
                                                </span>
                                            </div>
                                        ))}
                                    </DropdownMenuContent>
                                </ShadcnDropdown>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/70 shadow-xs">
                                <FileCheck size={11} />
                                <span>Single Paper</span>
                            </span>

                            {singlePaper && (
                                <Link
                                    href={`/dashboard/admin/exams/${assessment.id}/papers/${singlePaper.id}`}
                                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50/60 dark:bg-blue-900/20 border border-blue-200/60 dark:border-blue-800/40"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <span className="truncate max-w-[140px]">{singlePaper.title || singlePaper.subject?.name || 'Open Paper'}</span>
                                </Link>
                            )}
                        </div>
                    )}
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
                        <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scope</span>
                            <TooltipProvider>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger asChild>
                                        <button type="button" className="text-slate-400 hover:text-blue-500 focus:outline-none">
                                            <Info size={12} />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl">
                                        Indicates if this assessment is meant for the entire school or specifically targeted.
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                            <School className={`h-4 w-4 ${theme.textHighlight}`} />
                            <span className="truncate">{assessment.scope?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mode</span>
                            <TooltipProvider>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger asChild>
                                        <button type="button" className="text-slate-400 hover:text-blue-500 focus:outline-none">
                                            <Info size={12} />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl">
                                        The format in which the examination will be conducted (e.g., Computer Based, Written).
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                            <Laptop className={`h-4 w-4 ${theme.textHighlight}`} />
                            <span className="truncate">{assessment.mode?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        </div>
                    </div>

                    <div className="flex flex-col col-span-2 border-t border-slate-200 dark:border-white/10 pt-4 mt-2">
                        <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Departments</span>
                            <TooltipProvider>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger asChild>
                                        <button type="button" className="text-slate-400 hover:text-blue-500 focus:outline-none">
                                            <Info size={12} />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl">
                                        Specific departments or faculties assigned to take this assessment.
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
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

            {renderModals()}
        </div>
    );
}