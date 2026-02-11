interface TextareaProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    required?: boolean;
    disabled?: boolean;
    rows?: number;
}

export default function Textarea({
    label,
    value,
    onChange,
    placeholder,
    className = '',
    required = false,
    disabled = false,
    rows = 4
}: TextareaProps) {
    return (
        <label className="flex flex-col">
            <span className="pb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </span>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                rows={rows}
                className={`flex w-full min-h-[100px] resize-y overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-zinc-700 bg-background-light dark:bg-background-dark p-4 text-base leading-normal ${className}`}
            />
        </label>
    );
}