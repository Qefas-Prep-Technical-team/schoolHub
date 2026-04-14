import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordFieldProps = {
  label: string;
  placeholder: string;
  error?: boolean | string;
  errorMessage?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
};

export default function PasswordField({
  label,
  placeholder,
  error,
  errorMessage,
  value,
  onChange,
  onBlur,
  disabled = false,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const hasError = Boolean(error);
  
  return (
    <label className="flex flex-col w-full flex-1">
      <p className="text-[#0e121b] dark:text-slate-200 text-sm font-semibold leading-normal pb-2">
        {label}
      </p>
      <div className="flex w-full flex-1 items-stretch rounded-xl overflow-hidden shadow-sm group">
        <input
          className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-l-xl text-[#0e121b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border ${
            hasError
              ? "border-rose-500 bg-rose-50/50 dark:bg-rose-950/20"
              : "border-[#d0d7e7] dark:border-slate-800 bg-white dark:bg-slate-900"
          } h-12 placeholder:text-[#4d6599] dark:placeholder:text-slate-600 p-3 border-r-0 text-base font-medium leading-normal disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
          placeholder={placeholder}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
          className={`flex border ${
            hasError
              ? "border-rose-500 bg-rose-50/50 dark:bg-rose-950/20"
              : "border-[#d0d7e7] dark:border-slate-800 bg-white dark:bg-slate-900"
          } items-center justify-center px-4 rounded-r-xl border-l-0 text-slate-400 hover:text-primary dark:hover:text-emerald-500 transition-colors disabled:opacity-50`}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {(hasError || errorMessage) && (
        <p className="pt-2 text-[10px] font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400 animate-in fade-in slide-in-from-top-1 duration-300">
          {typeof error === 'string' ? error : errorMessage}
        </p>
      )}
    </label>
  );
}