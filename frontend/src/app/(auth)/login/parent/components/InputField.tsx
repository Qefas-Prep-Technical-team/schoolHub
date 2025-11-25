import { ChangeEvent, useState, forwardRef } from "react";

interface InputFieldProps {
    label: string;
    icon: string;
    type: string;
    placeholder: string;
    value?: string;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    onBlur?: () => void;
    required?: boolean;
    name?: string;
    ref?: React.Ref<HTMLInputElement>;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
    ({
        label,
        icon,
        type,
        placeholder,
        value,
        onChange,
        onBlur,
        required,
        name,
        ...props
    }, ref) => {
        const [showPassword, setShowPassword] = useState(false);

        const isPasswordField = type === "password";
        const inputType = isPasswordField && showPassword ? "text" : type;

        const togglePasswordVisibility = () => {
            setShowPassword(!showPassword);
        };

        return (
            <label className="flex flex-col min-w-40 flex-1">
                <p className="text-sm font-medium pb-2 text-text-light dark:text-text-dark">{label}</p>
                <div className="flex w-full items-stretch rounded-lg">
                    {/* Left Icon */}
                    <div className="flex items-center justify-center pl-4 border border-input-border-light dark:border-input-border-dark bg-input-light dark:bg-input-dark rounded-l-lg border-r-0 text-gray-400 dark:text-placeholder-dark">
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                            {icon}
                        </span>
                    </div>

                    {/* Input Field */}
                    <input
                        ref={ref}
                        type={inputType}
                        placeholder={placeholder}
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        required={required}
                        name={name}
                        {...props}
                        className="flex w-full h-12 p-3 border-y border-input-border-light dark:border-input-border-dark bg-input-light dark:bg-input-dark text-text-light dark:text-text-dark focus:outline-0 focus:ring-2 focus:ring-primary/50 text-base"
                    />

                    {/* Password Toggle Button */}
                    {isPasswordField && (
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="flex items-center justify-center pr-4 border border-input-border-light dark:border-input-border-dark bg-input-light dark:bg-input-dark rounded-r-lg border-l-0 text-gray-400 dark:text-placeholder-dark hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                                {showPassword ? 'visibility_off' : 'visibility'}
                            </span>
                        </button>
                    )}

                    {/* Non-password field right border */}
                    {!isPasswordField && (
                        <div className="flex items-center justify-center pr-4 border border-input-border-light dark:border-input-border-dark bg-input-light dark:bg-input-dark rounded-r-lg border-l-0">
                            <div className="w-4"></div>
                        </div>
                    )}
                </div>
            </label>
        );
    }
);

InputField.displayName = "InputField";

export default InputField;