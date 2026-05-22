import AssessmentCard from './AssessmentCard';
import { Exam, PaginationMetadata } from '@/lib/api/services/examService';
import Pagination from './Pagination';

interface AssessmentGridProps {
    assessments: Exam[];
    pagination?: PaginationMetadata;
    onPageChange?: (page: number) => void;
}

export default function AssessmentGrid({ assessments, pagination, onPageChange }: AssessmentGridProps) {
    return (
        <div className="flex flex-col gap-6">
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {assessments.map((assessment) => (
                    <AssessmentCard key={assessment.id} assessment={assessment} />
                ))}
            </section>
            
            {pagination && onPageChange && (
                <Pagination pagination={pagination} onPageChange={onPageChange} />
            )}
        </div>
    );
}