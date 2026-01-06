interface LegendItem {
    color: string;
    label: string;
    description?: string;
}

interface CalendarLegendProps {
    items?: LegendItem[];
    className?: string;
}

export default function CalendarLegend({
    items = defaultLegendItems,
    className = ''
}: CalendarLegendProps) {
    return (
        <div className={`flex flex-wrap items-center gap-6 px-4 py-3 bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm ${className}`}>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mr-2">
                Legend
            </span>

            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {item.label}
                    </span>
                    {item.description && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            {item.description}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
}

const defaultLegendItems: LegendItem[] = [
    { color: '#10B981', label: 'Present' },
    { color: '#EF4444', label: 'Absent' },
    { color: '#F59E0B', label: 'Late' },
    { color: '#94A3B8', label: 'Holiday / Weekend', description: 'No school' },
];