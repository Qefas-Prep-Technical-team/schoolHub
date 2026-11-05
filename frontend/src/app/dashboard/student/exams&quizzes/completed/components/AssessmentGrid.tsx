'use client';

import { useMemo } from 'react';
import { Assessment } from './types';
import AssessmentCard from './AssessmentCard';
import { groupByDate } from '../../utils/dateSectioning';
import { Calendar } from 'lucide-react';
import { GradingRule } from '@/utils/gradingSystem';

interface AssessmentGridProps {
    assessments: Assessment[];
    onAssessmentClick?: (assessment: Assessment) => void;
    gradingSystem?: GradingRule[] | null;
}

export default function AssessmentGrid({ assessments, onAssessmentClick, gradingSystem }: AssessmentGridProps) {
    const grouped = useMemo(() => {
        return groupByDate(assessments, (a) => a.date);
    }, [assessments]);

    if (assessments.length === 0) {
        return (
            <div className="py-16 text-center text-slate-400 font-medium">
                No completed assessments found matching your filter criteria.
            </div>
        );
    }

    return (
        <div className="space-y-8 pt-6">
            {grouped.map((group) => (
                <div key={group.label} className="space-y-4">
                    <div className="flex items-center gap-2.5 px-1">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 border border-pink-200/60 dark:border-pink-900/30 text-xs font-bold shadow-xs">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{group.label}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-400 dark:text-zinc-500">
                            ({group.items.length} {group.items.length === 1 ? 'record' : 'records'})
                        </span>
                        <div className="h-px flex-1 bg-slate-200/60 dark:border-zinc-800/80" />
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {group.items.map((assessment) => (
                            <AssessmentCard
                                key={assessment.id}
                                assessment={assessment}
                                onClick={onAssessmentClick}
                                gradingSystem={gradingSystem}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
