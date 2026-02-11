interface InputProps {
    label: string;
    type?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    required?: boolean;
    disabled?: boolean;
    min?: number;
    max?: number;
}

export default function Input({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    className = '',
    required = false,
    disabled = false,
    min,
    max
}: InputProps) {
    return (
        <label className="flex flex-col">
            <span className="pb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </span>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                min={min}
                max={max}
                className={`flex w-full h-12 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-zinc-700 bg-background-light dark:bg-background-dark px-4 text-base leading-normal ${className}`}
            />
        </label>
    );
}