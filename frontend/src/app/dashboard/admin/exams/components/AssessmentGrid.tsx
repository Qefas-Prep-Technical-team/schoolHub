import AssessmentCard from './AssessmentCard';
import { Exam, PaginationMetadata } from '@/lib/api/services/examService';
import Pagination from './Pagination';

interface AssessmentGridProps {
    assessments: Exam[];
    pagination?: PaginationMetadata;
    onPageChange?: (page: number) => void;
    viewMode?: 'grid' | 'list';
}

export default function AssessmentGrid({ assessments, pagination, onPageChange, viewMode = 'grid' }: AssessmentGridProps) {
    return (
        <div className="flex flex-col gap-6">
            {viewMode === 'grid' ? (
                <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {assessments.map((assessment) => (
                        <AssessmentCard key={assessment.id} assessment={assessment} viewMode="grid" />
                    ))}
                </section>
            ) : (
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm divide-y-2 divide-slate-100 dark:divide-slate-800">
                    {assessments.map((assessment, index) => (
                        <AssessmentCard key={assessment.id} assessment={assessment} viewMode="list" index={index} />
                    ))}
                </div>
            )}
            
            {pagination && onPageChange && (
                <Pagination pagination={pagination} onPageChange={onPageChange} />
            )}
        </div>
    );
}