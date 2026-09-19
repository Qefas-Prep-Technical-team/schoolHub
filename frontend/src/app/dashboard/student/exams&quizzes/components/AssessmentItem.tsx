'use client';

import { Assessment } from './types';
import Badge from './ui/Badge';
import Link from "next/link";
import { Clock, BookOpen, ChevronRight, Activity, Calendar, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface AssessmentItemProps {
    assessment: Assessment;
    index: number;
}

export default function AssessmentItem({ assessment, index }: AssessmentItemProps) {
    const [timeLeftStr, setTimeLeftStr] = useState<string | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (assessment.status !== 'coming soon' && assessment.status !== 'open' && assessment.status !== 'ongoing') return;
        
        const updateTimer = () => {
            const now = new Date();
            const start = assessment.startDate ? new Date(assessment.startDate) : null;
            const end = assessment.endDate ? new Date(assessment.endDate) : null;

            if (start && now < start && assessment.status === 'coming soon') {
                const diff = start.getTime() - now.getTime();
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                if (hours < 24) {
                    setTimeLeftStr(`Starts in ${hours}h ${mins}m`);
                } else {
                    setTimeLeftStr(null);
                }
            } else if (end && now < end && (assessment.status === 'open' || assessment.status === 'ongoing')) {
                const diff = end.getTime() - now.getTime();
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                setTimeLeftStr(`Ends in ${hours}h ${mins}m`);
            } else {
                setTimeLeftStr(null);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 60000);
        return () => clearInterval(interval);
    }, [assessment]);

    const getScoreColor = (score: string | null) => {
        if (!score) return 'text-slate-400';
        const scoreNum = parseInt(score.replace('%', ''));
        if (scoreNum >= 75) return 'text-emerald-500';
        if (scoreNum >= 50) return 'text-amber-500';
        return 'text-rose-500';
    };

    const isLive = assessment.status === 'open' || assessment.status === 'ongoing';

    return (
        <tr 
            onClick={() => {
                if (isNavigating) return;
                setIsNavigating(true);
                router.push(`/dashboard/student/exams&quizzes/${assessment.id}`);
            }}
            className={cn(
                "group border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors relative cursor-pointer",
                isNavigating ? "opacity-50 pointer-events-none" : ""
            )}
        >
            <td className="p-4 relative text-center">
                <span className="text-xs font-bold text-slate-400">
                    {index < 10 ? `0${index}` : index}
                </span>
            </td>
            <td className="p-4 relative">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-pink-600 transition-colors shrink-0">
                        {assessment.type === 'exam' ? <BookOpen size={18} strokeWidth={2.5} /> : <Activity size={18} strokeWidth={2.5} />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-pink-600 transition-colors">
                            {assessment.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                            <span className="truncate">{assessment.subject}</span>
                        </div>
                    </div>
                </div>
            </td>
            <td className="p-4 relative">
                <div className="flex flex-col gap-0.5">
                    {timeLeftStr ? (
                        <span className={`text-[11px] font-black tracking-tight flex items-center gap-1.5 ${isLive ? 'text-indigo-500' : 'text-amber-500'}`}>
                            <Clock size={12} className={isLive ? 'animate-spin-slow' : ''} />
                            {timeLeftStr}
                        </span>
                    ) : (
                        <div className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300 font-medium">
                            {assessment.date}
                        </div>
                    )}
                </div>
            </td>
            <td className="p-4 relative text-center">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {(assessment.durationMinutes ?? 0) > 0 ? `${assessment.durationMinutes}m` : '-'}
                </span>
            </td>
            <td className="p-4 relative text-center">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {(assessment.questionsCount ?? 0) > 0 ? assessment.questionsCount : '-'}
                </span>
            </td>
            <td className="p-4 relative text-center">
                <span className={`text-sm font-black ${getScoreColor(assessment.score)}`}>
                    {assessment.score || '-'}
                </span>
            </td>
            <td className="p-4 relative">
                <Badge variant={assessment.status} size="sm">
                    {assessment.status === 'open' ? 'Live Now' : 
                    assessment.status === 'coming soon' ? 'Coming Soon' :
                    assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
                </Badge>
            </td>
            <td className="p-4 relative text-center">
                <div className="flex items-center justify-center">
                    {isNavigating ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                        <div className="h-8 w-8 flex items-center justify-center rounded-full text-slate-300 group-hover:text-pink-600 group-hover:bg-pink-600/10 transition-colors">
                            <ChevronRight size={18} />
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
}
