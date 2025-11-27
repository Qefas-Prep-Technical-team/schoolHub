interface TextareaProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
    className?: string;
}

export default function Textarea({
    label,
    value,
    onChange,
    placeholder,
    rows = 4,
    className = ''
}: TextareaProps) {
    return (
        <label className="flex flex-col">
            <span className="text-sm font-medium pb-2 text-gray-700 dark:text-gray-300">
                {label}
            </span>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className={`form-textarea w-full rounded-lg border-gray-300 dark:border-gray-700 bg-background-light dark:bg-background-dark focus:border-primary focus:ring-primary/50 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 ${className}`}
            />
        </label>
    );
}