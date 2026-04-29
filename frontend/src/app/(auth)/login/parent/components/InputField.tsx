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
            <label className="flex flex-col min-w-40 flex-1 group">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pb-2 ml-1 transition-colors group-focus-within:text-indigo-500">
                    {label}
                </p>
                <div className="flex w-full items-stretch rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 overflow-hidden focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all duration-300">
                    {/* Left Icon */}
                    <div className="flex items-center justify-center pl-5 text-slate-400 dark:text-slate-600 group-focus-within:text-indigo-500 transition-colors">
                        <span className="material-symbols-outlined !text-xl">
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
                        className="flex w-full h-14 px-4 bg-transparent text-slate-900 dark:text-white focus:outline-0 text-base font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    />

                    {/* Password Toggle Button */}
                    {isPasswordField && (
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="flex items-center justify-center pr-5 text-slate-400 dark:text-slate-600 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                        >
                            <span className="material-symbols-outlined !text-xl">
                                {showPassword ? 'visibility_off' : 'visibility'}
                            </span>
                        </button>
                    )}

                    {/* Non-password field right spacer */}
                    {!isPasswordField && <div className="pr-5" />}
                </div>
            </label>
        );
    }
);

InputField.displayName = "InputField";

export default InputField;
