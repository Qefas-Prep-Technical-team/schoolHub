'use client';

import SubjectPaperCard from './SubjectPaperCard';
import { SubjectPaper, PaginationMetadata } from '@/lib/api/services/examService';
import Pagination from './Pagination';

interface SubjectPaperGridProps {
    papers: SubjectPaper[];
    pagination?: PaginationMetadata;
    onPageChange?: (page: number) => void;
}

export default function SubjectPaperGrid({ papers, pagination, onPageChange }: SubjectPaperGridProps) {
    return (
        <div className="flex flex-col gap-6">
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {papers.map((paper) => (
                    <SubjectPaperCard key={paper.id} paper={paper} />
                ))}
            </section>

            {pagination && onPageChange && (
                <Pagination pagination={pagination} onPageChange={onPageChange} />
            )}
        </div>
    );
}
