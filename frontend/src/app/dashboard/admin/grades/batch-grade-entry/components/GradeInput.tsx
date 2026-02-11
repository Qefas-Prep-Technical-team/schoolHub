import { useState } from 'react';

interface GradeInputProps {
    value: number | null;
    max: number;
    hasError?: boolean;
    onChange: (value: number | null) => void;
    placeholder?: string;
}

export default function GradeInput({
    value,
    max,
    hasError = false,
    onChange,
    placeholder = "-"
}: GradeInputProps) {
    const [inputValue, setInputValue] = useState(value?.toString() || '');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);

        if (newValue === '') {
            onChange(null);
            return;
        }

        const numericValue = parseFloat(newValue);
        if (!isNaN(numericValue)) {
            onChange(numericValue);
        }
    };

    const handleBlur = () => {
        if (inputValue === '') {
            onChange(null);
        } else {
            const numericValue = parseFloat(inputValue);
            if (!isNaN(numericValue)) {
                // Validate range
                if (numericValue < 0) {
                    setInputValue('0');
                    onChange(0);
                } else if (numericValue > max) {
                    setInputValue(max.toString());
                    onChange(max);
                }
            }
        }
    };

    const getInputClass = () => {
        const baseClass = "w-24 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary focus:border-primary px-3 py-1 text-sm";

        if (hasError) {
            return `${baseClass} border-red-500 bg-red-50 dark:bg-red-900/20 focus:ring-red-500 focus:border-red-500`;
        }

        return `${baseClass} border-gray-300 dark:border-gray-600`;
    };

    return (
        <input
            type="number"
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
            min={0}
            max={max}
            placeholder={placeholder}
            className={getInputClass()}
        />
    );
}