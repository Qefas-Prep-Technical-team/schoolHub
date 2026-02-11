// src/components/UI/RadioButton.tsx
import React from 'react';

interface RadioButtonProps {
    label: string;
    name: string;
    value: string;
    defaultChecked?: boolean;
    onChange?: (value: string) => void;
}

const RadioButton: React.FC<RadioButtonProps> = ({
    label,
    name,
    value,
    defaultChecked = false,
    onChange,
}) => {
    return (
        <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-md px-4 has-[:checked]:bg-primary has-[:checked]:text-white text-text-light-secondary dark:text-dark-secondary text-sm font-medium leading-normal transition-colors">
            <span className="truncate">{label}</span>
            <input
                type="radio"
                name={name}
                value={value}
                defaultChecked={defaultChecked}
                onChange={(e) => onChange?.(e.target.value)}
                className="invisible w-0"
            />
        </label>
    );
};

export default RadioButton;