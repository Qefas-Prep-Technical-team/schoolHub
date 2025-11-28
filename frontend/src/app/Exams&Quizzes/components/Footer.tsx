import { AlertTriangle } from 'lucide-react';
import Button from './ui/Button';
import Countdown from './ui/Countdown';

interface FooterProps {
    countdown: {
        hours: number;
        minutes: number;
        seconds: number;
    };
    onStartExam: () => void;
    examStartTime?: string;
}

export default function Footer({ countdown, onStartExam, examStartTime }: FooterProps) {
    return (
        <footer className="sticky bottom-0 z-10 w-full bg-card-background/90 dark:bg-background-dark/90 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 p-4 sm:p-6">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Countdown Timer */}
                <div className="text-center sm:text-left">
                    <p className="text-primary-text dark:text-white font-bold">
                        {examStartTime ? 'Exam starts in:' : 'Time remaining:'}
                    </p>
                    <Countdown {...countdown} />
                </div>

                {/* Start Exam Button */}
                <div className="flex flex-col items-center w-full sm:w-auto">
                    <Button
                        onClick={onStartExam}
                        className="w-full sm:w-auto max-w-xs h-12 text-base font-bold px-8"
                    >
                        Start Exam
                    </Button>
                    <p className="text-xs text-warning-text/80 font-medium mt-2 flex items-center gap-1">
                        <AlertTriangle size={14} />
                        Do not refresh the page during the exam.
                    </p>
                </div>
            </div>
        </footer>
    );
}