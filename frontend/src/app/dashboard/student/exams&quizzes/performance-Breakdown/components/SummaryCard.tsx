'use client';

import { AssessmentInfo } from './types';
import Card from './ui/Card';
import CircularProgress from './ui/CircularProgress';

interface SummaryCardProps {
    assessment: AssessmentInfo;
}

export default function SummaryCard({ assessment }: SummaryCardProps) {
    return (
        <Card className="@container">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                {/* Assessment Info */}
                <div className="flex-1">
                    <p className="text-lg font-bold leading-tight tracking-[-0.015em] text-gray-900 dark:text-white">
                        {assessment.title}
                    </p>
                    <p className="mt-1 text-base font-normal leading-normal text-gray-500 dark:text-[#95a5c6]">
                        {assessment.date}
                    </p>
                </div>

                {/* Score Display */}
                <div className="flex items-center gap-4">
                    {/* Circular Progress */}
                    <div className="relative size-24">
                        <svg className="size-full" viewBox="0 0 36 36">
                            <circle
                                className="stroke-gray-200 dark:stroke-gray-700"
                                cx="18"
                                cy="18"
                                fill="none"
                                r="16"
                                strokeWidth="3"
                            />
                            <circle
                                className="stroke-primary"
                                cx="18"
                                cy="18"
                                fill="none"
                                r="16"
                                strokeDasharray="100"
                                strokeDashoffset={100 - assessment.percentage}
                                strokeLinecap="round"
                                strokeWidth="3"
                                transform="rotate(-90 18 18)"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                                {assessment.percentage}%
                            </span>
                        </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="text-right">
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {assessment.score}{' '}
                            <span className="text-xl text-gray-500 dark:text-[#95a5c6]">
                                / {assessment.total}
                            </span>
                        </p>
                        <p className="text-gray-500 dark:text-[#95a5c6]">Your Score</p>
                    </div>
                </div>
            </div>
        </Card>
    );
}