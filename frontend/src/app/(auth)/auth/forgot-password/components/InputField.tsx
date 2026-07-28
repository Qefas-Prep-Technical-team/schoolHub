import { Mail } from "lucide-react";

interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  type?: string;
  disabled?: boolean;
}

export default function InputField({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  onBlur, 
  error, 
  type = "email",
  disabled = false 
}: InputFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
        {label}
      </label>
      <div className="relative">
        <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-400 dark:text-slate-500" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`flex w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white h-14 pl-12 pr-5 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-300 font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600 ${
            error ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/10' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
      </div>
      {error && (
        <p className="text-rose-500 text-[10px] font-bold mt-1.5 ml-2 uppercase tracking-wide animate-fadeIn">
          {error}
        </p>
      )}
    </div>
  );
}
