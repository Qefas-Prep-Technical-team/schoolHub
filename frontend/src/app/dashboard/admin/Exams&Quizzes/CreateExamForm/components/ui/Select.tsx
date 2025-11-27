interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    label: string;
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export default function Select({
    label,
    options,
    value,
    onChange,
    className = ''
}: SelectProps) {
    return (
        <label className="flex flex-col">
            <span className="text-sm font-medium pb-2 text-gray-700 dark:text-gray-300">
                {label}
            </span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`form-select w-full rounded-lg border-gray-300 dark:border-gray-700 bg-background-light dark:bg-background-dark focus:border-primary focus:ring-primary/50 text-gray-800 dark:text-gray-200 ${className}`}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    );
}