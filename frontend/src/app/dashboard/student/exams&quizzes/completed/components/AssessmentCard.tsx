'use client';

import { Assessment } from './types';
import Card from './ui/Card';
import Button from './ui/Button';
import { BarChart } from 'lucide-react';
import { getGradeEvaluation, GradingRule } from '@/utils/gradingSystem';

interface AssessmentCardProps {
    assessment: Assessment;
    onClick?: (assessment: Assessment) => void;
    gradingSystem?: GradingRule[] | null;
}

export default function AssessmentCard({ assessment, onClick, gradingSystem }: AssessmentCardProps) {
    const handleViewBreakdown = () => {
        onClick?.(assessment);
    };

    const evalResult = getGradeEvaluation(assessment.score.percentage, gradingSystem);

    return (
        <Card className="flex flex-col">
            <div className="p-5">
                {/* Header with subject and dynamic school grading badge */}
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {assessment.subject}
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase border ${evalResult.color} ${evalResult.bg}`}>
                        Grade {evalResult.grade} • {evalResult.remark}
                    </span>
                </div>

                {/* Assessment Title */}
                <h3 className="mt-2 text-lg font-semibold text-gray-800 dark:text-white">
                    {assessment.title}
                </h3>

                {/* Score Display */}
                <div className="mt-4 flex items-end justify-between">
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">
                        {assessment.score.obtained}
                        <span className="text-xl font-medium text-gray-400 dark:text-gray-500">
                            /{assessment.score.total}
                        </span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        You: {assessment.score.percentage}%{' '}
                        <span className="text-gray-400 dark:text-gray-500">|</span>{' '}
                        Class Avg: {assessment.classAverage}%
                    </p>
                </div>
            </div>

            {/* Action Button */}
            <div className="mt-auto border-t border-gray-200/80 p-3 dark:border-gray-700/60">
                <Button
                    variant="ghost"
                    onClick={handleViewBreakdown}
                    icon={<BarChart className="h-4 w-4" />}
                    className="w-full"
                >
                    View Breakdown
                </Button>
            </div>
        </Card>
    );
}
