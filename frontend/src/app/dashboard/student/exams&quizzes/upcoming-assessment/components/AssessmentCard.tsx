import Link from 'next/link';
import { Assessment } from './types';
import Badge from './ui/Badge';
import Button from './ui/Button';

interface AssessmentCardProps {
    assessment: Assessment;
}

export default function AssessmentCard({ assessment }: AssessmentCardProps) {
    const getIcon = (format: Assessment['format']) => {
        switch (format) {
            case 'CBT':
                return 'laptop_chromebook';
            case 'Written':
                return 'edit_note';
            case 'Oral':
                return 'mic';
            default:
                return 'laptop_chromebook';
        }
    };

    const handleViewDetails = () => {
        console.log('View details for:', assessment.title);
        // Navigate to assessment details
    };

    return (
        <Link href={"/Exams&Quizzes/exam/1"} className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/50 sm:flex-row sm:items-start">
            {/* Assessment Info */}
            <div className="flex-grow">
                <div className="mb-2 flex items-center gap-3">
                    <h3 className="text-lg font-bold leading-tight tracking-[-0.015em] text-gray-900 dark:text-gray-50">
                        {assessment.title}
                    </h3>
                    <Badge variant={assessment.type}>
                        {assessment.type.charAt(0).toUpperCase() + assessment.type.slice(1)}
                    </Badge>
                </div>

                {/* Assessment Details */}
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                    {/* Date & Time */}
                    <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base">calendar_today</span>
                        <span>{assessment.date}, {assessment.time}</span>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base">timer</span>
                        <span>{assessment.duration}</span>
                    </div>

                    {/* Format */}
                    <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base">
                            {getIcon(assessment.format)}
                        </span>
                        <span>{assessment.format}</span>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <Button
                onClick={handleViewDetails}
                className="mt-3 w-full sm:mt-0 sm:w-auto"
            >
                View Details
            </Button>
        </Link>
    );
}