'use client';

import SubjectPaperCard from './SubjectPaperCard';
import { SubjectPaper } from '@/lib/api/services/examService';

interface SubjectPaperGridProps {
    papers: SubjectPaper[];
}

export default function SubjectPaperGrid({ papers }: SubjectPaperGridProps) {
    return (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {papers.map((paper) => (
                <SubjectPaperCard key={paper.id} paper={paper} />
            ))}
        </section>
    );
}

