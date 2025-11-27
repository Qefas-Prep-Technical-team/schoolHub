import AssessmentCard from './AssessmentCard';

interface Assessment {
    id: string;
    title: string;
    subject: string;
    class: string;
    teacher: string;
    type: string;
    date: string;
    duration: string;
    status: 'upcoming' | 'graded' | 'ongoing' | 'marking' | 'completed' | 'draft';
}

interface AssessmentGridProps {
    assessments: Assessment[];
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