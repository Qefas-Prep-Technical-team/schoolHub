import { Assessment } from './types';
import AssessmentItem from './AssessmentItem';

interface AssessmentListProps {
    assessments: Assessment[];
    title?: string;
}

export default function AssessmentList({ assessments, title = 'Assessments' }: AssessmentListProps) {
    return (
        <div className="mt-8">
            <div className="flex flex-col gap-4">
                {assessments.map((assessment) => (
                    <AssessmentItem key={assessment.id} assessment={assessment} />
                ))}
            </div>
        </div>
    );
}