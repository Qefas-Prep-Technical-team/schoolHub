// src/components/Dashboard/ExamProgress.tsx
import React from 'react';
import ProgressBar from './ui/ProgressBar';
import Button from './ui/Button';

const ExamProgress: React.FC = () => {
    return (
        <div className="border-t border-[#d1d8e6] dark:border-gray-700 pt-6 flex flex-col items-center gap-4">
            <div className="w-full">
                <div className="flex justify-between mb-1">
                    <span className="text-base font-medium text-primary dark:text-primary">
                        Progress
                    </span>
                    <span className="text-sm font-medium text-primary dark:text-primary">
                        0%
                    </span>
                </div>
                <ProgressBar progress={0} />
            </div>
            <div className="w-full sm:w-auto">
                <Button
                    variant="primary"
                    size="lg"
                    icon="play_circle"
                    disabled={false}
                    className="w-full sm:w-auto cursor-pointer"
                >
                    Start Exam
                </Button>
                <p className="text-center mt-2 text-sm text-[#506795] dark:text-gray-400">
                    Exam window is not yet open.
                </p>
            </div>
        </div>
    );
};

export default ExamProgress;