'use client';

import { Assessment } from './types';
import AssessmentCard from './AssessmentCard';

interface AssessmentGridProps {
    assessments: Assessment[];
    onAssessmentClick?: (assessment: Assessment) => void;
}

export default function AssessmentGrid({ assessments, onAssessmentClick }: AssessmentGridProps) {
    return (
        <div className="grid grid-cols-1 gap-6 pt-6 md:grid-cols-2 lg:grid-cols-3">
            {assessments.map((assessment) => (
                <AssessmentCard
                    key={assessment.id}
                    assessment={assessment}
                    onClick={onAssessmentClick}
                />
            ))}
        </div>
    );
}