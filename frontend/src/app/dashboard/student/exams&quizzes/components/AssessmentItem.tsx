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
}

export default function AssessmentItem({ assessment }: AssessmentItemProps) {
    const [timeLeftStr, setTimeLeftStr] = useState<string | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (assessment.status !== 'upcoming' && assessment.status !== 'active' && assessment.status !== 'ongoing') return;
        
        const updateTimer = () => {
            const now = new Date();
            const start = assessment.startDate ? new Date(assessment.startDate) : null;
            const end = assessment.endDate ? new Date(assessment.endDate) : null;

            if (start && now < start && assessment.status === 'upcoming') {
                const diff = start.getTime() - now.getTime();
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                if (hours < 24) {
                    setTimeLeftStr(`Starts in ${hours}h ${mins}m`);
                } else {
                    setTimeLeftStr(null);
                }
            } else if (end && now < end && (assessment.status === 'active' || assessment.status === 'ongoing')) {
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

    const isLive = assessment.status === 'active' || assessment.status === 'ongoing';

    return (
        <div 
            onClick={() => {
                if (isNavigating) return;
                setIsNavigating(true);
                router.push(`/dashboard/student/exams&quizzes/${assessment.id}`);
            }}
            className={cn(
                "group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all dark:border-slate-800 dark:bg-slate-900/50 dark:backdrop-blur-xl h-full flex flex-col justify-between cursor-pointer",
                isNavigating ? "opacity-90 pointer-events-none" : "hover:-translate-y-1 hover:shadow-xl"
            )}
        >
            {isNavigating && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/40 dark:bg-slate-950/40 backdrop-blur-[2px] transition-all">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}
                {/* Status Indicator Bar */}
                <div className={`absolute left-0 top-0 h-1 w-full opacity-60 transition-opacity group-hover:opacity-100 ${
                    isLive ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 
                    assessment.status === 'upcoming' ? 'bg-amber-500' :
                    'bg-slate-400'
                }`} />

                <div className="flex flex-col gap-4">
                    {/* Header: Title & Status */}
                    <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                            <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">
                                {assessment.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                <Activity size={12} className={isLive ? 'text-indigo-500 animate-pulse' : ''} />
                                {assessment.subject}
                            </div>
                        </div>
                        <div className="shrink-0">
                            <Badge variant={assessment.status} size="sm">
                                {assessment.status === 'active' ? 'Live Now' : 
                                assessment.status === 'taken' ? 'Submitted' :
                                assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
                            </Badge>
                        </div>
                    </div>

                    {/* Meta Info Grid */}
                    <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 dark:border-slate-800/30">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                                <Clock size={14} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Time</span>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{assessment.durationMinutes || 0}m</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                                <BookOpen size={14} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Tasks</span>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{assessment.questionsCount || 0} Qs</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer: Date/Score & Action */}
                <div className="flex items-center justify-between mt-4">
                    <div className="flex flex-col">
                        {timeLeftStr ? (
                            <span className={`text-[11px] font-black tracking-tight flex items-center gap-1.5 ${isLive ? 'text-indigo-500' : 'text-amber-500'}`}>
                                <Clock size={12} className={isLive ? 'animate-spin-slow' : ''} />
                                {timeLeftStr}
                            </span>
                        ) : (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                <Calendar size={12} />
                                {assessment.date}
                            </div>
                        )}
                    </div>

                    {assessment.score ? (
                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-white/5 px-2 py-1 rounded-lg">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Score:</span>
                            <span className={`text-xs font-black ${getScoreColor(assessment.score)}`}>
                                {assessment.score}
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 text-primary font-bold text-[11px] hover:translate-x-0.5 transition-transform">
                            <span>{isLive ? 'Start Now' : 'View'}</span>
                            <ChevronRight size={14} strokeWidth={3} />
                        </div>
                    )}
                </div>

                {/* Background Decoration */}
                <div className="absolute -right-4 -bottom-4 h-16 w-16 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
        </div>
    );
}
