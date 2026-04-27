import AssessmentCard from './AssessmentCard';
import { Exam } from '@/lib/api/services/examService';

interface AssessmentGridProps {
    assessments: Exam[];
}

export default function AssessmentGrid({ assessments }: AssessmentGridProps) {
    return (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {assessments.map((assessment) => (
                <AssessmentCard key={assessment.id} assessment={assessment} />
            ))}
        </section>
    );
}
