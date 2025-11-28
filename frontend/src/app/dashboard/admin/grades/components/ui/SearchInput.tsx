import { Search } from 'lucide-react';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export default function SearchInput({
    value,
    onChange,
    placeholder = "Search...",
    className = ""
}: SearchInputProps) {
    return (
        <div className={`relative w-full max-w-sm ${className}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-10 pl-10 pr-4 bg-white dark:bg-[#1C1C2D] border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-primary focus:border-primary text-sm"
            />
        </div>
    );
}