interface TimerUnitProps {
    value: string | number;
    label: string;
    className?: string;
}

export default function TimerUnit({ value, label, className = '' }: TimerUnitProps) {
    return (
        <div className={`flex grow basis-0 flex-col items-center gap-2 ${className}`}>
            <div className="flex h-16 w-full items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                <p className="text-2xl font-bold leading-tight tracking-[-0.015em] text-gray-900 dark:text-gray-50">
                    {value.toString().padStart(2, '0')}
                </p>
            </div>
            <p className="text-xs font-normal leading-normal text-gray-500 dark:text-gray-400">
                {label}
            </p>
        </div>
    );
}