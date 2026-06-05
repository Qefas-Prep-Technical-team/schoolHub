import React from 'react';
import { format } from 'date-fns';
import { BookOpen, UserMinus, UserCheck, ShieldAlert, Award, Calendar, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HistoryEvent {
    id: string;
    date: string;
    type: string; // ENROLLMENT, WITHDRAWAL, GRADUATION, TRANSFER, EXPULSION, SYSTEM
    title: string;
    description: string;
    metadata: any;
    school?: { id: string; name: string; logoUrl?: string };
}

interface StudentHistoryTimelineProps {
    history: HistoryEvent[];
    primaryColor: string;
}

const getEventIcon = (type: string) => {
    switch (type) {
        case 'ENROLLMENT':
            return { icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' };
        case 'WITHDRAWAL':
        case 'TRANSFER':
            return { icon: UserMinus, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' };
        case 'GRADUATION':
            return { icon: Award, color: 'text-primary', bg: 'bg-primary/10' };
        case 'EXPULSION':
            return { icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10' };
        default:
            return { icon: BookOpen, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-800' };
    }
};

export function StudentHistoryTimeline({ history, primaryColor }: StudentHistoryTimelineProps) {
    if (!history || history.length === 0) {
        return (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                <div className="size-20 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-white/5">
                    <Calendar className="size-8 text-slate-300 dark:text-slate-600" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">No History Found</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        This student doesn't have any permanent records yet.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative pl-6 md:pl-8 py-6 space-y-12">
            {/* Vertical Line */}
            <div className="absolute left-[1.15rem] md:left-[1.65rem] top-8 bottom-8 w-px bg-gradient-to-b from-slate-200 via-slate-200 to-transparent dark:from-white/10 dark:via-white/10 dark:to-transparent" />

            {history.map((event, index) => {
                const { icon: Icon, color, bg } = getEventIcon(event.type);
                const isFirst = index === 0;

                return (
                    <div key={event.id} className="relative group">
                        {/* Timeline Node */}
                        <div className={cn(
                            "absolute -left-[3.35rem] md:-left-[4.35rem] size-14 md:size-16 rounded-[1.5rem] flex items-center justify-center border-[4px] border-white dark:border-slate-950 transition-all duration-500 shadow-xl z-10",
                            bg,
                            isFirst && "scale-110 shadow-2xl"
                        )}
                            style={event.type === 'GRADUATION' ? { backgroundColor: `${primaryColor}1A`, color: primaryColor } : {}}
                        >
                            <Icon size={24} className={cn(event.type !== 'GRADUATION' && color)} />
                            
                            {/* Pulse effect for newest event */}
                            {isFirst && (
                                <div className={cn(
                                    "absolute inset-0 rounded-[1.5rem] animate-ping opacity-20",
                                    event.type === 'GRADUATION' ? '' : bg.split(' ')[0]
                                )} style={event.type === 'GRADUATION' ? { backgroundColor: primaryColor } : {}} />
                            )}
                        </div>

                        {/* Content Card */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 md:p-8 hover:shadow-xl transition-all duration-300 ml-4 group-hover:-translate-y-1">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            {format(new Date(event.date), 'MMMM d, yyyy')}
                                        </span>
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                            bg, color
                                        )} style={event.type === 'GRADUATION' ? { backgroundColor: `${primaryColor}1A`, color: primaryColor } : {}}>
                                            {event.type}
                                        </span>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                            {event.title}
                                        </h3>
                                        {event.description && (
                                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">
                                                {event.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Context / Metadata */}
                                    {(event.school || event.metadata) && (
                                        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5 flex flex-wrap gap-4">
                                            {event.school && (
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                                    <div className="size-5 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                                                        {event.school.logoUrl ? (
                                                            <img src={event.school.logoUrl} alt={event.school.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <BookOpen size={10} />
                                                        )}
                                                    </div>
                                                    {event.school.name}
                                                </div>
                                            )}
                                            
                                            {event.metadata && Object.entries(event.metadata).map(([key, val]) => {
                                                if (key === 'schoolId' || typeof val !== 'string') return null;
                                                return (
                                                    <div key={key} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                                                        <span className="uppercase tracking-wider opacity-70">{key}:</span>
                                                        <span className="text-slate-700 dark:text-slate-300">{val}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Arrow indicator */}
                                <div className="hidden md:flex size-10 rounded-2xl bg-slate-50 dark:bg-slate-800 items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                                    <ChevronRight size={18} className="text-slate-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
