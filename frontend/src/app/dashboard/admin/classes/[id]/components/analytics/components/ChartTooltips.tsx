import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const TrendChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const dataPoint = payload[0].payload;
        const color = payload[0].color || payload[0].stroke || '#6366f1';
        const displayLabel = typeof label === 'string' ? label.split('|')[0] : label;
        return (
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 space-y-1 z-50 text-xs">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {displayLabel}
                </p>
                <p className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span>{dataPoint.subject || 'Assessment'}:</span>
                    <span style={{ color }}>{dataPoint.score}%</span>
                </p>
            </div>
        );
    }
    return null;
};

export const OverallPerformanceTooltip = ({ active, payload, label }: any) => {
    const [activeIndex, setActiveIndex] = React.useState(0);
    const [isPaused, setIsPaused] = React.useState(false);

    React.useEffect(() => {
        setActiveIndex(0);
    }, [label]);

    const lengthRef = React.useRef(0);

    React.useEffect(() => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload;
            const validPayloads = payload.filter((entry: any) =>
                dataPoint.realValues && dataPoint.realValues[entry.dataKey] !== undefined
            );
            lengthRef.current = validPayloads.length;
        }
    }, [active, payload]);

    React.useEffect(() => {
        if (!active || isPaused || lengthRef.current <= 1) return;

        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev < lengthRef.current - 1 ? prev + 1 : 0));
        }, 2500);

        return () => clearInterval(timer);
    }, [active, isPaused, label]);

    if (active && payload && payload.length) {
        const dataPoint = payload[0].payload;

        const validPayloads = payload.filter((entry: any) =>
            dataPoint.realValues && dataPoint.realValues[entry.dataKey] !== undefined
        );

        if (validPayloads.length === 0) return null;

        const safeIndex = Math.min(Math.max(activeIndex, 0), validPayloads.length - 1);
        const activeEntry = validPayloads[safeIndex];
        const realData = dataPoint.realValues[activeEntry.dataKey];

        const handlePrev = (e: React.MouseEvent) => {
            e.stopPropagation();
            setActiveIndex((prev) => (prev > 0 ? prev - 1 : validPayloads.length - 1));
        };

        const handleNext = (e: React.MouseEvent) => {
            e.stopPropagation();
            setActiveIndex((prev) => (prev < validPayloads.length - 1 ? prev + 1 : 0));
        };

        return (
            <div
                className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 min-w-[200px] max-w-[260px] pointer-events-auto"
                onWheel={(e) => e.stopPropagation()}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2.5">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        {label}
                    </p>

                    {validPayloads.length > 1 && (
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={handlePrev}
                                aria-label="Previous assessment"
                                className="size-5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition-colors"
                            >
                                <ChevronLeft size={12} />
                            </button>
                            <span className="text-[9px] font-bold text-slate-400 w-7 text-center">
                                {safeIndex + 1}/{validPayloads.length}
                            </span>
                            <button
                                type="button"
                                onClick={handleNext}
                                aria-label="Next assessment"
                                className="size-5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition-colors"
                            >
                                <ChevronRight size={12} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="space-y-1.5">
                    <p className="text-xs font-black tracking-tight" style={{ color: activeEntry.color }}>
                        {activeEntry.name}: {realData.avg}%
                    </p>
                    <div className="pl-2.5 border-l-2 border-slate-200 dark:border-slate-800 ml-1 mt-1.5">
                        {realData.subjects.length > 0 ? (
                            <div className="max-h-[120px] overflow-y-auto custom-scrollbar pr-1 space-y-1">
                                {realData.subjects.map((sub: any, i: number) => (
                                    <p key={i} className="text-[10px] font-medium text-slate-600 dark:text-slate-300 flex justify-between gap-3">
                                        <span className="truncate">{sub.subject}</span>
                                        <span className="font-bold shrink-0">{sub.score}%</span>
                                    </p>
                                ))}
                            </div>
                        ) : (
                            <p className="text-[10px] font-medium text-slate-400 italic">No breakdown available.</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

