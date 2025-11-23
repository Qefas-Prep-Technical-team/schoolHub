// components/PasswordField.tsx
interface PasswordFieldProps {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: () => void;
    showPassword?: boolean;
    onTogglePassword?: () => void;
    placeholder?: string;
}

export default function PasswordField({
    value = "",
    onChange,
    onBlur,
    showPassword = false,
    onTogglePassword,
    placeholder = "Enter your password"
}: PasswordFieldProps) {
    return (
        <div className="relative flex w-full">
            <input
                type={showPassword ? "text" : "password"}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                className="w-full rounded-xl border border-[#cfd7e7] p-[15px] text-base text-[#0d121b] placeholder:text-[#4c669a] focus:border-primary focus:outline-0 dark:border-gray-600 dark:bg-background-dark/50 dark:text-white h-14 pr-12"
            />
            <button
                type="button"
                onClick={onTogglePassword}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-placeholder-light dark:text-placeholder-dark hover:text-text-light dark:hover:text-text-dark"
            >
                <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                </span>
            </button>
        </div>
    );
}