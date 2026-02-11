interface Option {
    value: string;
    label: string;
}

interface Props {
    options: Option[];
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    className?: string;
}

export default function Select({ options, value, onChange, className = '' }: Props) {
    return (
        <div className={`relative ${className}`}>
            <select
                value={value}
                onChange={onChange}
                className="w-full appearance-none rounded bg-white dark:bg-background-dark border border-slate-200 dark:border-white/10 px-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 dark:text-slate-400">
                expand_more
            </span>
        </div>
    );
}