'use client';

import { AttendanceInsight } from './types';
import Card from './ui/Card';


interface AttendanceInsightsProps {
    insights: AttendanceInsight[];
    title?: string;
}

export default function AttendanceInsights({ insights, title = "Summary & Insights" }: AttendanceInsightsProps) {
    const getBgColor = (type: AttendanceInsight['type']) => {
        switch (type) {
            case 'positive':
                return 'bg-primary/10';
            case 'warning':
                return 'bg-amber-500/10';
            case 'info':
                return 'bg-blue-500/10';
            default:
                return 'bg-slate-100 dark:bg-slate-800';
        }
    };

    const getTextColor = (type: AttendanceInsight['type']) => {
        switch (type) {
            case 'positive':
                return 'text-primary';
            case 'warning':
                return 'text-amber-600 dark:text-amber-500';
            case 'info':
                return 'text-blue-600 dark:text-blue-500';
            default:
                return 'text-slate-700 dark:text-slate-300';
        }
    };

    return (
        <Card title={title} className="lg:max-w-xs">
            <div className="flex flex-col gap-3">
                {insights.map((insight, index) => (
                    <div
                        key={index}
                        className={`flex items-start gap-3 rounded-lg p-3 ${getBgColor(insight.type)}`}
                    >
                        <span className={`material-symbols-outlined text-xl mt-0.5 ${getTextColor(insight.type)}`}>
                            {insight.icon}
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 text-sm">
                            {insight.message}
                        </p>
                    </div>
                ))}
            </div>
        </Card>
    );
}