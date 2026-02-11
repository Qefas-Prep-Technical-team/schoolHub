'use client';

import { Assignment } from './types';
import AttachmentCard from './ui/AttachmentCard';


interface InstructionsCardProps {
    assignment: Assignment;
}

export default function InstructionsCard({ assignment }: InstructionsCardProps) {
    return (
        <div className="bg-white dark:bg-[#191e2b] rounded-xl p-6">
            <h2 className="text-gray-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] mb-4">
                Instructions
            </h2>

            <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 mb-6">
                <div dangerouslySetInnerHTML={{ __html: assignment.instructions }} />
            </div>

            {assignment.attachments.length > 0 && (
                <>
                    <h3 className="text-gray-800 dark:text-gray-200 text-base font-bold mt-6 mb-3">
                        Attachments
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {assignment.attachments.map((attachment) => (
                            <AttachmentCard
                                key={attachment.id}
                                attachment={attachment}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}