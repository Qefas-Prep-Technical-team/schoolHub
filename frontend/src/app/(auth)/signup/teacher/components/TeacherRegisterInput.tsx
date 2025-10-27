"use client";

interface TeacherRegisterInputProps {
  label: string;
  type?: string;
  placeholder: string;
}

export default function TeacherRegisterInput({
  label,
  type = "text",
  placeholder,
}: TeacherRegisterInputProps) {
  return (
    <label className="flex flex-col">
      <span className="text-sm font-medium pb-2 text-slate-700 dark:text-slate-300">
        {label}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        className="form-input w-full rounded-lg border-slate-300 dark:border-slate-700 
        bg-slate-50 dark:bg-slate-800 h-12 px-4 text-slate-800 dark:text-white 
        placeholder:text-slate-400 dark:placeholder:text-slate-500 
        focus:border-primary focus:ring-primary/50"
      />
    </label>
  );
}
