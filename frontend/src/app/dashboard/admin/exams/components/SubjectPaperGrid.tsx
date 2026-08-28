'use client';

import SubjectPaperCard from './SubjectPaperCard';
import { SubjectPaper, PaginationMetadata } from '@/lib/api/services/examService';
import Pagination from './Pagination';

interface SubjectPaperGridProps {
    papers: SubjectPaper[];
    pagination?: PaginationMetadata;
    onPageChange?: (page: number) => void;
    viewMode?: 'grid' | 'list';
}

export default function SubjectPaperGrid({ papers, pagination, onPageChange, viewMode = 'grid' }: SubjectPaperGridProps) {
    return (
        <div className="flex flex-col gap-6">
            {viewMode === 'grid' ? (
                <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {papers.map((paper) => (
                        <SubjectPaperCard key={paper.id} paper={paper} viewMode="grid" />
                    ))}
                </section>
            ) : (
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm divide-y-2 divide-slate-100 dark:divide-slate-800">
                    {papers.map((paper, index) => (
                        <SubjectPaperCard key={paper.id} paper={paper} viewMode="list" index={index} />
                    ))}
                </div>
            )}

            {pagination && onPageChange && (
                <Pagination pagination={pagination} onPageChange={onPageChange} />
            )}
        </div>
    );
}
