'use client';

import { PublishStatus } from './types';
import Input from './ui/Input';


interface DueDateSchedulingProps {
    dueDate: string;
    onDueDateChange: (date: string) => void;
    publishStatus: PublishStatus;
    onPublishStatusChange: (status: PublishStatus) => void;
    scheduledDate?: string;
    onScheduledDateChange?: (date: string) => void;
    scoreReleaseDate?: string;
    onScoreReleaseDateChange?: (date: string) => void;
}

export default function DueDateScheduling({
    dueDate,
    onDueDateChange,
    publishStatus,
    onPublishStatusChange,
    scheduledDate,
    onScheduledDateChange,
    scoreReleaseDate,
    onScoreReleaseDateChange
}: DueDateSchedulingProps) {
    const getDefaultDueDate = () => {
        const date = new Date();
        date.setDate(date.getDate() + 7); // One week from now
        date.setHours(23, 59, 0, 0); // End of day
        return date.toISOString().slice(0, 16);
    };

    return (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-xl border border-[#E4E4E7] dark:border-[#2D2D2F]">
            <h2 className="text-[#0e121b] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-6 pt-5 pb-3 border-b border-[#E4E4E7] dark:border-[#2D2D2F]">
                Due Date & Scheduling
            </h2>

            <div className="p-6 space-y-6">
                <div className="w-full md:w-1/2">
                    <Input
                        label="Due Date & Time"
                        type="datetime-local"
                        value={dueDate || getDefaultDueDate()}
                        onChange={(e) => onDueDateChange(e.target.value)}
                    />
                </div>

                <div>
                    <p className="text-[#0e121b] dark:text-white text-base font-medium leading-normal pb-3">
                        Publish Status
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(['publish-now', 'schedule-later'] as PublishStatus[]).map((status) => (
                            <label
                                key={status}
                                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${publishStatus === status
                                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                        : 'border-[#d1d8e6] dark:border-[#374151] hover:border-primary'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    className="form-radio text-primary focus:ring-primary mr-3"
                                    name="publish_status"
                                    value={status}
                                    checked={publishStatus === status}
                                    onChange={(e) => onPublishStatusChange(e.target.value as PublishStatus)}
                                />
                                <span className="text-[#0e121b] dark:text-white text-sm font-medium capitalize">
                                    {status.replace('-', ' ')}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {publishStatus === 'schedule-later' && onScheduledDateChange && (
                    <div className="w-full md:w-1/2">
                        <Input
                            label="Schedule Date & Time"
                            type="datetime-local"
                            value={scheduledDate || ''}
                            onChange={(e) => onScheduledDateChange(e.target.value)}
                            min={new Date().toISOString().slice(0, 16)}
                        />
                    </div>
                )}

                <div className="w-full md:w-1/2">
                    <Input
                        label="Result Release Date & Time"
                        type="datetime-local"
                        value={scoreReleaseDate || ''}
                        onChange={(e) => onScoreReleaseDateChange?.(e.target.value)}
                    />
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        If left blank, results will be released on the deadline.
                    </p>
                </div>
            </div>
        </div>
    );
}
