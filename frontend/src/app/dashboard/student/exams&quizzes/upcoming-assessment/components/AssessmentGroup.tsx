import { AssessmentGroup as AssessmentGroupType } from './types';
import AssessmentCard from './AssessmentCard';

interface AssessmentGroupProps {
    group: AssessmentGroupType;
}

export default function AssessmentGroup({ group }: AssessmentGroupProps) {
    return (
        <div>
            <h2 className="mb-4 border-b border-gray-200 pb-2 text-[22px] font-bold leading-tight tracking-[-0.015em] text-gray-900 dark:border-gray-800 dark:text-gray-50">
                {group.title}
            </h2>
            <div className="flex flex-col gap-4">
                {group.assessments.map((assessment) => (
                    <AssessmentCard key={assessment.id} assessment={assessment} />
                ))}
            </div>
        </div>
    );
}