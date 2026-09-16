import { useState } from 'react';
import AssessmentCard from './AssessmentCard';
import { Exam, PaginationMetadata } from '@/lib/api/services/examService';
import Pagination from './Pagination';
import { Trash2 } from 'lucide-react';
import ConfirmationModal from './ui/ConfirmationModal';
import { useDeleteExam } from '@/lib/api/hooks/useExams';
import { toast } from 'react-toastify';

interface AssessmentGridProps {
    assessments: Exam[];
    pagination?: PaginationMetadata;
    onPageChange?: (page: number) => void;
    viewMode?: 'grid' | 'list';
}

export default function AssessmentGrid({ assessments, pagination, onPageChange, viewMode = 'grid' }: AssessmentGridProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
    const deleteExamMutation = useDeleteExam();

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(assessments.map(a => a.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(item => item !== id));
        }
    };

    const handleBulkDelete = async () => {
        try {
            // Note: Since there is no bulk delete endpoint, we loop through and delete
            await Promise.all(selectedIds.map(id => deleteExamMutation.mutateAsync(id)));
            setSelectedIds([]);
            setIsBulkDeleteOpen(false);
        } catch (error: any) {
            toast.error("Some assessments could not be deleted.");
        }
    };

    const getBaseIndex = () => {
        if (!pagination) return 0;
        return (pagination.page - 1) * pagination.limit;
    };

    return (
        <div className="flex flex-col gap-6">
            {selectedIds.length > 0 && viewMode === 'list' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {selectedIds.length} assessment{selectedIds.length !== 1 ? 's' : ''} selected
                    </span>
                    <button 
                        onClick={() => setIsBulkDeleteOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg text-sm font-bold transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete Selected
                    </button>
                </div>
            )}

            <ConfirmationModal
                isOpen={isBulkDeleteOpen}
                onClose={() => setIsBulkDeleteOpen(false)}
                onConfirm={handleBulkDelete}
                title="Delete Selected Assessments"
                description={`Are you sure you want to delete ${selectedIds.length} assessment${selectedIds.length !== 1 ? 's' : ''}? This action cannot be undone.`}
                confirmText="Delete All"
                variant="danger"
                isLoading={deleteExamMutation.isPending}
            />

            {viewMode === 'grid' ? (
                <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {assessments.map((assessment, index) => (
                        <AssessmentCard key={assessment.id} assessment={assessment} viewMode="grid" index={getBaseIndex() + index} />
                    ))}
                </section>
            ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200/80 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center w-14">
                                    <input 
                                        type="checkbox" 
                                        className="rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" 
                                        checked={assessments.length > 0 && selectedIds.length === assessments.length}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-12 text-center">#</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Assessment</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Target</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                            {assessments.map((assessment, index) => (
                                <AssessmentCard 
                                    key={assessment.id} 
                                    assessment={assessment} 
                                    viewMode="list" 
                                    index={getBaseIndex() + index} 
                                    isSelected={selectedIds.includes(assessment.id)}
                                    onSelect={(checked) => handleSelectOne(assessment.id, checked)}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {pagination && onPageChange && (
                <Pagination pagination={pagination} onPageChange={onPageChange} />
            )}
        </div>
    );
}