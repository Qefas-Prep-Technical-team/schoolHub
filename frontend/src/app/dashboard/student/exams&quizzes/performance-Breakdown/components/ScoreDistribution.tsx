'use client';

import { ScoreRange } from './types';
import Card from './ui/Card';

interface ScoreDistributionProps {
    scores: ScoreRange[];
}

export default function ScoreDistribution({ scores }: ScoreDistributionProps) {
    const maxHeight = Math.max(...scores.map(s => s.percentage));

    return (
        <Card>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Score Distribution
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Number of students in each score range.
            </p>

            <div className="mt-4 flex h-64 items-end justify-between gap-2 sm:gap-4">
                {scores.map((score, index) => (
                    <div
                        key={index}
                        className="flex flex-1 flex-col items-center justify-end gap-2"
                        style={{ height: '100%' }}
                    >
                        {/* You marker */}
                        {score.isUserRange && (
                            <div className="absolute -top-6 rounded-md bg-primary px-2 py-1 text-xs text-white">
                                You
                            </div>
                        )}

                        {/* Bar */}
                        <div
                            className={`w-full rounded-t-md ${score.isUserRange
                                    ? 'bg-primary'
                                    : 'bg-gray-200 dark:bg-gray-700'
                                }`}
                            style={{ height: `${(score.percentage / maxHeight) * 100}%` }}
                        />

                        {/* Label */}
                        <p
                            className={`text-xs ${score.isUserRange
                                    ? 'font-bold text-primary'
                                    : 'text-gray-500 dark:text-gray-400'
                                }`}
                        >
                            {score.range}
                        </p>
                    </div>
                ))}
            </div>
        </Card>
    );
}