interface CheckboxProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export default function Checkbox({ label, checked, onChange }: CheckboxProps) {
    return (
        <label className="flex items-center justify-between p-4 rounded-lg bg-background-light dark:bg-background-dark border border-gray-200 dark:border-gray-800">
            <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="form-checkbox rounded text-primary focus:ring-primary/50 border-gray-400 dark:border-gray-600 dark:bg-gray-700"
            />
        </label>
    );
}