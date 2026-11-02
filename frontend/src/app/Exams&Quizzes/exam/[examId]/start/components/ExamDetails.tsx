// src/components/Dashboard/ExamDetails.tsx
import React from 'react';
import { ExamDetail } from './types';

interface ExamDetailsProps {
    classLabel: string;
    durationMinutes: number;
    subjectName: string;
    totalQuestions: number;
    status?: 'live' | 'upcoming' | 'ended' | 'submitted';
    statusLabel?: string;
}

const ExamDetails: React.FC<ExamDetailsProps> = ({ 
    classLabel, 
    durationMinutes, 
    subjectName, 
    totalQuestions,
    status,
    statusLabel,
}) => {
    const details: ExamDetail[] = [
        { label: 'Class', value: classLabel },
        { label: 'Duration', value: `${durationMinutes} Minutes` },
        { label: 'Subject', value: subjectName },
        { label: 'Total Questions', value: totalQuestions.toString() },
    ];

    return (
        <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 backdrop-blur-sm p-5 shadow-sm">
            <div className={`grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 ${status ? 'md:grid-cols-5' : 'md:grid-cols-4'}`}>
                {details.map((detail) => (
                    <div key={detail.label} className="flex flex-col gap-1 py-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            {detail.label}
                        </p>
                        <p className="text-base font-bold leading-normal text-slate-900 dark:text-slate-100">
                            {detail.value}
                        </p>
                    </div>
                ))}

                {status && (
                    <div className="flex flex-col gap-1 py-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Status
                        </p>
                        <div className="flex items-center gap-1.5 pt-0.5">
                            {status === 'live' && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                    {statusLabel || 'Live Assessment'}
                                </span>
                            )}
                            {status === 'upcoming' && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                                    {statusLabel || 'Upcoming'}
                                </span>
                            )}
                            {status === 'submitted' && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                    {statusLabel || 'Submitted'}
                                </span>
                            )}
                            {status === 'ended' && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                                    <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                                    {statusLabel || 'Ended'}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExamDetails;