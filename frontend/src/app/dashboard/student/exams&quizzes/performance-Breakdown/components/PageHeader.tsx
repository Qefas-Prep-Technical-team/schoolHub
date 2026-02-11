import Button from './ui/Button';
import { FileText } from 'lucide-react';
import { AssessmentInfo } from './types';
import Link from 'next/link';

interface PageHeaderProps {
    assessment: AssessmentInfo;
    onReviewQuestions?: () => void;
}

export default function PageHeader({ assessment, onReviewQuestions }: PageHeaderProps) {
    return (
        <header className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-72 flex-col gap-1">
                <h1 className="text-3xl font-black leading-tight tracking-[-0.033em] text-gray-900 dark:text-white md:text-4xl">
                    Performance Breakdown
                </h1>
                <p className="text-base font-normal leading-normal text-gray-500 dark:text-[#95a5c6]">
                    {assessment.title} - {assessment.date.replace('Taken on ', '')}
                </p>
            </div>
            <Link href={"/dashboard/student/exams&quizzes/performance-Breakdown/review-questions"}>
                <Button
                    className='cursor-pointer'
                    onClick={onReviewQuestions}
                    icon={<FileText className="h-4 w-4" />}
                >
                    Review Questions
                </Button>
            </Link>
        </header>
    );
}