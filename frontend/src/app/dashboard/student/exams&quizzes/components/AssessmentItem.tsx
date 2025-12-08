import { Assessment } from './types';
import Badge from './ui/Badge';
import Link from "next/link"

interface AssessmentItemProps {
    assessment: Assessment;
}

export default function AssessmentItem({ assessment }: AssessmentItemProps) {
    const getScoreColor = (score: string | null) => {
        if (!score) return 'text-slate-800 dark:text-slate-200';

        const scoreNum = parseInt(score.replace('%', ''));
        if (scoreNum >= 90) return 'text-green-600 dark:text-green-500';
        if (scoreNum >= 80) return 'text-primary';
        if (scoreNum >= 70) return 'text-amber-600 dark:text-amber-500';
        return 'text-red-600 dark:text-red-500';
    };

    return (
        <Link href={"/dashboard/student/exams&quizzes/performance-Breakdown"} className="grid cursor-pointer grid-cols-2 items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:grid-cols-5">
            {/* Title and Subject */}
            <div className="col-span-2 md:col-span-2">
                <p className="font-semibold text-slate-900 dark:text-white">{assessment.title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{assessment.subject}</p>
            </div>

            {/* Date */}
            <div className="text-left">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Date</p>
                <p className="font-medium text-slate-800 dark:text-slate-200">{assessment.date}</p>
            </div>

            {/* Score */}
            <div className="text-left">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Score</p>
                <p className={`font-bold text-lg ${getScoreColor(assessment.score)}`}>
                    {assessment.score || '—'}
                </p>
            </div>

            {/* Status Badge */}
            <div className="col-span-2 text-left md:col-span-1 md:text-right">
                <Badge variant={assessment.status}>
                    {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
                </Badge>
            </div>
        </Link>
    );
}